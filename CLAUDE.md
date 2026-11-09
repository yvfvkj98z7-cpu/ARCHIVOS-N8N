# Cerebro Central · memoria del proyecto

Paulo (Electronic Home, Lobos). Trabaja solo y desde el celular: respuestas breves, todo lo más automático posible, y las preguntas juntas en un solo mensaje.

## Objetivo
Un "equipo" de IAs que se pasa el trabajo y se reparte los problemas:
- **Entradas:** Claude Code (web y Chrome), ChatGPT web, n8n local (en otra cuenta), el grupo de WhatsApp Importaciones y Meta AI.
- **Palabra clave:** `Cerebrooo`. Junta lo pendiente de la conversación (prompts y archivos) y lo manda al n8n de la nube.
- **n8n nube** (electronic.app.n8n.cloud): clasifica, ordena, guarda skills y aprendizajes y corrige errores. Si hace falta, devuelve el resultado al n8n local o a WhatsApp.
- **Resolución de errores:** primero el agente Resolutor de n8n; si está caído u ocupado, Claude Code o ChatGPT. Siempre con un modelo de respaldo.
- Lo más importante es la prolijidad desde el principio, para que la carga masiva de datos después rinda.

## Piezas que ya existen en n8n nube
- 14 Entrada universal: `POST /webhook/entrada` (header `x-clave-puente`), `GET /webhook/entrada-link`, WhatsApp, `GET /webhook/bandeja`.
- 13 Procesar un archivo · 10 Ingesta · 12 Ciclo diario: Drive → clasificar → Supabase Cerebro Central.
- 11 Puente central (cuentas e IAs) · 40 Clasificador de gestión · 25 Informes de rutinas.
- Agente "Resolutor · Electronic Home": tablas resolutor_aprendizajes e informes_rutinas, revisión diaria a las 07:10.
- 99 Alertas de error → cerebro_errores + WhatsApp.

## Reglas
- Nunca guardar contraseñas, tokens ni claves en el Cerebro ni en este repo.
- MGS y Electronic son proyectos separados.
- Toda IA de un workflow necesita un respaldo con onError, para que si falla una siga la otra.
