import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const complaintLog = await request.json();

    // In production, you might want to:
    // 1. Save to a database
    // 2. Save to a log file
    // 3. Send to analytics platform
    
    // For now, we'll just log to console and file
    if (typeof window === 'undefined') {
      const fs = await import('fs');
      const path = await import('path');
      
      const logDir = path.join(process.cwd(), 'logs', 'complaints');
      
      // Ensure directory exists
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }

      const filename = `complaint_${Date.now()}.json`;
      const filepath = path.join(logDir, filename);
      
      fs.writeFileSync(filepath, JSON.stringify(complaintLog, null, 2));
    }

    return NextResponse.json({ success: true, message: 'Complaint logged' });
  } catch (error) {
    console.error('[Complaint API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to log complaint' },
      { status: 500 }
    );
  }
}
