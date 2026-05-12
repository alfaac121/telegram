
const OpenAI = require('openai');
const { GROQ_API_KEY } = require('../config/env');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const groq = new OpenAI({
  apiKey: GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1"
});

/**
 * Descarga un archivo desde los servidores de Telegram y lo guarda temporalmente
 */
async function descargarArchivo(url, destPath) {
  const response = await axios({
    method: 'GET',
    url: url,
    responseType: 'stream',
  });

  return new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(destPath);
    response.data.pipe(writer);
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

/**
 * Usa Whisper para convertir audio a texto
 */
exports.transcribirAudio = async (fileLink) => {
  const tempPath = path.join(__dirname, `../../temp_audio_${Date.now()}.ogg`);
  try {
    // 1. Descargar el archivo
    await descargarArchivo(fileLink, tempPath);

    // 2. Transcribir con Whisper en Groq
    const transcription = await groq.audio.transcriptions.create({
      file: fs.createReadStream(tempPath),
      model: "whisper-large-v3",
    });

    return transcription.text;
  } catch (error) {
    console.error('Error en transcribirAudio:', error);
    throw error;
  } finally {
    // Limpiar archivo temporal
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
  }
};

/**
 * Usa Llama 3 para extraer información estructurada (Punto, Área, Problema)
 */
exports.analizarIntencion = async (texto) => {
  try {
    const prompt = `
      Eres un extractor de datos JSON para una mesa de ayuda.
      Analiza el texto y extrae: punto, area, subCategoria, falla.

      EJEMPLOS:
      - "No tengo internet en el punto 45" -> {"punto":"45", "area":"Soporte TI", "subCategoria":"Sin Internet", "falla":"Falla de conectividad"}
      - "Punto 12 falla impresora" -> {"punto":"12", "area":"Soporte TI", "subCategoria":"Falla en Impresora", "falla":"Impresora no funciona"}

      TEXTO A ANALIZAR: "${texto}"

      Responde SOLO el JSON:
    `;

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: "Responde siempre en formato JSON puro." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    let rawResult = JSON.parse(response.choices[0].message.content);
    console.log('--- IA RAW RESULT ---', rawResult);
    
    // --- BUSCADOR DE EMERGENCIA (REGEX FALLBACK) ---
    const regexPunto = /(?:punto|sucursal|p\.?|suc\.?|tienda|en el|del)\s*(\d+)/i;
    const match = texto.match(regexPunto) || texto.match(/(\d+)/);

    if (match && (!rawResult.punto || isNaN(rawResult.punto))) {
      rawResult.punto = match[1];
      console.log('--- PUNTO RECUPERADO POR REGEX ---', rawResult.punto);
    }

    return rawResult;
  } catch (error) {
    console.error('Error en analizarIntencion:', error);
    // Intentar rescatar al menos el punto por regex si la IA falla
    const match = texto.match(/(?:punto|sucursal|p\.?|suc\.?|tienda|en el|del)\s*(\d+)/i) || texto.match(/(\d+)/);
    return { 
      punto: match ? match[1] : null, 
      area: 'Soporte TI', 
      subCategoria: 'General', 
      falla: texto 
    };
  }
};
