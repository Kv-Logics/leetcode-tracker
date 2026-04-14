import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword, generateToken } from '@/lib/auth';
import { getUserByUsername, initDB } from '@/lib/db';

export async function POST(req: NextRequest) {
  await initDB();
  
  const { username, password } = await req.json();
  
  const user = await getUserByUsername(username);
  if (!user) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }
  
  const valid = await verifyPassword(password, user.password);
  if (!valid) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }
  
  const token = generateToken({ id: user.id, username: user.username, role: user.role });
  
  return NextResponse.json({ token, user: { id: user.id, username: user.username, role: user.role } });
}
