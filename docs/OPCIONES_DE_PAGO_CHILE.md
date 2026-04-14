# Opciones de Pasarelas de Pago y Requisitos Legales en Chile

Este documento detalla las principales opciones de pasarelas de pago disponibles en Chile para comercio electrónico, los requerimientos técnicos para implementar sus APIs y el marco legal que se debe cumplir según la normativa chilena.

---

## 1. Principales Plataformas de Pago en Chile

A continuación, se presentan las opciones más utilizadas y confiables en el mercado chileno para procesar pagos online.

### 1.1. Transbank (Webpay Plus)
Es la pasarela más tradicional y conocida en Chile, procesando pagos con tarjetas de débito, crédito y prepago (Redcompra).
- **Ventajas:** Alta confianza por parte del consumidor chileno.
- **Modelo:** Comisión por transacción (aprox. 1,49% - 2,95% + IVA dependiendo del rubro y volumen).
- **API (Transbank Developers):** Requiere uso de SDKs oficiales, validación de certificados y tokens. Es más robusta pero cuenta con buena documentación.
- **Requisitos:** Requiere estar constituido formalmente (Inicio de actividades en SII) y firmar un contrato comercial previo.

### 1.2. Mercado Pago
Plataforma de Mercado Libre, muy popular por su facilidad de integración y opciones de pago.
- **Ventajas:** Permite pagos con tarjetas, saldo en cuenta Mercado Pago, transferencias y opciones como pago en cuotas o efectivo (Servipag).
- **Modelo:** Comisión escalonada dependiendo de cuándo se quiere el dinero disponible (hasta aprox. 3,19% + IVA por liberación inmediata).
- **API:** RESTful API moderna, SDKs disponibles en múltiples lenguajes, fácil configuración de Webhooks. Modalidad Checkout Pro (redirección) o Checkout API (nativo).
- **Requisitos:** Puede ser usada como Persona Natural o Jurídica.

### 1.3. Flow
Agregador de pagos chileno que incluye múltiples medios bajo una sola integración.
- **Ventajas:** Con una sola API integra Webpay Plus, Servipag, Mach, Khipu, Check, Onepay, entre otros.
- **Modelo:** Comisión plana por transacción (aprox. 2,89% a 3,19% + IVA dependiendo del medio).
- **API:** Muy sencilla de integrar, basada en firmas criptográficas (HMAC) o REST simple con SDKs para Node.js, PHP, etc.
- **Requisitos:** Funciona para Personas Naturales o Empresas. Verificación de identidad estricta.

### 1.4. Khipu / Fintoc
Enfocados principalmente en transferencias bancarias simplificadas (A2A - Account to Account).
- **Ventajas:** Alta tasa de conversión para quienes prefieren no usar tarjetas o no las poseen. Menores costos de transacción (comisiones fijas o bajo %).
- **Modelo Khipu:** Comisión % o fija por transacción.
- **Modelo Fintoc:** Orientado a desarrolladores, permite iniciar transferencias directas desde el portal bancario del cliente.
- **Requisitos:** Integración técnica y cuenta corriente asociada.

### 1.5. Stripe (Disponible en Chile)
Pasarela global que recientemente ha expandido operaciones en Chile.
- **Ventajas:** Ecosistema de desarrollo superior (posiblemente la mejor API del mercado), ideal para cobros recurrentes (suscripciones) o alcance global.
- **Modelo:** Aprox. 2,9% + $100 CLP por cobros locales.
- **Requisitos:** Estar constituido como empresa y contar con una cuenta bancaria para payouts.

---

## 2. Requerimientos para Implementar APIs de Pago

Sin importar la pasarela elegida, implementar una API de pagos en un Ecommerce (como en Next.js/React) requiere los siguientes aspectos técnicos y de seguridad:

1. **Certificado SSL (HTTPS):** Obligatorio en todo el sitio web para proteger las transacciones y asegurar la confidencialidad de los datos.
2. **Entornos Seguros para Credenciales:** Uso estricto de variables de entorno (`.env`) para almacenar `Access Tokens`, `Secret Keys` y evitar filtraciones en el repositorio.
3. **Webhooks / Endpoints (Callbacks):** 
   - El backend debe tener expuestas rutas (ej. `/api/webhooks/mercadopago`) para recibir notificaciones asíncronas sobre el estado del pago (Ej: `approved`, `rejected`).
4. **Resiliencia (Manejo de Errores):** Lógica robusta para tratar fallos de conexión, Timeouts o reversos de transacciones ("Refunds").
5. **No guardar datos de tarjetas en bases de datos propias:** Salvo que cuentes con certificación PCI-DSS, la captura del número de tarjeta debe realizarse mediante componentes provistos nativamente por la pasarela (ej. Mercado Pago CardForm) o redirecciones al portal del proveedor (Checkout).

---

## 3. Requerimientos Legales en Chile para un E-Commerce

Para operar un comercio electrónico y cobrar mediante pasarelas locales, se requiere cumplir con la normativa del Servicio de Impuestos Internos (SII) y del Servicio Nacional del Consumidor (SERNAC).

### 3.1. Obligaciones Tributarias (SII)
1. **Inicio de Actividades:** Se debe tener inicio de actividades en el SII, típicamente bajo giros asociados a "Venta al por menor por internet" u afines.
2. **Emisión de Documentos Tributarios Electrónicos (DTE):** 
   - Se debe entregar Boleta Electrónica o Factura por cada transacción.
   - Si se usa **Transbank / Webpay**, por ley, el *voucher* de Transbank reemplaza la boleta para pagos con tarjeta, pero es recomendable integrarse con un sistema de facturación (como Bsale o LibreDTE) para centralizar la gestión o atender pagos por transferencias (Khipu/Fintoc).

### 3.2. Derechos del Consumidor (SERNAC y Ley 19.496)
1. **Derecho a Retracto:** 
   - La nueva **Ley Pro-Consumidor (Ley 21.398)** establece que los consumidores en compras online tienen derecho a retractarse sin expresión de causa dentro de **10 días** desde la recepción del producto. Para eximirse de esto, la tienda debe indicarlo expresa e inequívocamente (y aplica solo para bienes no devolubles como perecederos o hechos a medida).
2. **Garantía Legal (Ley Pro-Consumidor):**
   - El consumidor tiene un plazo de **6 meses** desde que recibe el producto para pedir devolución de dinero, cambio o reparación de un producto que salga defectuoso de fábrica.
3. **Plazos y Tiempos de Despacho:**
   - La tienda electrónica debe informar claramente todos los tiempos, costos y condiciones de despacho antes de que el cliente realice el pago. Retrasos injustificados son sancionados.
4. **Información de Precios:**
   - Todo precio publicado en la web chilena **debe incluir el IVA**. El consumidor no debe pagar sobrecargos ocultos al final del checkout.

### 3.3. Protección de Datos Personales (Ley 19.628)
- El comercio solo puede recolectar la información esencial para prestar el servicio.
- Debe existir una política clara de cómo y quién manejará los correos electrónicos, RUT y teléfonos de los usuarios.
- Prohibición de transmitir o vender la base de datos a terceros sin un consentimiento explícito opt-in.

---

## 4. Próximos Pasos para la Implementación (Checklist)

1. [ ] **Definir Empresa o Persona Natural:** Permite elegir la pasarela (ej. Mercado Pago es ideal para empezar rápido si aún no hay conformación legal completa).
2. [ ] **Redactar y Publicar:**
   - [ ] Términos y Condiciones.
   - [ ] Políticas de Privacidad.
   - [ ] Políticas de Envío, Cambios y Devoluciones (Garantía Legal).
3. [ ] **Seleccionar Pasarela Principal:** Generalmente **Mercado Pago** o **Flow** para una adopción omnicanal más sencilla, o **Stripe / Transbank** si se tienen recursos técnicos y formalidad.
4. [ ] **Crear Cuentas Developer:** Generar credenciales Sandbox (pruebas).
5. [ ] **Integrar API / SDK:** Desarrollar en el backend de Next.js (`/app/api/...`) la lógica de cobro y webhooks de validación de estado de transacción.