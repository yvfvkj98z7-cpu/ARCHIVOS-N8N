# Inventario n8n nube · electronic.app.n8n.cloud

Foto al **19/11/2026**: 43 workflows (27 activos) y 2 agentes. Este archivo se actualiza en cada integración a `main`.

## Activos
| # | Workflow | Qué hace |
|---|---|---|
| 01 | Clima y Estrenos Diario | Aviso diario |
| 03 | Publicador WhatsApp · Electronic Home | Publica producto con pie y precios (Evolution API, pide clave; sin IA) |
| 10 | Cerebro · Ingesta automática | Cada 15 min: Drive "Cerebro · Entrada" → clasificar → Supabase |
| 11 | Puente central | `POST /webhook/puente` (claude, chatgpt, drive, cerebro); respaldo Gemini |
| 12 | Cerebro · Ciclo diario | Cada noche: lo que cambió en Drive → Cerebro |
| 13 | Cerebro · Procesar un archivo | Sub-workflow: lee y clasifica (capturas de pedidos, seguimiento, pagos y deudas, ventas para conciliación) |
| 14 | Cerebro · Entrada universal | `POST /webhook/entrada`, WhatsApp Importaciones (incluye notas de venta y de Gestión), `GET /webhook/bandeja` |
| 15 | Panel ventas · Carga en Floot | Ingresos, negociaciones y clientes → Floot |
| 20 | Bóveda: revisión diaria | Decisiones de cuentas por WhatsApp en múltiple choice |
| 21 | Bóveda: registrar cuenta | Alta de cuentas y conexiones (rechaza claves) |
| 22 | Pancho · Estadísticas YouTube | Feed público + plan B; YouTube devuelve 404 a n8n (falta clave de YouTube Data API) |
| 24 | Sincronizar Bóveda a tablas n8n | Nocturno |
| 25 | Informes de rutinas | Claude propone soluciones |
| 30 | Integración app · Eventos de Gestión | Avisos a Importaciones (clave nueva; la vieja sigue temporal) |
| 31 | Integración app · Sync catálogo proveedor | Diario + por link (clave propia) |
| 32 | Integración app · Resumen diario | ChatGPT → Claude → Gemini |
| 50 | Consolidador + Resolutor de dudas + Guardián | Cada 3 h; SQL gratis primero, IA en lote |
| 51 | Cazador de automatizaciones | Diario 3:17 |
| 52 | Panel de Paulo | `GET /webhook/panel?k=…` tareas y múltiple choice |
| 98 | Seguridad Supabase | Cada 6 h |
| 99 | Alertas de error | Error workflow de todo el Cerebro |
| — | Cerebro · Envío manual de video a Importaciones | `POST` con campo `video` y clave del puente |
| — | Mensajes Multicanal → Asistente IA | Messenger / Instagram / TikTok (revisar: ramas duplicadas) |

## Inactivos (borradores o históricos)
- **40 Clasificador de gestión**: listo con Gemini + Claude; se prende si se usa.
- **60 Pancho · Fábrica de videos IA multi-cuenta**: borrador, 4 turnos por día con Veo.
- **Cerebro · Envío manual de foto a Importaciones**: borrador.
- **23 WhatsApp: listar grupos**: herramienta manual.
- Históricos de julio: 00 Orquestador, 00 Afiliados ML, 02 Catálogos, CTWA 1 y 2, MASTER_00, CONTENT_00, Registrar Venta, Control de capturas, Puente local piloto, Setup carpetas, My workflow y similares. Candidatos a archivar.

## Agentes n8n
- **Resolutor · Electronic Home**: publicado; usa OpenAI sin saldo → necesita clave Gemini.
- **Centro de cuentas de IA y mails**: borrador, sin acceso MCP.
