# Cerebro · Arquitectura base (09/11/2026)

## Principio: cero tokens primero
1. **SQL/hash (gratis):** deduplicar exactos (`huella`), detectar parecidos (`pg_trgm`), archivos por `hash_contenido`.
2. **IA barata en lote (1 llamada):** solo lo nuevo y parecido. Modelo `gpt-5-mini` con créditos n8n → respaldo Claude.
3. **Paulo:** solo credenciales/claves nuevas y contradicciones.

## Piezas
| Pieza | Dónde | Qué hace |
|---|---|---|
| Claude Code (nube) | esta sesión | Planifica y construye workflows vía MCP de n8n (sin pedir permiso salvo credenciales) |
| 11 · Puente Central | n8n `/webhook/puente` | Entrada única desde ChatGPT/apps: claude, chatgpt, drive, cerebro. Respaldo cruzado ChatGPT↔Claude |
| 14 · Entrada universal | n8n `/webhook/entrada` | Texto/archivos de Claude, ChatGPT, WhatsApp → Drive + Cerebro |
| 50 · Consolidador | n8n, cada 3 h | Duplicados semánticos → `unificado_en`; contradicciones → `cerebro_contradicciones` |
| 51 · Cazador de automatizaciones | n8n, diario 3:17 | Propone hasta 5 automatizaciones → `cerebro_automatizaciones` |
| Supabase Cerebro Central | `iivlxkmuyzevombqwwmd` | Fuente única: ítems, skills, dudas, errores, archivos |

## Funciones Supabase
- `cerebro_ingresar_item(chat, tipo, texto, area)` → `nuevo` o `duplicado` (suma `veces_visto`).
- `cerebro_parecidos(id)` → candidatos similares.
- `cerebro_lote_consolidar` / `cerebro_aplicar_consolidacion`.
- `cerebro_lote_automatizar` / `cerebro_registrar_automatizaciones`.

## ChatGPT → n8n
Acción de GPT personalizado con `puente/chatgpt-action-openapi.json` (header `x-clave-puente`).
