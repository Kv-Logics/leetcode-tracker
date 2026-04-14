'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function CustomProblemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [token, setToken] = useState('');
  const [problem, setProblem] = useState<any>(null);
  const [note, setNote] = useState('');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (!savedToken) {
      router.push('/');
      return;
    }
    setToken(savedToken);
    fetchProblem(savedToken);
  }, []);

  const fetchProblem = async (authToken: string) => {
    const res = await fetch('/api/custom-problems', {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const data = await res.json();
    const found = data.problems?.find((p: any) => p.id === params.id);
    if (found) {
      setProblem(found);
      setNote(found.note || '');
      setCode(found.code || '');
      setLanguage(found.language || 'javascript');
    }
  };

  const updateProblem = async () => {
    const res = await fetch('/api/custom-problems', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        id: params.id,
        note,
        code,
        language
      })
    });
    
    if (res.ok) {
      alert('Saved successfully!');
      router.push('/custom');
    } else {
      alert('Failed to save');
    }
  };

  if (!problem) return <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a1f2e 0%, #0d1117 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c9d1d9' }}>Loading...</div>;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a1f2e 0%, #0d1117 100%)', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={() => router.push('/custom')} style={{ padding: '0.5rem 1rem', background: 'rgba(88, 166, 255, 0.1)', color: '#58a6ff', border: '1px solid rgba(88, 166, 255, 0.3)', borderRadius: '8px', cursor: 'pointer' }}>
            ← Back to Custom Sheet
          </button>
          <h1 style={{ color: '#c9d1d9', fontSize: '1.5rem', margin: 0 }}>#{problem.problem_id} - {problem.title}</h1>
          <div></div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div style={{ background: 'rgba(22, 27, 34, 0.95)', padding: '2rem', borderRadius: '12px', border: '1px solid rgba(48, 54, 61, 0.5)' }}>
            <h2 style={{ color: '#c9d1d9', fontSize: '1.25rem', marginBottom: '1rem' }}>📝 Notes</h2>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Your approach, insights..."
              style={{ width: '100%', minHeight: '300px', padding: '1rem', background: '#0d1117', border: '1px solid #30363d', borderRadius: '8px', color: '#c9d1d9', fontSize: '0.95rem', fontFamily: 'monospace', resize: 'vertical' }}
            />
          </div>

          <div style={{ background: 'rgba(22, 27, 34, 0.95)', padding: '2rem', borderRadius: '12px', border: '1px solid rgba(48, 54, 61, 0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ color: '#c9d1d9', fontSize: '1.25rem', margin: 0 }}>💻 Code</h2>
              <select value={language} onChange={(e) => setLanguage(e.target.value)} style={{ padding: '0.5rem 1rem', background: '#0d1117', border: '1px solid #30363d', borderRadius: '6px', color: '#c9d1d9', cursor: 'pointer' }}>
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
              </select>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Your solution..."
              style={{ width: '100%', minHeight: '300px', padding: '1rem', background: '#0d1117', border: '1px solid #30363d', borderRadius: '8px', color: '#c9d1d9', fontSize: '0.95rem', fontFamily: 'monospace', resize: 'vertical' }}
            />
          </div>
        </div>

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <button onClick={updateProblem} style={{ padding: '0.75rem 2rem', background: 'linear-gradient(135deg, #238636 0%, #2ea043 100%)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', fontWeight: '600' }}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
