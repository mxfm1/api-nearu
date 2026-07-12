import { Resend } from 'resend';
import { config } from '../config';

type SendEmailParams = {
  to: string;
  subject: string;
  html: string;
};

async function sendEmail({ to, subject, html }: SendEmailParams): Promise<void> {
  if (!config.resendApiKey) {
    console.log('📧 [Email Mock]', { to, subject });
    return;
  }

  const resend = new Resend(config.resendApiKey);

  const { error } = await resend.emails.send({
    from: config.resendFromEmail,
    to,
    subject,
    html,
  });

  if (error) {
    // In non-production environments, log and swallow email errors
    // so the application doesn't crash due to unverified domains,
    // missing SPF records, etc.
    if (!config.isProd) {
      console.warn('⚠️  [Email Warning] Resend returned error (swallowed in dev):', error.message);
      console.warn('   This is usually because the FROM domain is not verified on Resend.');
      console.warn('   → For testing, set RESEND_FROM_EMAIL=onboarding@resend.dev in .env');
      return;
    }
    throw new Error(`Failed to send email: ${error.message}`);
  }

  console.log('📧 [Email Sent Successfully]', { to: to.replace(/(?<=.).(?=.*@)/g, '*'), subject });
}

export const emailService = {
  sendVerificationEmail({ user, url }: { user: { email: string; name?: string }; url: string }) {
    return sendEmail({
      to: user.email,
      subject: 'Verify your email address',
      html: `
        <h1>Verify your email</h1>
        <p>Hi${user.name ? ` ${user.name}` : ''},</p>
        <p>Click the link below to verify your email address:</p>
        <a href="${url}" style="display:inline-block;padding:12px 24px;background:#6366f1;color:#fff;text-decoration:none;border-radius:6px;">
          Verify Email
        </a>
        <p>Or copy this URL: ${url}</p>
        <p>This link expires in 1 hour.</p>
      `,
    });
  },

  sendResetPasswordEmail({ user, url }: { user: { email: string; name?: string }; url: string }) {
    return sendEmail({
      to: user.email,
      subject: 'Reset your password',
      html: `
        <h1>Reset your password</h1>
        <p>Hi${user.name ? ` ${user.name}` : ''},</p>
        <p>Click the link below to reset your password:</p>
        <a href="${url}" style="display:inline-block;padding:12px 24px;background:#6366f1;color:#fff;text-decoration:none;border-radius:6px;">
          Reset Password
        </a>
        <p>Or copy this URL: ${url}</p>
        <p>This link expires in 1 hour.</p>
        <p>If you didn't request this, you can safely ignore this email.</p>
      `,
    });
  },

  sendContactNotificationEmail({ to, propietarioName }: { to: string; propietarioName?: string }) {
    return sendEmail({
      to,
      subject: 'Nueva solicitud de contacto — nearU',
      html: `
        <h1>Nueva solicitud de contacto</h1>
        <p>Hola${propietarioName ? ` ${propietarioName}` : ''},</p>
        <p>Has recibido una nueva solicitud de contacto en nearU.</p>
        <p>Inicia sesión para revisar los detalles y responder.</p>
      `,
    });
  },

  sendNewMessageEmail({ to, recipientName }: { to: string; recipientName?: string }) {
    return sendEmail({
      to,
      subject: 'Nuevo mensaje — nearU',
      html: `
        <h1>Nuevo mensaje</h1>
        <p>Hola${recipientName ? ` ${recipientName}` : ''},</p>
        <p>Has recibido un nuevo mensaje en una conversación de nearU.</p>
        <p>Inicia sesión para ver el mensaje y responder.</p>
      `,
    });
  },
};
