import { Resend } from 'resend';
import { escapeHtml } from './html';
import { getSiteUrl } from './mercadopago';
import { formatEventDateTime } from './dates';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = 'ventas@taller-zero.cl'; // Replace with a verified domain email in Resend

export async function sendPurchaseConfirmation(order: any) {
  try {
    const { id, customerEmail, customerName, totalAmount, items } = order;
    const orderNumber = id.slice(-6).toUpperCase();
    
    // Format items for email
    let itemsHtml = '<ul style="list-style-type: none; padding: 0;">';
    items.forEach((item: any) => {
        const title = escapeHtml(item.product?.title || 'Producto');
        const sizeStr = escapeHtml([item.size && ` (Talla: ${item.size})`, item.color && ` (Color: ${item.color})`].filter(Boolean).join(''));
        const price = (item.priceAtTime * item.quantity).toLocaleString('es-CL');
        itemsHtml += `<li style="margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
            <strong>${item.quantity}x ${title}${sizeStr}</strong><br>
            Precio: $${price}
        </li>`;
    });
    itemsHtml += '</ul>';

    const htmlContent = `
      <div style="font-family: monospace; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h1 style="color: #000; text-transform: uppercase; text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px;">¡Gracias por tu compra!</h1>
        <p>Hola <strong>${escapeHtml(customerName)}</strong>,</p>
        <p>Tu pago ha sido confirmado y ya estamos preparando tu pedido.</p>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin: 20px 0;">
          <h2 style="font-size: 16px; margin-top: 0; text-transform: uppercase;">Detalles del Pedido #${orderNumber}</h2>
          ${itemsHtml}
          <h3 style="text-align: right; margin-bottom: 0;">Total Pagado: $${totalAmount.toLocaleString('es-CL')}</h3>
        </div>

        <p>Te enviaremos otro correo con el número de seguimiento una vez que tu pedido sea despachado.</p>
        <br/>
        <p style="color: #666; font-size: 12px; text-align: center;">Taller Zero Team<br/>taller-zero.cl</p>
      </div>
    `;

    const data = await resend.emails.send({
      from: `Taller Zero <${FROM_EMAIL}>`,
      to: customerEmail,
      subject: `Confirmación de Pedido #${orderNumber} - Taller Zero`,
      html: htmlContent,
    });

    console.log(`Confirmation email sent for order ${orderNumber}`);
    return { success: true, data };
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    return { success: false, error };
  }
}

export async function sendShippingNotification(order: any) {
    try {
        const { id, customerEmail, customerName, trackingNumber, trackingCompany } = order;
        const orderNumber = id.slice(-6).toUpperCase();
        
        const htmlContent = `
          <div style="font-family: monospace; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h1 style="color: #000; text-transform: uppercase; text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px;">¡Tu pedido va en camino!</h1>
            <p>Hola <strong>${escapeHtml(customerName)}</strong>,</p>
            <p>¡Buenas noticias! Tu pedido <strong>#${orderNumber}</strong> ha sido entregado a la empresa de transporte.</p>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin: 20px 0; text-align: center;">
              <h2 style="font-size: 14px; margin-top: 0; text-transform: uppercase; color: #666;">Información de Envío</h2>
              <p style="font-size: 18px; margin: 10px 0;">Empresa: <strong>${escapeHtml(trackingCompany || 'No especificada')}</strong></p>
              <p style="font-size: 18px; margin: 10px 0;">Nº Seguimiento: <strong style="background: #e0e0e0; padding: 4px 8px;">${escapeHtml(trackingNumber || 'No especificado')}</strong></p>
            </div>
    
            <p>Puedes usar este número en el sitio web de la empresa de transportes para rastrear tu paquete.</p>
            <br/>
            <p style="color: #666; font-size: 12px; text-align: center;">Taller Zero Team<br/>taller-zero.cl</p>
          </div>
        `;
    
        const data = await resend.emails.send({
          from: `Taller Zero <${FROM_EMAIL}>`,
          to: customerEmail,
          subject: `📦 Tu pedido #${orderNumber} ha sido enviado - Taller Zero`,
          html: htmlContent,
        });
    
        console.log(`Shipping email sent for order ${orderNumber}`);
        return { success: true, data };
      } catch (error) {
        console.error('Error sending shipping email:', error);
        return { success: false, error };
      }
}

interface TicketsEmailOrder {
  id: string;
  buyerName: string;
  buyerEmail: string;
  totalAmount: number;
  accessToken: string;
  event: { title: string; startsAt: Date; venueName: string; venueAddress: string | null; minAge: number | null };
  tickets: { code: string; folio: number; ticketType: { name: string } }[];
}

// Correo con las entradas: un QR por entrada. El QR solo contiene el enlace de validación, sin datos personales.
export async function sendTicketsEmail(order: TicketsEmailOrder) {
  try {
    const siteUrl = getSiteUrl();
    const orderNumber = order.id.slice(-6).toUpperCase();
    const ticketsUrl = `${siteUrl}/entradas/${order.accessToken}`;
    const title = escapeHtml(order.event.title);

    const ticketsHtml = order.tickets.map((ticket, index) => `
      <tr>
        <td style="padding: 0 20px 20px 20px;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #111111; border: 1px solid #333333;">
            <tr>
              <td align="center" style="padding: 30px 20px;">
                <p style="color: #666666; font-size: 10px; text-transform: uppercase; letter-spacing: 3px; margin: 0 0 6px 0; font-weight: bold;">
                  ENTRADA ${index + 1} DE ${order.tickets.length} /// FOLIO ${String(ticket.folio).padStart(4, '0')}
                </p>
                <p style="color: #ffffff; font-size: 16px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 20px 0; font-weight: bold;">
                  ${escapeHtml(ticket.ticketType.name)}
                </p>
                <img src="${siteUrl}/api/qr/${ticket.code}" alt="Código QR de la entrada ${index + 1}" width="220" height="220" style="display: block; width: 220px; height: 220px; margin: 0 auto; border: 10px solid #ffffff;" />
              </td>
            </tr>
          </table>
        </td>
      </tr>`).join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${title}</title></head>
      <body style="background-color: #000000; color: #ffffff; font-family: 'Courier New', Courier, monospace; padding: 0; margin: 0; text-align: center;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #000000; padding: 40px 10px;">
          <tr><td align="center">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%; background-color: #050505; border: 2px solid #222222; text-align: center;">
              <tr>
                <td style="padding: 40px 20px 30px 20px; border-bottom: 2px solid #222222;">
                  <p style="color: #666666; letter-spacing: 3px; font-size: 10px; text-transform: uppercase; margin: 0 0 20px 0; font-weight: bold;">/// TUS ENTRADAS /// ORDEN #${orderNumber}</p>
                  <h1 style="font-size: 28px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 20px 0; color: #ffffff;">${title}</h1>
                  <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 6px 0; color: #ffffff;">${escapeHtml(formatEventDateTime(order.event.startsAt))}</p>
                  <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin: 0; color: #888888;">${escapeHtml([order.event.venueName, order.event.venueAddress].filter(Boolean).join(' — '))}</p>
                  ${order.event.minAge ? `<p style="font-size: 10px; text-transform: uppercase; letter-spacing: 2px; margin: 12px 0 0 0; color: #888888;">Evento para mayores de ${order.event.minAge} años</p>` : ''}
                </td>
              </tr>
              <tr>
                <td style="padding: 30px 20px;">
                  <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 6px 0; color: #888888;">COMPRADOR</p>
                  <p style="font-size: 18px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 6px 0; color: #ffffff;">${escapeHtml(order.buyerName)}</p>
                  <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin: 0; color: #888888;">TOTAL PAGADO: $${order.totalAmount.toLocaleString('es-CL')}</p>
                </td>
              </tr>
              ${ticketsHtml}
              <tr>
                <td style="padding: 10px 20px 40px 20px;">
                  <a href="${ticketsUrl}" style="display: inline-block; background-color: #ffffff; color: #000000; text-decoration: none; padding: 18px 36px; font-weight: 900; text-transform: uppercase; letter-spacing: 3px; font-size: 12px; border: 1px solid #ffffff;">VER MIS ENTRADAS</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 30px 20px; border-top: 2px solid #222222; background-color: #020202;">
                  <p style="color: #ff3333; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 12px 0; font-weight: bold;">CADA QR SIRVE PARA UN SOLO INGRESO. NO LO COMPARTAS EN REDES.</p>
                  <p style="color: #555555; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; margin: 0; line-height: 1.8;">PRESENTA EL QR EN LA ENTRADA DESDE TU TELÉFONO.<br>© TALLER ZERO — taller-zero.cl</p>
                </td>
              </tr>
            </table>
          </td></tr>
        </table>
      </body>
      </html>`;

    const { error } = await resend.emails.send({
      from: `Taller Zero <${FROM_EMAIL}>`,
      to: order.buyerEmail,
      subject: `Tus entradas para ${order.event.title} - Orden #${orderNumber}`,
      html,
    });

    if (error) {
      console.error(`Error enviando entradas de la orden ${orderNumber}:`, error.message);
      return { success: false };
    }
    return { success: true };
  } catch (error) {
    console.error('Error sending tickets email:', error);
    return { success: false };
  }
}
