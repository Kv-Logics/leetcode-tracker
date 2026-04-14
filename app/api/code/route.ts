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
  
  const { data: snippets } = await supabase
    .from('code_snippets')
    .select('*')
    .eq('user_id', user.id)
    .eq('problem_id', problemId)
    .eq('company_name', companyName)
    .order('created_at', { ascending: false });
  
  return NextResponse.json({ snippets: snippets || [] });
}

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const user = verifyToken(token);
  if (!user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  
  const body = await req.json();
  const { problemId, companyName, language, code } = body;
  
  console.log('Saving code:', { problemId, companyName, language, codeLength: code?.length });
  
  const { data, error } = await supabase
    .from('code_snippets')
    .upsert({
      user_id: user.id,
      problem_id: problemId,
      company_name: companyName,
      language,
      code,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,problem_id,company_name,language'
    })
    .select()
    .single();
  
  if (error) {
    console.error('Code save error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  console.log('Code saved successfully:', data.id);
  return NextResponse.json({ snippet: data });
}

export async function DELETE(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const user = verifyToken(token);
  if (!user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  
  const id = req.nextUrl.searchParams.get('id');
  
  await supabase
    .from('code_snippets')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);
  
  return NextResponse.json({ success: true });
}
