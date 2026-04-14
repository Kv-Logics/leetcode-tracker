import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const user = verifyToken(token);
  if (!user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  
  const { data: problems } = await supabase
    .from('custom_problems')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  
  return NextResponse.json({ problems: problems || [] });
}

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const user = verifyToken(token);
  if (!user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  
  const { problemId, title, difficulty, category, leetcodeUrl, note, code, language } = await req.json();
  
  const { data, error } = await supabase
    .from('custom_problems')
    .insert({
      user_id: user.id,
      problem_id: problemId,
      title,
      difficulty,
      category,
      leetcode_url: leetcodeUrl,
      note,
      code,
      language,
      completed: false
    })
    .select()
    .single();
  
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ problem: data });
}

export async function PATCH(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const user = verifyToken(token);
  if (!user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  
  const body = await req.json();
  const { id, completed, note, code, language } = body;
  
  const updateData: any = { updated_at: new Date().toISOString() };
  if (completed !== undefined) updateData.completed = completed;
  if (note !== undefined) updateData.note = note;
  if (code !== undefined) updateData.code = code;
  if (language !== undefined) updateData.language = language;
  
  console.log('Updating custom problem:', id, updateData);
  
  const { data, error } = await supabase
    .from('custom_problems')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();
  
  if (error) {
    console.error('Update error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({ problem: data });
}

export async function DELETE(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const user = verifyToken(token);
  if (!user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  
  const id = req.nextUrl.searchParams.get('id');
  
  await supabase
    .from('custom_problems')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);
  
  return NextResponse.json({ success: true });
}
