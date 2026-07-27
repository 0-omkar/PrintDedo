import { NextResponse } from 'next/server';
import { deleteR2File } from '@/lib/r2';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    const expectedSecret = process.env.CRON_SECRET;

    if (!authHeader || (expectedSecret && authHeader !== `Bearer ${expectedSecret}`)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const filePath = body?.file_path;

    if (!filePath || typeof filePath !== 'string') {
      return NextResponse.json({ error: 'Invalid or missing file_path' }, { status: 400 });
    }

    const result = await deleteR2File(filePath);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('R2 Webhook cleanup error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
