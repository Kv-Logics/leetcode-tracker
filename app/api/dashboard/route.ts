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

  try {
    // 1. Fetch companies
    const { data: companiesData } = await supabase
      .from('companies')
      .select('*')
      .order('name');

    // 2. Fetch user progress
    const { data: progressData } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user.id);

    const companies = (companiesData || []).map((company: any) => {
      const problems = company.problems || [];
      const companyProgress = (progressData || []).filter((p: any) => p.company_name === company.name);
      
      const completedCount = companyProgress.filter((p: any) => p.completed).length;
      const totalRevisions = companyProgress.reduce((sum: number, p: any) => sum + (p.revision_count || 0), 0);
      const pinnedCount = companyProgress.filter((p: any) => p.is_pinned).length;

      return {
        id: company.id,
        name: company.name,
        totalProblems: problems.length,
        completedCount,
        progressPercent: problems.length > 0 ? Math.round((completedCount / problems.length) * 100) : 0,
        totalRevisions,
        pinnedCount
      };
    });

    const totalProblemsAll = companies.reduce((sum: number, c: any) => sum + c.totalProblems, 0);
    const totalCompletedAll = companies.reduce((sum: number, c: any) => sum + c.completedCount, 0);
    const totalRevisionsAll = companies.reduce((sum: number, c: any) => sum + c.totalRevisions, 0);

    // Fetch pinned questions for Revision Hub
    const pinnedItems = (progressData || []).filter((p: any) => p.is_pinned).map((p: any) => ({
      problemId: p.problem_id,
      companyName: p.company_name,
      revisionCount: p.revision_count || 0,
      completed: p.completed || false
    }));

    return NextResponse.json({
      summary: {
        totalCompanies: companies.length,
        totalProblemsAll,
        totalCompletedAll,
        totalRevisionsAll,
        overallPercent: totalProblemsAll > 0 ? Math.round((totalCompletedAll / totalProblemsAll) * 100) : 0
      },
      companies,
      pinnedItems
    });
  } catch (err: any) {
    console.error('Error fetching dashboard overview:', err);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
