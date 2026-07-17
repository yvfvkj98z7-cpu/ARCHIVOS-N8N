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
