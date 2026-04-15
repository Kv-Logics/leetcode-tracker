import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import path from 'path';
import fs from 'fs';

// Helper to parse CSV line
const parseCSVLine = (line: string) => {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
};

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
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const user = verifyToken(token);
    if (!user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    
    const body = await req.json();
    const { problemId, note, code, language } = body;

    if (!problemId) {
      return NextResponse.json({ error: 'Problem ID is required' }, { status: 400 });
    }

    // Default metadata
    let title = `Problem ${problemId}`;
    let difficulty = 'Medium';
    let category = '';
    let leetcodeUrl = `https://leetcode.com/problems/${problemId}/`;

    // Internal metadata lookup from CSV
    try {
      const filePath = path.join(process.cwd(), 'leetcode_all_questions.csv');
      if (fs.existsSync(filePath)) {
        const csvData = fs.readFileSync(filePath, 'utf8');
        const lines = csvData.split(/\r?\n/);
        
        if (lines.length >= 2) {
          const header = parseCSVLine(lines[0]);
          const numberIdx = header.findIndex(h => h.toLowerCase() === 'number');
          const titleIdx = header.findIndex(h => h.toLowerCase() === 'title');
          const difficultyIdx = header.findIndex(h => h.toLowerCase() === 'difficulty');
          const linkIdx = header.findIndex(h => h.toLowerCase() === 'link');

          for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;
            const row = parseCSVLine(lines[i]);
            if (row[numberIdx] === String(problemId)) {
              title = row[titleIdx] || title;
              difficulty = row[difficultyIdx] || difficulty;
              leetcodeUrl = row[linkIdx] || leetcodeUrl;
              break;
            }
          }
        }
      }
    } catch (csvError) {
      console.error('CSV Lookup Error:', csvError);
    }

    const { data, error } = await supabase
      .from('custom_problems')
      .insert({
        user_id: user.id,
        problem_id: String(problemId),
        title,
        difficulty,
        category,
        leetcode_url: leetcodeUrl,
        note,
        code,
        language: language || 'javascript',
        completed: false
      })
      .select()
      .single();
    
    if (error) {
      console.error('Supabase Insert Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ problem: data });
  } catch (err: any) {
    console.error('API Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
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
  
  const { data, error } = await supabase
    .from('custom_problems')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();
  
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  
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
