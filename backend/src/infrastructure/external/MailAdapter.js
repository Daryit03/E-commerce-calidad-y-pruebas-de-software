const nodemailer = require('nodemailer');

let transporter = null;

function obtenerTransporter() {
  if (!process.env.MAIL_HOST) return null;
  if (!transporter) {
    const puerto = Number(process.env.MAIL_PORT || 465);
    transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: puerto,
      secure: puerto === 465,
      auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS },
    });
  }
  return transporter;
}

// Envía con la API de Brevo (petición web; Render no la bloquea)
async function enviarConBrevo({ para, asunto, texto, html }) {
  const respuesta = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API_KEY,
      'content-type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify({
      sender: {
        name: process.env.MAIL_FROM_NAME || 'Electro Ferretero Darvin',
        email: process.env.MAIL_FROM_EMAIL,
      },
      to: [{ email: para }],
      subject: asunto,
      textContent: texto,
      htmlContent: html || `<p>${texto}</p>`,
    }),
  });

  if (!respuesta.ok) {
    console.error('Brevo:', respuesta.status, await respuesta.text());
    const error = new Error('No se pudo enviar el correo. Intenta de nuevo en unos minutos.');
    error.status = 502;
    throw error;
  }
}

module.exports = {
  async enviar({ para, asunto, texto, html }) {
    // 1) Brevo, si hay clave
    if (process.env.BREVO_API_KEY) return enviarConBrevo({ para, asunto, texto, html });

    // 2) SMTP (Gmail u otro), si está configurado; 3) si no, simulado en consola
    const t = obtenerTransporter();
    if (!t) {
      console.log('\n========== [CORREO SIMULADO] ==========');
      console.log(`Para: ${para}\nAsunto: ${asunto}\n\n${texto}`);
      console.log('=======================================\n');
      return;
    }
    await t.sendMail({
      from: process.env.MAIL_FROM || process.env.MAIL_USER,
      to: para,
      subject: asunto,
      text: texto,
      html,
    });
  },
};