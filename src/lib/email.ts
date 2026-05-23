import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = 'ventas@taller-zero.cl'; // Replace with a verified domain email in Resend

export async function sendPurchaseConfirmation(order: any) {
  try {
    const { id, customerEmail, customerName, totalAmount, items } = order;
    const orderNumber = id.slice(-6).toUpperCase();
    
    // Format items for email
    let itemsHtml = '<ul style="list-style-type: none; padding: 0;">';
    items.forEach((item: any) => {
        const title = item.product?.title || 'Producto';
        const sizeStr = item.size ? ` (Talla: ${item.size})` : '';
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
        <p>Hola <strong>${customerName}</strong>,</p>
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

    console.log(`Confirmation email sent to ${customerEmail}`, data);
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
            <p>Hola <strong>${customerName}</strong>,</p>
            <p>¡Buenas noticias! Tu pedido <strong>#${orderNumber}</strong> ha sido entregado a la empresa de transporte.</p>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin: 20px 0; text-align: center;">
              <h2 style="font-size: 14px; margin-top: 0; text-transform: uppercase; color: #666;">Información de Envío</h2>
              <p style="font-size: 18px; margin: 10px 0;">Empresa: <strong>${trackingCompany || 'No especificada'}</strong></p>
              <p style="font-size: 18px; margin: 10px 0;">Nº Seguimiento: <strong style="background: #e0e0e0; padding: 4px 8px;">${trackingNumber || 'No especificado'}</strong></p>
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
    
        console.log(`Shipping email sent to ${customerEmail}`, data);
        return { success: true, data };
      } catch (error) {
        console.error('Error sending shipping email:', error);
        return { success: false, error };
      }
}
