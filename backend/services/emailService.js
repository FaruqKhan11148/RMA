const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendPasswordResetEmail(to, resetUrl) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured');
  }

  const from = process.env.RESEND_FROM_EMAIL;
  const frontendUrl = process.env.FRONTEND_URL;

  if (!from) {
    throw new Error('RESEND_FROM_EMAIL is not configured');
  }

  if (!frontendUrl) {
    throw new Error('FRONTEND_URL is not configured');
  }

  const logoUrl = 'https://rma-rho.vercel.app/rma-notification-icon.png';

  const { data, error } = await resend.emails.send({
    from: `RMA <${from}>`,
    to: [to],
    subject: 'Reset your RMA owner password',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#222;">
        <div style="text-align:center;margin-bottom:24px;">
          <img
            src="https://rma-rho.vercel.app/rma-notification-icon.png"
            alt="RMA"
            width="80"
            height="80"
            style="display:block;width:80px;height:80px;margin:0 auto;border:0;"
            />
          <h2 style="color:#198754;margin-top:16px;">Reset your RMA password</h2>
        </div>

        <p>We received a request to reset your RMA owner account password.</p>

        <p style="text-align:center;margin:28px 0;">
          <a
            href="${resetUrl}"
            style="display:inline-block;padding:12px 24px;background:#198754;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;"
          >
            Reset Password
          </a>
        </p>

        <p>This link expires in 15 minutes and can only be used once.</p>
        <p>If you didn't request this, you can safely ignore this email.</p>

        <hr style="border:none;border-top:1px solid #eee;margin:28px 0;" />

        <p style="font-size:12px;color:#777;text-align:center;">
          RMA — Raw Meat Application
        </p>
      </div>
    `,
  });

  if (error) {
    throw new Error(error.message || 'Failed to send password-reset email');
  }

  return data;
}

module.exports = { sendPasswordResetEmail };
