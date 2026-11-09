import { workflow, node, trigger, sticky, newCredential, switchCase, expr } from '@n8n/workflow-sdk';

const cadaTurno = trigger({
  type: 'n8n-nodes-base.scheduleTrigger',
  version: 1.2,
  config: {
    name: 'Turnos 09-13-17-21 h',
    parameters: { rule: { interval: [{ field: 'cronExpression', expression: '0 9,13,17,21 * * *' }] } }
  }
});

const aMano = trigger({
  type: 'n8n-nodes-base.manualTrigger',
  version: 1,
  config: { name: 'Probar a mano' }
});

const leerCuentas = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Leer pool de cuentas IA',
    parameters: {
      resource: 'row',
      operation: 'get',
      dataTableId: { __rl: true, mode: 'id', value: 'tZVg2ZEKVS6rgWPi', cachedResultName: 'fabrica_cuentas_ia' },
      matchType: 'allConditions',
      filters: { conditions: [{ keyName: 'activa', condition: 'isTrue' }] },
      returnAll: true
    }
  },
  output: [{ id: 1, slot: 1, servicio: 'veo', cuenta: 'cuenta1@gmail.com', cupo_diario: 2, usados_hoy: 0, fecha_uso: '', activa: true }]
});

const elegirCuenta = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Elegir cuenta con cupo (sin IA)',
    parameters: {
      mode: 'runOnceForAllItems',
      jsCode: "const hoy = $now.setZone('America/Argentina/Buenos_Aires').toISODate();\nconst filas = $input.all().map(i => i.json).map(r => ({ ...r, usados: r.fecha_uso === hoy ? (Number(r.usados_hoy) || 0) : 0 }));\nconst libres = filas.filter(r => r.usados < (Number(r.cupo_diario) || 1)).sort((a, b) => a.usados - b.usados || a.slot - b.slot);\nif (!libres.length) return [];\nconst c = libres[0];\nreturn [{ json: { row_id: c.id, slot: Number(c.slot), cuenta: c.cuenta, servicio: c.servicio, cupo_diario: Number(c.cupo_diario) || 1, usados_nuevo: c.usados + 1, hoy } }];"
    }
  },
  output: [{ row_id: 1, slot: 1, cuenta: 'cuenta1@gmail.com', servicio: 'veo', cupo_diario: 2, usados_nuevo: 1, hoy: '2026-11-09' }]
});

const leerHistorial = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Leer últimos videos (no repetir)',
    executeOnce: true,
    alwaysOutputData: true,
    parameters: {
      resource: 'row',
      operation: 'get',
      dataTableId: { __rl: true, mode: 'id', value: 'JzBPSRWA0HApodKt', cachedResultName: 'fabrica_videos' },
      limit: 30,
      orderBy: true,
      orderByColumn: 'createdAt',
      orderByDirection: 'DESC'
    }
  },
  output: [{ id: 1, titulo: 'Pancho y el lunes', estado: 'publicado' }]
});

const armarPedido = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Armar pedido de guion',
    parameters: {
      mode: 'runOnceForAllItems',
      jsCode: "const cuenta = $('Elegir cuenta con cupo (sin IA)').first().json;\nconst usados = $input.all().map(i => i.json.titulo).filter(Boolean).slice(0, 30);\nconst tema = 'YouTube Shorts del canal @elperezosopancho: Pancho, un perezoso simpático, en situaciones cotidianas graciosas. Español rioplatense, humor apto para todo público.';\nconst pedido = 'Tema del canal: ' + tema + '\\nNo repitas estas ideas: ' + (usados.join(' | ') || 'ninguna') + '\\nDevolvé SOLO un JSON con: titulo (máx 80 caracteres, con gancho), descripcion (2-3 líneas + #Shorts), tags (string separado por comas, máx 8), prompt_video (en inglés, escena de 8 s vertical 9:16, cámara, luz, acción, sonido, sin texto en pantalla).';\nreturn [{ json: { ...cuenta, pedido } }];"
    }
  },
  output: [{ row_id: 1, slot: 1, cuenta: 'cuenta1@gmail.com', hoy: '2026-11-09', pedido: 'Tema...' }]
});

const guionGratis = node({
  type: '@n8n/n8n-nodes-langchain.openAi',
  version: 2.3,
  config: {
    name: 'Guion IA (créditos gratis n8n)',
    onError: 'continueErrorOutput',
    parameters: {
      resource: 'text',
      operation: 'response',
      modelId: { __rl: true, mode: 'id', value: 'gpt-5-mini' },
      responses: { values: [{ type: 'text', role: 'user', content: expr('{{ $json.pedido }}') }] },
      options: { maxTokens: 800, textFormat: { textOptions: { type: 'json_object' } } }
    },
    credentials: { openAiApi: { id: 'jDrmKMPXDAN0tSBt', name: 'n8n free OpenAI API credits' } }
  },
  output: [{ output: [{ content: [{ text: '{"titulo":"t","descripcion":"d","tags":"a,b","prompt_video":"p"}' }] }] }]
});

const guionRespaldo = node({
  type: '@n8n/n8n-nodes-langchain.openAi',
  version: 2.3,
  config: {
    name: 'Guion IA respaldo (cuenta OpenAI)',
    parameters: {
      resource: 'text',
      operation: 'response',
      modelId: { __rl: true, mode: 'id', value: 'gpt-5-mini' },
      responses: { values: [{ type: 'text', role: 'user', content: expr("{{ $('Armar pedido de guion').first().json.pedido }}") }] },
      options: { maxTokens: 800, textFormat: { textOptions: { type: 'json_object' } } }
    },
    credentials: { openAiApi: { id: 'g2TXGcPNiZ3iOEP4', name: 'OpenAI account' } }
  },
  output: [{ output: [{ content: [{ text: '{"titulo":"t","descripcion":"d","tags":"a,b","prompt_video":"p"}' }] }] }]
});

const parsearGuion = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Parsear guion',
    parameters: {
      mode: 'runOnceForAllItems',
      jsCode: "const base = $('Armar pedido de guion').first().json;\nconst textos = [];\nconst buscar = v => { if (v == null) return; if (typeof v === 'string') { if (v.includes('{')) textos.push(v); return; } if (typeof v === 'object') Object.values(v).forEach(buscar); };\nbuscar($input.first().json);\nlet g = null;\nfor (const t of textos) { const m = t.match(/\\{[\\s\\S]*\\}/); if (!m) continue; try { const o = JSON.parse(m[0]); if (o.prompt_video) { g = o; break; } } catch (e) {} }\nif (!g) throw new Error('La IA no devolvió un guion válido');\nreturn [{ json: { ...base, titulo: String(g.titulo || '').slice(0, 95), descripcion: String(g.descripcion || ''), tags: String(g.tags || ''), prompt_video: String(g.prompt_video) } }];"
    }
  },
  output: [{ row_id: 1, slot: 1, cuenta: 'cuenta1@gmail.com', hoy: '2026-11-09', titulo: 'Pancho vs el lunes', descripcion: 'desc #Shorts', tags: 'pancho,perezoso', prompt_video: 'A cute sloth...' }]
});

const porCuenta = switchCase({
  version: 3.2,
  config: {
    name: 'Usar la cuenta elegida',
    parameters: { mode: 'expression', numberOutputs: 5, output: expr('{{ Math.min(Math.max($json.slot - 1, 0), 4) }}') }
  }
});

const veoParams = {
  resource: 'video',
  operation: 'generate',
  modelId: { __rl: true, mode: 'id', value: 'models/veo-3.0-fast-generate-001' },
  prompt: expr('{{ $json.prompt_video }}'),
  returnAs: 'video',
  options: { aspectRatio: '9:16', durationSeconds: 8, personGeneration: 'allow_adult', binaryPropertyOutput: 'data' }
};

const veo1 = node({ type: '@n8n/n8n-nodes-langchain.googleGemini', version: 1.2, config: { name: 'Video IA · Cuenta 1', onError: 'continueErrorOutput', parameters: veoParams, credentials: { googlePalmApi: newCredential('Gemini · Cuenta 1') } }, output: [{ ok: true }] });
const veo2 = node({ type: '@n8n/n8n-nodes-langchain.googleGemini', version: 1.2, config: { name: 'Video IA · Cuenta 2', onError: 'continueErrorOutput', parameters: veoParams, credentials: { googlePalmApi: newCredential('Gemini · Cuenta 2') } }, output: [{ ok: true }] });
const veo3 = node({ type: '@n8n/n8n-nodes-langchain.googleGemini', version: 1.2, config: { name: 'Video IA · Cuenta 3', onError: 'continueErrorOutput', parameters: veoParams, credentials: { googlePalmApi: newCredential('Gemini · Cuenta 3') } }, output: [{ ok: true }] });
const veo4 = node({ type: '@n8n/n8n-nodes-langchain.googleGemini', version: 1.2, config: { name: 'Video IA · Cuenta 4', onError: 'continueErrorOutput', parameters: veoParams, credentials: { googlePalmApi: newCredential('Gemini · Cuenta 4') } }, output: [{ ok: true }] });
const veo5 = node({ type: '@n8n/n8n-nodes-langchain.googleGemini', version: 1.2, config: { name: 'Video IA · Cuenta 5', onError: 'continueErrorOutput', parameters: veoParams, credentials: { googlePalmApi: newCredential('Gemini · Cuenta 5') } }, output: [{ ok: true }] });

const subirYoutube = node({
  type: 'n8n-nodes-base.youTube',
  version: 1,
  config: {
    name: 'Publicar en YouTube',
    parameters: {
      resource: 'video',
      operation: 'upload',
      title: expr("{{ $('Parsear guion').first().json.titulo }}"),
      regionCode: 'AR',
      categoryId: '23',
      binaryProperty: 'data',
      options: {
        description: expr("{{ $('Parsear guion').first().json.descripcion }}"),
        tags: expr("{{ $('Parsear guion').first().json.tags }}"),
        privacyStatus: 'public',
        selfDeclaredMadeForKids: false,
        notifySubscribers: true,
        defaultLanguage: 'es'
      }
    },
    credentials: { youTubeOAuth2Api: newCredential('YouTube · Canal Pancho') }
  },
  output: [{ uploadId: 'abc123' }]
});

const sumarUso = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Sumar uso a la cuenta',
    onError: 'continueRegularOutput',
    parameters: {
      resource: 'row',
      operation: 'update',
      dataTableId: { __rl: true, mode: 'id', value: 'tZVg2ZEKVS6rgWPi', cachedResultName: 'fabrica_cuentas_ia' },
      matchType: 'allConditions',
      filters: { conditions: [{ keyName: 'id', condition: 'eq', keyValue: expr("{{ $('Parsear guion').first().json.row_id }}") }] },
      columns: {
        mappingMode: 'defineBelow',
        value: {
          usados_hoy: expr("{{ $('Parsear guion').first().json.usados_nuevo }}"),
          fecha_uso: expr("{{ $('Parsear guion').first().json.hoy }}"),
          ultimo_error: ''
        },
        schema: [
          { id: 'usados_hoy', displayName: 'usados_hoy', required: false, defaultMatch: false, display: true, type: 'number', canBeUsedToMatch: true },
          { id: 'fecha_uso', displayName: 'fecha_uso', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
          { id: 'ultimo_error', displayName: 'ultimo_error', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true }
        ]
      }
    }
  },
  output: [{ id: 1 }]
});

const registrarVideo = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Registrar video publicado',
    onError: 'continueRegularOutput',
    parameters: {
      resource: 'row',
      operation: 'insert',
      dataTableId: { __rl: true, mode: 'id', value: 'JzBPSRWA0HApodKt', cachedResultName: 'fabrica_videos' },
      columns: {
        mappingMode: 'defineBelow',
        value: {
          fecha: expr("{{ $('Parsear guion').first().json.hoy }}"),
          slot: expr("{{ $('Parsear guion').first().json.slot }}"),
          cuenta: expr("{{ $('Parsear guion').first().json.cuenta }}"),
          titulo: expr("{{ $('Parsear guion').first().json.titulo }}"),
          prompt_video: expr("{{ $('Parsear guion').first().json.prompt_video }}"),
          youtube_id: expr('{{ $json.uploadId ?? $json.id ?? "" }}'),
          estado: 'publicado'
        },
        schema: [
          { id: 'fecha', displayName: 'fecha', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
          { id: 'slot', displayName: 'slot', required: false, defaultMatch: false, display: true, type: 'number', canBeUsedToMatch: true },
          { id: 'cuenta', displayName: 'cuenta', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
          { id: 'titulo', displayName: 'titulo', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
          { id: 'prompt_video', displayName: 'prompt_video', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
          { id: 'youtube_id', displayName: 'youtube_id', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
          { id: 'estado', displayName: 'estado', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true }
        ]
      }
    }
  },
  output: [{ id: 1 }]
});

const avisarWhatsapp = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.2,
  config: {
    name: 'Avisar por WhatsApp',
    onError: 'continueRegularOutput',
    parameters: {
      method: 'POST',
      url: 'https://evolution-api-production-5127.up.railway.app/message/sendText/electronic-home',
      authentication: 'genericCredentialType',
      genericAuthType: 'httpHeaderAuth',
      sendBody: true,
      specifyBody: 'json',
      jsonBody: expr("{{ JSON.stringify({ number: '5492227685195', text: '🎬 Video nuevo publicado\\n' + $('Parsear guion').first().json.titulo + '\\nCuenta IA: ' + $('Parsear guion').first().json.slot + ' (' + $('Parsear guion').first().json.cuenta + ')\\nhttps://youtube.com/shorts/' + ($json.uploadId ?? $json.id ?? '') }) }}"),
      options: { timeout: 20000 }
    },
    credentials: { httpHeaderAuth: { id: 'UDQXIeQjRqELjGOB', name: 'Evolution API · WhatsApp' } }
  },
  output: [{ ok: true }]
});

const marcarAgotada = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Marcar cuenta sin créditos hoy',
    parameters: {
      resource: 'row',
      operation: 'update',
      dataTableId: { __rl: true, mode: 'id', value: 'tZVg2ZEKVS6rgWPi', cachedResultName: 'fabrica_cuentas_ia' },
      matchType: 'allConditions',
      filters: { conditions: [{ keyName: 'id', condition: 'eq', keyValue: expr("{{ $('Parsear guion').first().json.row_id }}") }] },
      columns: {
        mappingMode: 'defineBelow',
        value: {
          usados_hoy: expr("{{ $('Parsear guion').first().json.cupo_diario }}"),
          fecha_uso: expr("{{ $('Parsear guion').first().json.hoy }}"),
          ultimo_error: expr('{{ String($json.error?.message ?? $json.error ?? "error al generar").slice(0, 300) }}')
        },
        schema: [
          { id: 'usados_hoy', displayName: 'usados_hoy', required: false, defaultMatch: false, display: true, type: 'number', canBeUsedToMatch: true },
          { id: 'fecha_uso', displayName: 'fecha_uso', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
          { id: 'ultimo_error', displayName: 'ultimo_error', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true }
        ]
      }
    }
  },
  output: [{ id: 1 }]
});

const notaGeneral = sticky('## 60 · Fábrica de videos IA multi-cuenta\n4 turnos por día (9, 13, 17, 21 h). Elige SIN IA la cuenta del pool `fabrica_cuentas_ia` con más cupo libre (rota entre las 5), arma el guion con créditos gratis de n8n (respaldo: cuenta OpenAI), genera el Short 9:16 con Veo en la cuenta elegida y lo publica en YouTube.\n\nPara activar una cuenta: cargá su credencial en el nodo *Video IA · Cuenta N* y poné `activa = true` en la tabla. Si una cuenta falla o se queda sin créditos, queda marcada por hoy y el próximo turno usa otra.', [leerCuentas, elegirCuenta, leerHistorial, armarPedido], { color: 5 });

const notaPublicar = sticky('## Publicación\nSube a YouTube, suma el uso a la cuenta, registra el video en `fabrica_videos` (para no repetir ideas) y avisa por WhatsApp. Las estadísticas siguen saliendo del wf 22.', [subirYoutube, sumarUso, registrarVideo, avisarWhatsapp], { color: 4 });

export default workflow('fabrica-videos-ia', '60 - PANCHO · Fábrica de videos IA multi-cuenta')
  .add(cadaTurno)
  .to(leerCuentas)
  .add(aMano)
  .to(leerCuentas)
  .add(leerCuentas)
  .to(elegirCuenta)
  .to(leerHistorial)
  .to(armarPedido)
  .to(guionGratis)
  .add(guionGratis.onError(guionRespaldo))
  .add(guionGratis)
  .to(parsearGuion)
  .add(guionRespaldo)
  .to(parsearGuion)
  .add(parsearGuion)
  .to(porCuenta
    .onCase(0, veo1)
    .onCase(1, veo2)
    .onCase(2, veo3)
    .onCase(3, veo4)
    .onCase(4, veo5))
  .add(veo1).to(subirYoutube)
  .add(veo2).to(subirYoutube)
  .add(veo3).to(subirYoutube)
  .add(veo4).to(subirYoutube)
  .add(veo5).to(subirYoutube)
  .add(veo1.onError(marcarAgotada))
  .add(veo2.onError(marcarAgotada))
  .add(veo3.onError(marcarAgotada))
  .add(veo4.onError(marcarAgotada))
  .add(veo5.onError(marcarAgotada))
  .add(subirYoutube).to(sumarUso)
  .add(subirYoutube).to(registrarVideo)
  .add(subirYoutube).to(avisarWhatsapp)
  .add(notaGeneral)
  .add(notaPublicar);
