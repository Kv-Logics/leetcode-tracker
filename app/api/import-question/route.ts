import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const questionId = searchParams.get('id');

    if (!questionId) {
      return NextResponse.json({ error: 'Question ID required' }, { status: 400 });
    }

    // Read the CSV file instead of XLSX
    const filePath = path.join(process.cwd(), 'leetcode_all_questions.csv');
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Questions CSV file not found' }, { status: 404 });
    }

    const csvData = fs.readFileSync(filePath, 'utf8');
    const lines = csvData.split(/\r?\n/);
    
    if (lines.length < 2) {
      return NextResponse.json({ error: 'CSV file is empty' }, { status: 500 });
    }

    // Simple CSV parser that handles quoted strings
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

    const header = parseCSVLine(lines[0]);
    const numberIdx = header.findIndex(h => h.toLowerCase() === 'number');
    const titleIdx = header.findIndex(h => h.toLowerCase() === 'title');
    const difficultyIdx = header.findIndex(h => h.toLowerCase() === 'difficulty');
    const linkIdx = header.findIndex(h => h.toLowerCase() === 'link');

    let foundQuestion = null;

    // Search for the questionId
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const row = parseCSVLine(lines[i]);
      if (row[numberIdx] === String(questionId)) {
        foundQuestion = {
          id: row[numberIdx],
          title: row[titleIdx],
          difficulty: row[difficultyIdx] || 'Medium',
          url: row[linkIdx] || `https://leetcode.com/problems/${questionId}/`,
          category: '' // CSV doesn't seem to have category, keeping it empty
        };
        break;
      }
    }

    if (!foundQuestion) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    return NextResponse.json({ question: foundQuestion });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
