# Enfoque de Integración: Flow.cl + Next.js (App Router)

Al observar que Flow.cl cuenta con documentación y código de ejemplo para **Node.js**, **¡tenemos excelentes noticias!** Sí nos sirve, y de hecho, es exactamente lo que necesitamos.

Nuestro proyecto está construido sobre **Next.js**, el cual es un framework "Fullstack". Esto significa que la parte del backend (las carpetas dentro de `src/app/api/...`) se ejecuta en un **entorno Node.js**. Por lo tanto, toda la lógica, ejemplos y librerías de Node.js provistas por Flow encajan a la perfección en nuestro backend.

A continuación se detalla la arquitectura y el enfoque paso a paso que implementaremos según nuestras capacidades actuales (Next.js 14, React, Prisma, y nuestro reciente enfoque estricto en seguridad con Zod y DOMPurify).

---

## 1. Arquitectura del Flujo de Pago (El enfoque correcto)

La regla de oro para pagos es **nunca exponer las credenciales en el Frontend**. La integración se dividirá entre el Cliente (React) y nuestro Servidor (Node.js/Next.js API).

### Gráfico del Flujo
1. **Cliente (React):** El usuario hace clic en "Pagar" en el carrito o checkout.
2. **Backend (Node.js - `/api/checkout`):** 
   - Recibe la petición (sanitizada con DOMPurify/Zod).
   - Crea un registro de la orden "Pendiente" en Prisma.
   - Utiliza la llave secreta (`FLOW_SECRET_KEY`) y el módulo nativo `crypto` de Node.js para firmar la petición.
   - Se comunica con la API de Flow.cl para solicitar la creación del pago.
3. **Flow.cl:** Retorna una URL de redirección y un token.
4. **Cliente (React):** Nuestro backend le pasa la URL al cliente y este redirecciona al flujo de pago seguro de Flow.
5. **Usuario:** Paga directamente en el portal de Flow.

---

## 2. El Webhook de Confirmación (Server-to-Server)

Una de las ventajas de Node.js en nuestro Next.js es que podemos exponer un Endpoint público para que Flow nos avise directamente cuando un usuario pagó o rechazó.

- **Endpoint:** `/api/webhooks/flow`
- **Funcionamiento:** 
  - Flow hace un `POST` a nuestra API notificando que el estado de un token ha cambiado.
  - Nuestro backend en Node.js hace una consulta a Flow pidiendo los detalles del pago de ese token.
  - **Base de Datos:** Actualizamos en Prisma el estado del pedido a `PAID` o `FAILED`.
  - **Seguridad:** Reutilizamos los validadores Zod que implementamos recientemente para asegurar que el payload inyectado por Flow es legítimo y seguro antes de tocar la base de datos.

---

## 3. Plan de Acción e Implementación

### Fase 1: Base de Datos y Variables de Entorno
- Añadir en `.env.local` las credenciales: `FLOW_API_KEY`, `FLOW_SECRET_KEY` y la URL del entorno de pruebas (Sandbox) de Flow.
- Actualizar `schema.prisma` para el modelo `Pedido`, añadiendo campos como `flowToken`, `flowStatus`, y `paymentMethod`.

### Fase 2: El Servicio Central de Flow (Node.js)
- Crear un archivo utilitario (ej. `src/lib/flowService.ts`).
- Copiar las lógicas de Node.js de Flow para generar la **Firma HMAC-SHA256**. Flow requiere que todos los parámetros se concatenen, se ordenen alfabéticamente y se firmen con el _Secret Key_. Node.js tiene el módulo `crypto` nativo que hace esto de forma impecable sin necesidad de dependencias extra.

### Fase 3: Rutas de la API de Next.js
- **`/api/checkout/route.ts`:** Construir el payload, firmar, llamar a Flow.cl, y devolver el redirect al Frontend.
- **`/api/webhooks/flow/route.ts`:** Escuchar las confirmaciones asíncronas desde Flow y actualizar Prisma.

### Fase 4: Integración en Frontend
- Un simple botón en `Checkout.tsx` que haga POST a nuestro `/api/checkout` y redirija usando `window.location.href = flowResponseUrl;`.

---

## Conclusión

El hecho de que exista documentación de Flow para Node.js es nuestro mejor escenario. **No necesitamos librerías raras de terceros ni exponer datos**. 

Nuestras capacidades actuales con Next.js App Router nos permiten crear exactamente la infraestructura requerida: Un entorno Node.js seguro para firmar peticiones y recibir webhooks, respaldado de validadores estrictos (Zod) y ORM tipado (Prisma).