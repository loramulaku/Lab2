const { sendMail } = require('../services/mailer');
const Company      = require('../models/sql/Company');

async function sendInvitationEmail({ invitation, job, freelancer }) {
  const company     = await Company.findByPk(invitation.companyId);
  const companyName = company?.name ?? 'A company';
  const firstName   = freelancer.firstName ?? freelancer.email.split('@')[0];

  const frontendUrl     = process.env.FRONTEND_URL || 'http://localhost:5173';
  const invitationsUrl  = `${frontendUrl}/my-profile?tab=freelance&sub=invitations`;

  const priceHtml = invitation.priceOffer
    ? `<tr><td style="padding:6px 0;color:#6b7280;font-size:14px;">Offered rate</td><td style="padding:6px 0;font-size:14px;font-weight:600;">$${Number(invitation.priceOffer).toLocaleString()}</td></tr>`
    : '';
  const timeHtml = invitation.deliveryTimeDays
    ? `<tr><td style="padding:6px 0;color:#6b7280;font-size:14px;">Timeline</td><td style="padding:6px 0;font-size:14px;font-weight:600;">${invitation.deliveryTimeDays} days</td></tr>`
    : '';
  const messageHtml = invitation.message
    ? `<div style="margin:20px 0;padding:14px 16px;background:#f9fafb;border-left:3px solid #6366f1;font-size:14px;color:#374151;line-height:1.6;">${escHtml(invitation.message)}</div>`
    : '';

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1);">

        <!-- Header -->
        <tr><td style="background:#4f46e5;padding:32px 40px;">
          <p style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">New Invitation</p>
          <p style="margin:6px 0 0;color:#c7d2fe;font-size:14px;">Job Portal</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:36px 40px;">
          <p style="margin:0 0 20px;font-size:16px;color:#111827;">Hi <strong>${escHtml(firstName)}</strong>,</p>
          <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.6;">
            <strong>${escHtml(companyName)}</strong> has sent you a direct invitation to work on a job.
          </p>

          <!-- Job details box -->
          <div style="border:1px solid #e5e7eb;border-radius:6px;padding:20px 24px;margin-bottom:24px;">
            <p style="margin:0 0 12px;font-size:18px;font-weight:700;color:#111827;">${escHtml(job.title)}</p>
            <table cellpadding="0" cellspacing="0" width="100%">
              ${priceHtml}
              ${timeHtml}
            </table>
          </div>

          ${messageHtml}

          <!-- CTA -->
          <div style="text-align:center;margin:32px 0 8px;">
            <a href="${invitationsUrl}"
               style="display:inline-block;padding:14px 36px;background:#4f46e5;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;border-radius:6px;">
              View Invitation
            </a>
          </div>

          <p style="margin:24px 0 0;font-size:13px;color:#9ca3af;text-align:center;">
            If you did not expect this invitation you can safely ignore this email.
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f9fafb;padding:20px 40px;border-top:1px solid #e5e7eb;">
          <p style="margin:0;font-size:12px;color:#6b7280;text-align:center;">
            © ${new Date().getFullYear()} Job Portal · You're receiving this because you have an account with us.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text =
    `Hi ${firstName},\n\n` +
    `${companyName} has invited you to work on "${job.title}".\n\n` +
    (invitation.priceOffer ? `Offered rate: $${Number(invitation.priceOffer).toLocaleString()}\n` : '') +
    (invitation.deliveryTimeDays ? `Timeline: ${invitation.deliveryTimeDays} days\n` : '') +
    (invitation.message ? `\nMessage:\n${invitation.message}\n` : '') +
    `\nView your invitation: ${invitationsUrl}\n`;

  await sendMail({
    to:          freelancer.email,
    subject:     `${companyName} invited you: ${job.title}`,
    html,
    text,
    _previewUrl: invitationsUrl,
  });
}

function escHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

module.exports = { sendInvitationEmail };
