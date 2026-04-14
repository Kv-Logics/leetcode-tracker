import { NextRequest, NextResponse } from 'next/server';
import { generateToken } from '@/lib/auth';
import { createUser, getUserByUsername, initDB } from '@/lib/db';

export async function POST(req: NextRequest) {
  await initDB();
  
  const { username, password, role } = await req.json();
  
  const existing = await getUserByUsername(username);
  if (existing) {
    return NextResponse.json({ error: 'User exists' }, { status: 400 });
  }
  
  const { data: user, error } = await createUser(username, password, role || 'user');
  
  if (error || !user) {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
  
  const token = generateToken({ id: user.id, username: user.username, role: user.role });
  
  return NextResponse.json({ token, user: { id: user.id, username: user.username, role: user.role } });
}
