import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { generateItineraryHTML, generateItineraryText } from '@/lib/email/templates/itinerary';
import { PlanBlock } from '@/modules/planning/types';
import { translations } from '@/lib/i18n/translations';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, planDate, eventType, location, groupSize, blocks, language = 'en' } = body;

    if (!email || !blocks || blocks.length === 0) {
      return NextResponse.json(
        { error: 'Email and blocks are required' },
        { status: 400 }
      );
    }

    // Create transporter with IONOS configuration
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ionos.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false // For compatibility with some SMTP servers
      }
    });

    // Verify connection
    await transporter.verify();

    // Generate email content
    const htmlContent = generateItineraryHTML({
      recipientEmail: email,
      planDate,
      eventType,
      location,
      groupSize,
      blocks: blocks as PlanBlock[],
      language: language as 'en' | 'es'
    });

    const textContent = generateItineraryText({
      recipientEmail: email,
      planDate,
      eventType,
      location,
      groupSize,
      blocks: blocks as PlanBlock[],
      language: language as 'en' | 'es'
    });

    // Send email
    const t = translations[language as 'en' | 'es'];
    const info = await transporter.sendMail({
      from: `"YelpOut" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: email,
      subject: t.email.subject,
      text: textContent,
      html: htmlContent,
    });


    return NextResponse.json({ 
      success: true, 
      messageId: info.messageId 
    });

  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { 
        error: 'Failed to send email',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
