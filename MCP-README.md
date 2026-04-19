# TALLER ZERO - AI & MCP ARCHITECTURE

Este documento detalla la infraestructura de automatización de Taller Zero utilizando el Modelo Context Protocol (MCP) e Inteligencia Artificial. 

## 1. OBJETIVO DEL SISTEMA
Convertir a la IA en el cerebro operativo de Taller Zero para automatizar:
- Respuestas de atención al cliente (Tienda E-Commerce).
- Análisis de métricas en tiempo real (Base de Datos).
- Organización de postulaciones y logística (Notion / Calendar).
- Creación de contenido y publicación automatizada (Zapier / Instagram).

## 2. PILARES DE INTEGRACIÓN (MCPs)

### A. Notion MCP (Logística y Planner)
- **Función:** Conecta el ecosistema de IA con las bases de datos de Notion.
- **Casos de uso:** Leer postulaciones de DJs, revisar el calendario editorial, categorizar nuevos prospectos.
- **Requisito:** Token de Integración Interna de Notion.

### B. Zapier / Make MCP (Community Manager Automático)
- **Función:** Puente 100% legal hacia las APIs oficiales de Meta (Instagram/WhatsApp).
- **Casos de uso:** Publicación de sets en Instagram, programación de historias, respuestas a DMs predefinidos.
- **Requisito:** Webhooks configurados en Make.com o Zapier.

### C. PostgreSQL MCP (El Analista de Datos)
- **Función:** Conexión directa a nuestra base de datos Neon (Prisma).
- **Casos de uso:** Consultar ventas, stock de poleras, correos suscritos al newsletter.
- **Requisito:** URL de conexión a la base de datos (ReadOnly recomendado).

### D. Google Workspace MCP (Comunicaciones)
- **Función:** Control de Gmail, Calendar y Drive.
- **Casos de uso:** Agendar grabaciones de sesiones enviando invitaciones automáticas; responder dudas de despachos vía correo cruzando la info con la base de datos.
- **Requisito:** Credenciales OAuth de Google Cloud.

## 3. CÓMO CONFIGURAR (Modo Local / Claude Desktop)
Si un miembro del equipo va a correr la IA desde su computador usando la app oficial de Claude:

1. Instalar la app de escritorio de Claude.
2. Modificar el archivo `claude_desktop_config.json` (Windows: `%APPDATA%\Claude\claude_desktop_config.json`).
3. Añadir los servidores MCP requeridos (ej. `@modelcontextprotocol/server-postgres`).
4. **IMPORTANTE:** Nunca subir este archivo de configuración al repositorio público ni compartir contraseñas de la base de datos en texto plano.

## 4. FASES DE IMPLEMENTACIÓN RECOMENDADAS
- **Fase 1:** Setup Analítico (Lectura de la base de datos para métricas).
- **Fase 2:** Logística y Contenido (Conexión a Notion para leer el itinerario).
- **Fase 3:** Automatización de Marketing (Webhooks a Make/Zapier para publicar en RRSS).
- **Fase 4:** Comunicaciones Externas (Gmail para soporte de tienda).

---
*TALLER ZERO // ARCHIVO RESTRINGIDO*
