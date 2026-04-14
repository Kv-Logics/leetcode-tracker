import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const user = verifyToken(token);
  if (!user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  
  const problemId = req.nextUrl.searchParams.get('problemId');
  const companyName = req.nextUrl.searchParams.get('companyName');
  
  const { data: note } = await supabase
    .from('problem_notes')
    .select('*')
    .eq('user_id', user.id)
    .eq('problem_id', problemId)
    .eq('company_name', companyName)
    .single();
  
  return NextResponse.json({ note: note || null });
}

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const user = verifyToken(token);
  if (!user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  
  const body = await req.json();
  const { problemId, companyName, note } = body;
  
  console.log('Saving note:', { problemId, companyName, noteLength: note?.length });
  
  const { data, error } = await supabase
    .from('problem_notes')
    .upsert({
      user_id: user.id,
      problem_id: problemId,
      company_name: companyName,
      note,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,problem_id,company_name'
    })
    .select()
    .single();
  
  if (error) {
    console.error('Note save error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  console.log('Note saved successfully:', data.id);
  return NextResponse.json({ note: data });
}

export async function DELETE(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const user = verifyToken(token);
  if (!user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  
  const problemId = req.nextUrl.searchParams.get('problemId');
  const companyName = req.nextUrl.searchParams.get('companyName');
  
  await supabase
    .from('problem_notes')
    .delete()
    .eq('user_id', user.id)
    .eq('problem_id', problemId)
    .eq('company_name', companyName);
  
  return NextResponse.json({ success: true });
}
