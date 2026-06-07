const nodemailer = require('nodemailer');

let _transporter = null;

function getTransporter() {
  if (_transporter) return _transporter;

  if (process.env.SMTP_HOST) {
    _transporter = nodemailer.createTransport({
      host:   process.env.SMTP_HOST,
      port:   Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Dev fallback — prints to console so the app works without an SMTP server
    _transporter = {
      sendMail: async (opts) => {
        console.log('\n[mailer] No SMTP_HOST set — email not sent.');
        console.log(`  To:      ${opts.to}`);
        console.log(`  Subject: ${opts.subject}`);
        console.log(`  Link:    ${opts._previewUrl ?? '(no link)'}\n`);
        return { messageId: 'dev-console' };
      },
    };
  }

  return _transporter;
}

async function sendMail({ to, subject, html, text, _previewUrl }) {
  const t = getTransporter();
  return t.sendMail({
    from:       process.env.FROM_EMAIL || '"Job Portal" <no-reply@jobportal.local>',
    to,
    subject,
    html,
    text,
    _previewUrl,
  });
}

module.exports = { sendMail };
