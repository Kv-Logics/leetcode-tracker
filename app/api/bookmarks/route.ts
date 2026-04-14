import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const user = verifyToken(token);
  if (!user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  
  const { data: bookmarks } = await supabase
    .from('bookmarks')
    .select('*, bookmark_items(*)')
    .eq('user_id', user.id)
    .order('created_at');
  
  return NextResponse.json({ bookmarks: bookmarks || [] });
}

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const user = verifyToken(token);
  if (!user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  
  const { name, color } = await req.json();
  
  const { data, error } = await supabase
    .from('bookmarks')
    .insert({ user_id: user.id, name, color: color || '#58a6ff' })
    .select()
    .single();
  
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ bookmark: data });
}

export async function DELETE(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const user = verifyToken(token);
  if (!user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  
  const id = req.nextUrl.searchParams.get('id');
  await supabase.from('bookmarks').delete().eq('id', id).eq('user_id', user.id);
  return NextResponse.json({ success: true });
}
