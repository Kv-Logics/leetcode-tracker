import { NextResponse } from 'next/server';
import { seedPayPal } from '@/lib/seed-paypal';

export async function GET() {
  try {
    await seedPayPal();
    return NextResponse.json({ success: true, message: 'PayPal data seeded' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to seed' }, { status: 500 });
  }
}
