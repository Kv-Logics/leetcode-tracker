import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const user = verifyToken(token);
  if (!user) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
  
  const company = req.nextUrl.searchParams.get('company') || 'PayPal';
  
  const { data: companyData } = await supabase
    .from('companies')
    .select('problems')
    .eq('name', company)
    .single();
  
  const problems = companyData?.problems || [];
  
  const { data: progress } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', user.id)
    .eq('company_name', company);
  
  const completed = (progress || []).reduce((acc: any, p: any) => ({ ...acc, [p.problem_id]: p.completed }), {});
  
  return NextResponse.json({ problems, completed });
}

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const user = verifyToken(token);
  if (!user) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
  
  const { problemId, completed, company } = await req.json();
  
  const { data: existing } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', user.id)
    .eq('problem_id', problemId)
    .eq('company_name', company)
    .single();
  
  if (existing) {
    await supabase
      .from('user_progress')
      .update({ completed })
      .eq('user_id', user.id)
      .eq('problem_id', problemId)
      .eq('company_name', company);
  } else {
    await supabase
      .from('user_progress')
      .insert({ user_id: user.id, problem_id: problemId, company_name: company, completed });
  }
  
  return NextResponse.json({ success: true });
}
