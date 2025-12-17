import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    version: '1.1.0',
    status: 'ok',
    timestamp: new Date().toISOString(),
    build: process.env.BUILD_ID || 'development',
    features: {
      tts: true,
      stt: true,
      privacy: true,
      ssl: true,
      ssrHydrationFixed: true,
    },
    message: 'YelpOut v1.1.0 - SSR Hydration Fixed',
  });
}
