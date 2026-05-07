# Plan de Refactorización y Buenas Prácticas: Taller Zero

Este documento detalla el plan paso a paso para saldar la deuda técnica de la plataforma, priorizando la seguridad y estabilidad, y asegurando que las modificaciones se realicen de forma incremental y segura para no romper las funcionalidades existentes.

---

## 🔴 Fase 1: Seguridad Crítica (Prioridad Alta)
**Objetivo:** Proteger los endpoints vulnerables para evitar modificaciones no autorizadas.
**Riesgo de implementación:** Bajo (solo añade una capa de chequeo al inicio de las rutas).

1. **Asegurar Endpoints de la API Administrativa**
   - **Archivos objetivo:** `src/app/api/admin/save/route.ts` y cualquier otro bajo `/api/admin/`.
   - **Acción:** Importar `getServerSession(authOptions)` de `next-auth` y añadir una validación estricta al principio de la función `POST` o `GET`.
   - **Resultado esperado:** Si un usuario sin sesión (o no autorizado) intenta hacer una petición HTTP a estos endpoints, se le retornará un estatus `401 Unauthorized` inmediatamente, protegiendo la base de datos.

---

## 🟠 Fase 2: Robustez de Datos y Base de Datos (Prioridad Media-Alta)
**Objetivo:** Asegurar la integridad de los datos en Postgres y mejorar la tipificación.
**Riesgo de implementación:** Medio (requiere modificar cómo Prisma hace las consultas).

1. **Implementar Transacciones de Prisma (`$transaction`)**
   - **Archivos objetivo:** `src/app/api/admin/save/route.ts` (Específicamente en la lógica de `page === 'sessions'`).
   - **Acción:** Envolver el borrado de artistas (`prisma.artist.deleteMany`) y la posterior creación (`prisma.session.update`) dentro de una transacción.
   - **Resultado esperado:** Si ocurre un error al actualizar la sesión después de borrar los artistas, la base de datos hará un *rollback* automático, revirtiendo el borrado y evitando dejar datos huérfanos.

2. **Tipado Estricto con Zod**
   - **Archivos objetivo:** `src/app/api/admin/save/route.ts` (Sección de Schemas).
   - **Acción:** 
     - Eliminar `z.any()` del campo `infoSquares` y reemplazarlo por un esquema estricto (ej. `z.array(z.object({...}))`).
     - Estandarizar la sanitización de strings usando el encadenamiento de Zod correctamente o una función middleware dedicada.
   - **Resultado esperado:** Prevención total de inyección de payloads maliciosos o JSON mal formados en el editor de About.

---

## 🟡 Fase 3: Refactorización Arquitectónica (Prioridad Media)
**Objetivo:** Desacoplar la lógica y evitar el "código espagueti" (Fat Controllers).
**Riesgo de implementación:** Medio-Alto (requiere mover código entre archivos).

1. **Extraer Lógica de Negocio a "Services"**
   - **Archivos objetivo:** Crear carpeta `src/services/` o `src/actions/`.
   - **Acción:** Extraer la lógica de Cloudinary (`destroyCloudinaryFile`) y las interacciones gigantescas de Prisma fuera del archivo `route.ts`. Convertirlos en funciones de un solo propósito (ej: `updateHomeContent(data)`, `updateSession(data)`).
   - **Resultado esperado:** El archivo `route.ts` pasará de 400 líneas a ~100 líneas, siendo mucho más fácil de leer, mantener y testear.

---

## 🟢 Fase 4: Optimización del Frontend (Prioridad Baja, Mejora Constante)
**Objetivo:** Cumplir con los estándares de Vercel para mejorar el SEO y rendimiento (LCP).
**Riesgo de implementación:** Bajo.

1. **Migración a `next/image`**
   - **Archivos objetivo:** Toda la carpeta `src/components/` y `src/app/`.
   - **Acción:** Identificar progresivamente el uso de etiquetas `<img src="...">` (especialmente las que provienen de Cloudinary) y reemplazarlas por `<Image />` importado de `next/image`.
   - **Acción Adicional:** Configurar el archivo `next.config.mjs` para permitir el dominio de Cloudinary en `remotePatterns`.
   - **Resultado esperado:** Las imágenes pesadas se servirán automáticamente en formato moderno (WebP) y optimizadas según el tamaño de la pantalla, disparando la velocidad de carga en métricas como Google Lighthouse.
