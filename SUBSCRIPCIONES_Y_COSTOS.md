# 🚀 Infraestructura y Suscripciones - Taller Zero

Este documento detalla los servicios técnicos que mantienen operativa la plataforma, sus costos actuales y las proyecciones de gasto según el crecimiento del proyecto.

## 1. Estado Actual (Fase de Lanzamiento)
Actualmente, la plataforma opera al **99% con planes gratuitos**, optimizados para soportar el tráfico inicial sin gastos fijos mensuales.

| Servicio | Proveedor | Función | Costo Actual |
| :--- | :--- | :--- | :--- |
| **Hosting** | Vercel (Hobby) | Servidor donde vive la web | $0 USD |
| **Base de Datos** | Vercel Postgres | Registro de artistas, sesiones, QRs e inventario | $0 USD |
| **Media (Fotos/Video)** | Cloudinary | Almacenamiento de imágenes y clips del home | $0 USD |
| **Emails/Invitaciones** | Resend | Envío de correos VIP y de ganadores | $0 USD |
| **Dominio** | NIC.cl | Dirección `taller-zero.cl` | ~$10k CLP/año |

---

## 2. Plan de Escalabilidad (Cuándo empezar a pagar)

A medida que el tráfico aumente, estos son los saltos necesarios para evitar caídas del servicio:

### Fase 2: Crecimiento Moderado (Recomendada)
*   **Vercel Pro ($20 USD/mes):** Necesario cuando el tráfico supere los 100GB mensuales. Aumenta la velocidad y la seguridad de la base de datos.
*   **Resend Pro ($20 USD/mes):** Solo si se envían más de 3,000 correos en un mismo mes (eventos masivos).

### Fase 3: Alto Tráfico y Gran Almacenamiento
*   **Cloudinary:** El plan gratuito es limitado. Si se suben muchos videos en alta resolución, Cloudinary pedirá saltar a **$89 USD/mes**.
*   **Alternativa para ahorrar:** Cambiar a **Vercel Blob** o **Uploadthing ($10 USD/mes)**. Esto reduciría el gasto de media en un 80%.

---

## 3. Resumen de Gastos Proyectados

| Prioridad | Servicio | Costo Mensual Est. | Motivo |
| :--- | :--- | :--- | :--- |
| 1 | Vercel Pro | $20 USD | Estabilidad y ancho de banda |
| 2 | Dominio .cl | $1 USD | Renovación anual obligatoria |
| 3 | Media (Backup) | $10 USD | Solo si Cloudinary se queda corto |
| **TOTAL ESTIMADO** | | **~$31 USD/mes** | **Mantención Profesional** |

---

## 4. Recomendaciones para los Socios
1.  **Optimización de Medios:** Antes de subir videos a la web, deben estar comprimidos. Esto nos ahorra cientos de dólares en almacenamiento.
2.  **Uso de YouTube:** Para videos largos (sesiones completas), usar siempre YouTube para no cargar nuestro servidor.
3.  **Monitoreo:** El equipo técnico revisará mensualmente el consumo de "Bandwidth" en Vercel para avisar antes de llegar al límite del plan gratis.

---
*Ultima actualización: Abril 2024*
