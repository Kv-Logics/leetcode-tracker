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
  
  const completed: Record<string, boolean> = {};
  const revisionCount: Record<string, number> = {};
  const isPinned: Record<string, boolean> = {};

  (progress || []).forEach((p: any) => {
    completed[p.problem_id] = p.completed || false;
    revisionCount[p.problem_id] = p.revision_count || 0;
    isPinned[p.problem_id] = p.is_pinned || false;
  });
  
  return NextResponse.json({ problems, completed, revisionCount, isPinned });
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
  
  const { problemId, completed, revisionCount, isPinned, company } = await req.json();
  
  const { data: existing } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', user.id)
    .eq('problem_id', problemId)
    .eq('company_name', company)
    .single();
  
  const updateData: any = {};
  if (completed !== undefined) updateData.completed = completed;
  if (revisionCount !== undefined) updateData.revision_count = revisionCount;
  if (isPinned !== undefined) updateData.is_pinned = isPinned;

  if (existing) {
    await supabase
      .from('user_progress')
      .update(updateData)
      .eq('user_id', user.id)
      .eq('problem_id', problemId)
      .eq('company_name', company);
  } else {
    await supabase
      .from('user_progress')
      .insert({
        user_id: user.id,
        problem_id: problemId,
        company_name: company,
        completed: completed || false,
        revision_count: revisionCount || 0,
        is_pinned: isPinned || false
      });
  }
  
  return NextResponse.json({ success: true });
}
