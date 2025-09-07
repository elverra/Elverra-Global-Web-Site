// emailService.ts
import { MailService } from '@sendgrid/mail';

// Check if SendGrid API key is available
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;

let mailService: MailService | null = null;

if (SENDGRID_API_KEY) {
  mailService = new MailService();
  mailService.setApiKey(SENDGRID_API_KEY);
}

interface EmailParams {
  to: string;
  from?: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  // If SendGrid is not configured, log the email instead of sending
  if (!mailService || !SENDGRID_API_KEY) {
    console.log('📧 Email Service: SendGrid not configured. Email would be sent:', {
      to: params.to,
      subject: params.subject,
      text: params.text,
      html: params.html,
    });
    return false;
  }

  try {
    const emailData = {
      to: params.to,
      from: params.from || 'noreply@elverra.com',
      subject: params.subject,
      text: params.text || '',
      html: params.html || '',
    };

    await mailService.send(emailData);

    console.log(`📧 Email sent successfully to ${params.to}`);
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

export async function sendWelcomeEmail(
  userEmail: string,
  fullName: string,
  paymentRequired: boolean = false
): Promise<boolean> {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Elverra Global</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px 20px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #8B5CF6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .benefits { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .benefit-item { display: flex; align-items: center; margin: 10px 0; }
          .check { color: #10B981; font-weight: bold; margin-right: 10px; }
          .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Welcome to Elverra Global!</h1>
          <p>Thank you for joining our exclusive community</p>
        </div>
        <div class="content">
          <h2>Hello ${fullName || 'Valued Member'},</h2>
          <p>We're thrilled to welcome you to Elverra Global! Your account has been successfully created, and you now have access to our comprehensive range of services and benefits.</p>
          <div class="benefits">
            <h3>What's Available to You:</h3>
            <div class="benefit-item"><span class="check">✓</span> ZENIKA Card Benefits: Exclusive discounts and privileges across our client network</div>
            <div class="benefit-item"><span class="check">✓</span> Job Center Access: Browse and apply for opportunities</div>
            <div class="benefit-item"><span class="check">✓</span> Online Store: Shop with low hosting fees</div>
            <div class="benefit-item"><span class="check">✓</span> Free Online Library: Educational resources at your fingertips</div>
            <div class="benefit-item"><span class="check">✓</span> "Ô Secours" Services: Emergency assistance when you need it</div>
          </div>
          ${
            paymentRequired
              ? `
          <p>To complete your registration and access all features, please complete your membership payment.</p>
          <a href="${process.env.FRONTEND_URL || 'https://elverraglobal.com'}/membership/payment" class="button">Complete Payment</a>
          `
              : `
          <p>Ready to explore all that Elverra Global has to offer? Sign in to your account and start enjoying your member benefits.</p>
          <a href="${process.env.FRONTEND_URL || 'https://elverraglobal.com'}/dashboard" class="button">Go to Dashboard</a>
          `
          }
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Elverra Global. All rights reserved.</p>
          <p>If you did not sign up for this account, please contact us immediately at support@elverra.com.</p>
        </div>
      </body>
    </html>
  `;

  const textContent = `
    Welcome to Elverra Global!
    
    Hello ${fullName || 'Valued Member'},
    
    We're thrilled to welcome you to Elverra Global! Your account has been successfully created, and you now have access to our comprehensive range of services and benefits.
    
    What's Available to You:
    ✓ ZENIKA Card Benefits: Exclusive discounts and privileges across our client network
    ✓ Job Center Access: Browse and apply for opportunities
    ✓ Online Store: Shop with low hosting fees
    ✓ Free Online Library: Educational resources at your fingertips
    ✓ "Ô Secours" Services: Emergency assistance when you need it
    
    ${
      paymentRequired
        ? `
    To complete your registration and access all features, please complete your membership payment by clicking the link below:
    ${process.env.FRONTEND_URL || 'https://elverraglobal.com'}/membership/payment
    `
        : `
    Ready to explore all that Elverra Global has to offer? Sign in to your account and start enjoying your member benefits.
    Sign in at: ${process.env.FRONTEND_URL || 'https://elverraglobal.com'}/dashboard
    `
    }
    
    If you have any questions or need assistance, our support team is here to help. Contact us at support@elverra.com.
    
    Welcome aboard!
    The Elverra Global Team
    
    © ${new Date().getFullYear()} Elverra Global. All rights reserved.
    This email was sent to ${userEmail}. If you didn't create an account with us, please ignore this email.
  `;

  return await sendEmail({
    to: userEmail,
    subject: 'Welcome to Elverra Global - Your Account is Ready!',
    text: textContent,
    html: htmlContent,
  });
}