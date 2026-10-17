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

module.exports = {
  async enviar({ para, asunto, texto, html }) {
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