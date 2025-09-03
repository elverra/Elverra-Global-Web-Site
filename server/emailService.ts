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
      html: params.html
    });
    return false;
  }

  try {
    const emailData = {
      to: params.to,
      from: params.from || 'noreply@elverra.com',
      subject: params.subject,
      ...(params.text && { text: params.text }),
      ...(params.html && { html: params.html }),
    };
    
    await mailService.send(emailData);
    
    console.log(`📧 Email sent successfully to ${params.to}`);
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

export async function sendWelcomeEmail(userEmail: string, fullName: string): Promise<boolean> {
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
            <div class="benefit-item">
              <span class="check">✓</span>
              <span><strong>ZENIKA Card Benefits:</strong> Exclusive discounts and privileges across our client network</span>
            </div>
            <div class="benefit-item">
              <span class="check">✓</span>
              <span><strong>Job Center Access:</strong> Browse and apply for opportunities</span>
            </div>
            <div class="benefit-item">
              <span class="check">✓</span>
              <span><strong>Online Store:</strong> Shop with low hosting fees</span>
            </div>
            <div class="benefit-item">
              <span class="check">✓</span>
              <span><strong>Free Online Library:</strong> Educational resources at your fingertips</span>
            </div>
            <div class="benefit-item">
              <span class="check">✓</span>
              <span><strong>"Ô Secours" Services:</strong> Emergency assistance when you need it</span>
            </div>
          </div>
          
          <p>Ready to explore all that Elverra Global has to offer? Sign in to your account and start enjoying your member benefits.</p>
          
          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'https://elverra.com'}/login" class="button">Sign In to Your Account</a>
          </div>
          
          <p>If you have any questions or need assistance, our support team is here to help. Contact us at support@elverra.com.</p>
          
          <p>Welcome aboard!</p>
          <p><strong>The Elverra Global Team</strong></p>
        </div>
        
        <div class="footer">
          <p>© ${new Date().getFullYear()} Elverra Global. All rights reserved.</p>
          <p>This email was sent to ${userEmail}. If you didn't create an account with us, please ignore this email.</p>
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
    
    Ready to explore all that Elverra Global has to offer? Sign in to your account and start enjoying your member benefits.
    
    Sign in at: ${process.env.FRONTEND_URL || 'https://elverra.com'}/login
    
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
    html: htmlContent
  });
}