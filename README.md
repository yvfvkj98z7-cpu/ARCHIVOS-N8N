# ARCHIVOS-N8N

Repositorio con un workflow base de n8n para recibir archivos por `webhook` y un archivo de ejemplo para probar la carga.

## Contenido

- `workflows/recepcion-archivos-n8n.json`: workflow importable en n8n.
- `samples/archivo-ejemplo.txt`: archivo simple para probar el envío.

## Cómo usarlo

1. Importa `workflows/recepcion-archivos-n8n.json` en n8n.
2. Activa el workflow.
3. Envía un archivo al webhook usando `multipart/form-data`.

Ejemplo:

```bash
curl -X POST \
  -F "archivo=@samples/archivo-ejemplo.txt" \
  http://localhost:5678/webhook/recepcion-archivos
```

La respuesta devuelve un JSON con la fecha de recepción, la cantidad de archivos recibidos y sus metadatos básicos.

## 60 - PANCHO · Fábrica de videos IA multi-cuenta

Código fuente (n8n Workflow SDK): `workflows/sdk/60-fabrica-videos-ia.ts`.
En n8n: workflow `cqorbFXHS3lqxCKj` (inactivo hasta cargar credenciales).

- 4 turnos por día (9, 13, 17 y 21 h, hora de Argentina).
- Pool de cuentas en la tabla n8n `fabrica_cuentas_ia` (slot 1-5, cupo diario, usos del día, activa). Elige sin IA la cuenta con más cupo libre y rota entre todas.
- Guion con créditos gratis de n8n (respaldo: cuenta OpenAI propia).
- Video vertical 9:16 de 8 s con Veo, con la credencial `Gemini · Cuenta N` del slot elegido.
- Si una cuenta falla o se queda sin créditos, queda marcada por hoy y el próximo turno usa otra.
- Publica en YouTube, registra en `fabrica_videos` (para no repetir ideas) y avisa por WhatsApp.
- Las estadísticas siguen saliendo del workflow 22.
