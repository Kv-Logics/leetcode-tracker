import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const user = verifyToken(token);
  if (!user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  
  const { bookmarkId, problemId, companyName } = await req.json();
  
  const { data, error } = await supabase
    .from('bookmark_items')
    .insert({ bookmark_id: bookmarkId, problem_id: problemId, company_name: companyName })
    .select()
    .single();
  
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ item: data });
}

export async function DELETE(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const user = verifyToken(token);
  if (!user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  
  const bookmarkId = req.nextUrl.searchParams.get('bookmarkId');
  const problemId = req.nextUrl.searchParams.get('problemId');
  const companyName = req.nextUrl.searchParams.get('companyName');
  
  await supabase
    .from('bookmark_items')
    .delete()
    .eq('bookmark_id', bookmarkId)
    .eq('problem_id', problemId)
    .eq('company_name', companyName);
  
  return NextResponse.json({ success: true });
}
