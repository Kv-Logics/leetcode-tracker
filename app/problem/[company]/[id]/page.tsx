'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function ProblemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [token, setToken] = useState('');
  const [note, setNote] = useState('');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [snippets, setSnippets] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (!savedToken) {
      router.push('/');
      return;
    }
    setToken(savedToken);
    fetchData(savedToken);
  }, []);

  const fetchData = async (authToken: string) => {
    const [noteRes, codeRes] = await Promise.all([
      fetch(`/api/notes?problemId=${params.id}&companyName=${params.company}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      }),
      fetch(`/api/code?problemId=${params.id}&companyName=${params.company}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      })
    ]);
    
    const noteData = await noteRes.json();
    const codeData = await codeRes.json();
    
    if (noteData.note) setNote(noteData.note.note);
    setSnippets(codeData.snippets || []);
    if (codeData.snippets?.length > 0) {
      setCode(codeData.snippets[0].code);
      setLanguage(codeData.snippets[0].language);
    }
  };

  const saveNote = async () => {
    setSaving(true);
    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        problemId: params.id,
        companyName: params.company,
        note
      })
    });
    setSaving(false);
    if (res.ok) {
      alert('Note saved!');
    }
  };

  const saveCode = async () => {
    setSaving(true);
    const res = await fetch('/api/code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        problemId: params.id,
        companyName: params.company,
        language,
        code
      })
    });
    setSaving(false);
    if (res.ok) {
      alert('Code saved!');
      fetchData(token);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a1f2e 0%, #0d1117 100%)', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={() => router.back()} style={{ padding: '0.5rem 1rem', background: 'rgba(88, 166, 255, 0.1)', color: '#58a6ff', border: '1px solid rgba(88, 166, 255, 0.3)', borderRadius: '8px', cursor: 'pointer' }}>
            ← Back
          </button>
          <h1 style={{ color: '#c9d1d9', fontSize: '1.5rem', margin: 0 }}>Problem #{params.id} - {params.company}</h1>
          <div></div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* Notes Section */}
          <div style={{ background: 'rgba(22, 27, 34, 0.95)', padding: '2rem', borderRadius: '12px', border: '1px solid rgba(48, 54, 61, 0.5)' }}>
            <h2 style={{ color: '#c9d1d9', fontSize: '1.25rem', marginBottom: '1rem' }}>📝 Notes</h2>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Write your notes, approach, time complexity, etc..."
              style={{
                width: '100%',
                minHeight: '300px',
                padding: '1rem',
                background: '#0d1117',
                border: '1px solid #30363d',
                borderRadius: '8px',
                color: '#c9d1d9',
                fontSize: '0.95rem',
                fontFamily: 'monospace',
                resize: 'vertical'
              }}
            />
            <button
              onClick={saveNote}
              disabled={saving}
              style={{
                marginTop: '1rem',
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #238636 0%, #2ea043 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontSize: '0.95rem',
                fontWeight: '600',
                opacity: saving ? 0.6 : 1
              }}
            >
              {saving ? 'Saving...' : 'Save Note'}
            </button>
          </div>

          {/* Code Section */}
          <div style={{ background: 'rgba(22, 27, 34, 0.95)', padding: '2rem', borderRadius: '12px', border: '1px solid rgba(48, 54, 61, 0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ color: '#c9d1d9', fontSize: '1.25rem', margin: 0 }}>💻 Code Solution</h2>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#0d1117',
                  border: '1px solid #30363d',
                  borderRadius: '6px',
                  color: '#c9d1d9',
                  cursor: 'pointer'
                }}
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
                <option value="go">Go</option>
                <option value="rust">Rust</option>
              </select>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste your solution code here..."
              style={{
                width: '100%',
                minHeight: '300px',
                padding: '1rem',
                background: '#0d1117',
                border: '1px solid #30363d',
                borderRadius: '8px',
                color: '#c9d1d9',
                fontSize: '0.95rem',
                fontFamily: 'monospace',
                resize: 'vertical'
              }}
            />
            <button
              onClick={saveCode}
              disabled={saving}
              style={{
                marginTop: '1rem',
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #238636 0%, #2ea043 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontSize: '0.95rem',
                fontWeight: '600',
                opacity: saving ? 0.6 : 1
              }}
            >
              {saving ? 'Saving...' : 'Save Code'}
            </button>

            {/* Previous Solutions */}
            {snippets.length > 1 && (
              <div style={{ marginTop: '2rem' }}>
                <h3 style={{ color: '#8b949e', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Previous Solutions</h3>
                {snippets.slice(1).map((snippet, i) => (
                  <div key={i} style={{ padding: '0.75rem', marginBottom: '0.5rem', background: 'rgba(13, 17, 23, 0.6)', borderRadius: '6px', border: '1px solid #30363d' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#8b949e', fontSize: '0.875rem' }}>{snippet.language}</span>
                      <button
                        onClick={() => { setCode(snippet.code); setLanguage(snippet.language); }}
                        style={{ padding: '0.25rem 0.75rem', background: 'rgba(88, 166, 255, 0.1)', color: '#58a6ff', border: '1px solid rgba(88, 166, 255, 0.3)', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}
                      >
                        Load
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
