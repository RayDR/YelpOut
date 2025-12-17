import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Email configuration
const EMAIL_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
};

const NOTIFICATION_EMAIL = 'raymundo.dominguez@domoforge.com';

export async function POST(request: NextRequest) {
  try {
    const errorLog = await request.json();

    console.error('[Error API] Received error:', {
      type: errorLog.errorType,
      message: errorLog.errorMessage,
      timestamp: errorLog.timestamp
    });

    // Save to file system
    if (typeof window === 'undefined') {
      const fs = await import('fs');
      const path = await import('path');
      
      const logDir = path.join(process.cwd(), 'logs', 'errors');
      
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }

      const filename = `error_${Date.now()}.json`;
      const filepath = path.join(logDir, filename);
      
      fs.writeFileSync(filepath, JSON.stringify(errorLog, null, 2));
    }

    // Send email notification
    try {
      if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        const transporter = nodemailer.createTransport(EMAIL_CONFIG);

        const emailSubject = `🚨 YelpOut Error: ${errorLog.errorType}`;
        const emailBody = `
          <h2>Error Detected in YelpOut</h2>
          <p><strong>Type:</strong> ${errorLog.errorType}</p>
          <p><strong>Timestamp:</strong> ${new Date(errorLog.timestamp).toLocaleString()}</p>
          <p><strong>Message:</strong> ${errorLog.errorMessage}</p>
          
          ${errorLog.errorStack ? `
            <h3>Stack Trace:</h3>
            <pre>${errorLog.errorStack}</pre>
          ` : ''}
          
          ${errorLog.additionalInfo ? `
            <h3>Additional Info:</h3>
            <pre>${JSON.stringify(errorLog.additionalInfo, null, 2)}</pre>
          ` : ''}
          
          <hr>
          <p><strong>URL:</strong> ${errorLog.url}</p>
          <p><strong>User Agent:</strong> ${errorLog.userAgent}</p>
        `;

        await transporter.sendMail({
          from: EMAIL_CONFIG.auth.user,
          to: NOTIFICATION_EMAIL,
          subject: emailSubject,
          html: emailBody,
        });

      } else {
        console.warn('[Error API] SMTP not configured, skipping email');
      }
    } catch (emailError) {
      console.error('[Error API] Failed to send email:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({ success: true, message: 'Error logged' });
  } catch (error) {
    console.error('[Error API] Error logging error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to log error' },
      { status: 500 }
    );
  }
}
