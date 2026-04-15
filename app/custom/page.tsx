'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function CustomSheetPage() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [user, setUser] = useState<any>(null);
  const [problems, setProblems] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    problemId: '',
    title: '',
    difficulty: 'Medium',
    category: '',
    leetcodeUrl: '',
    note: '',
    code: '',
    language: 'javascript'
  });

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (!savedToken || !savedUser) {
      router.push('/');
      return;
    }
    setToken(savedToken);
    setUser(JSON.parse(savedUser));
    fetchProblems(savedToken);
  }, []);

  const fetchProblems = async (authToken: string) => {
    try {
      const res = await fetch('/api/custom-problems', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const data = await res.json();
      setProblems(data.problems || []);
    } catch (err) {
      console.error('Fetch problems error:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const problemId = formData.problemId.trim();
    if (!problemId) return;

    try {
      const response = await fetch('/api/custom-problems', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          problemId: problemId,
          note: formData.note,
          code: formData.code,
          language: formData.language
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add problem');
      }

      setShowAddForm(false);
      setFormData({
        problemId: '',
        title: '',
        difficulty: 'Medium',
        category: '',
        leetcodeUrl: '',
        note: '',
        code: '',
        language: 'javascript'
      });
      await fetchProblems(token);
    } catch (err: any) {
      console.error('Error adding problem:', err);
      alert(`Error: ${err.message}`);
    }
  };

  const deleteProblem = async (id: string) => {
    if (!confirm('Delete this problem?')) return;
    await fetch(`/api/custom-problems?id=${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchProblems(token);
  };

  const toggleComplete = async (id: string, completed: boolean) => {
    await fetch('/api/custom-problems', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ id, completed: !completed })
    });
    fetchProblems(token);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#000000', padding: '2rem' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button onClick={() => router.push('/')} style={{ padding: '0.5rem 1rem', background: '#0d1117', color: '#58a6ff', border: '1px solid #30363d', borderRadius: '8px', cursor: 'pointer', fontSize: '0.875rem' }}>
              ← Back to Home
            </button>
            <h1 style={{ color: '#ffffff', fontSize: '1.75rem', margin: 0, fontWeight: '600' }}>📚 My Custom Sheet</h1>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => setShowAddForm(true)}
              style={{ padding: '0.75rem 1.5rem', background: 'linear-gradient(135deg, #238636 0%, #2ea043 100%)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '600', transition: 'transform 0.2s', boxShadow: '0 4px 12px rgba(35, 134, 54, 0.2)' }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              + Add New Problem
            </button>
          </div>
        </div>

        {showAddForm && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '2rem', backdropFilter: 'blur(4px)' }}>
            <div style={{ background: '#161b22', padding: '2rem', borderRadius: '12px', border: '1px solid #30363d', maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
              <h2 style={{ color: '#ffffff', fontSize: '1.5rem', marginBottom: '1.5rem', margin: 0 }}>Add New Problem</h2>
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', color: '#8b949e', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: '500' }}>Problem ID (Required)</label>
                  <input
                    type="text"
                    value={formData.problemId}
                    onChange={(e) => setFormData({ ...formData, problemId: e.target.value })}
                    required
                    placeholder="e.g., 1, 2, 3..."
                    style={{ width: '100%', padding: '0.875rem', background: '#010409', border: '1px solid #30363d', borderRadius: '8px', color: '#f0f6fc', outline: 'none' }}
                  />
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', color: '#8b949e', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: '500' }}>Notes/Approach (Optional)</label>
                  <textarea
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    placeholder="Describe your approach..."
                    style={{ width: '100%', minHeight: '100px', padding: '0.875rem', background: '#010409', border: '1px solid #30363d', borderRadius: '8px', color: '#f0f6fc', resize: 'vertical', outline: 'none' }}
                  />
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', color: '#8b949e', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: '500' }}>Language</label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    style={{ width: '100%', padding: '0.875rem', background: '#010409', border: '1px solid #30363d', borderRadius: '8px', color: '#f0f6fc', outline: 'none' }}
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                  </select>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                  <label style={{ display: 'block', color: '#8b949e', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: '500' }}>Code Solution (Optional)</label>
                  <textarea
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="Paste code here..."
                    style={{ width: '100%', minHeight: '150px', padding: '0.875rem', background: '#010409', border: '1px solid #30363d', borderRadius: '8px', color: '#fbfbfb', fontFamily: 'monospace', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button type="submit" style={{ flex: 1, padding: '0.875rem', background: 'linear-gradient(135deg, #238636 0%, #2ea043 100%)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.95rem' }}>Add Problem</button>
                  <button type="button" onClick={() => setShowAddForm(false)} style={{ flex: 1, padding: '0.875rem', background: 'rgba(248, 81, 73, 0.1)', color: '#f85149', border: '1px solid rgba(248, 81, 73, 0.3)', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.95rem' }}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div style={{ background: '#0d1117', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)', border: '1px solid #30363d', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '60px 80px 1fr 120px 150px 70px 70px', padding: '1.25rem 1.5rem', borderBottom: '1px solid #30363d', background: '#161b22', fontWeight: '600', color: '#8b949e', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <div style={{ textAlign: 'center' }}>✓</div>
            <div>ID</div>
            <div>Problem</div>
            <div>Difficulty</div>
            <div>Category</div>
            <div style={{ textAlign: 'center' }}>Link</div>
            <div style={{ textAlign: 'center' }}>Actions</div>
          </div>
          {problems.length === 0 ? (
            <div style={{ padding: '4rem', textAlign: 'center', color: '#8b949e' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
              <p style={{ fontSize: '1.1rem' }}>No custom problems yet.</p>
              <button onClick={() => setShowAddForm(true)} style={{ marginTop: '1rem', background: 'none', border: 'none', color: '#58a6ff', cursor: 'pointer', textDecoration: 'underline' }}>Add your first problem</button>
            </div>
          ) : (
            problems.map((problem) => (
              <div key={problem.id} style={{ display: 'grid', gridTemplateColumns: '60px 80px 1fr 120px 150px 70px 70px', padding: '1.25rem 1.5rem', borderBottom: '1px solid #21262d', alignItems: 'center', transition: 'background 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#161b22'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <input type="checkbox" checked={problem.completed || false} onChange={() => toggleComplete(problem.id, problem.completed)} />
                </div>
                <div style={{ color: '#8b949e', fontWeight: '600' }}>#{problem.problem_id}</div>
                <div style={{ color: '#f0f6fc', fontWeight: '500' }}>{problem.title}</div>
                <div>
                  <span style={{ 
                    color: problem.difficulty === 'Easy' ? '#3fb950' : problem.difficulty === 'Medium' ? '#d29922' : '#f85149',
                    background: problem.difficulty === 'Easy' ? 'rgba(63, 185, 80, 0.1)' : problem.difficulty === 'Medium' ? 'rgba(210, 153, 34, 0.1)' : 'rgba(248, 81, 73, 0.1)',
                    padding: '0.25rem 0.6rem',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    border: `1px solid ${problem.difficulty === 'Easy' ? 'rgba(63, 185, 80, 0.2)' : problem.difficulty === 'Medium' ? 'rgba(210, 153, 34, 0.2)' : 'rgba(248, 81, 73, 0.2)'}`
                  }}>
                    {problem.difficulty}
                  </span>
                </div>
                <div style={{ color: '#8b949e', fontSize: '0.85rem' }}>{problem.category || '-'}</div>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <a href={problem.leetcode_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', transition: 'transform 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                    <Image src="/leetcode-icon.webp" alt="LeetCode" width={22} height={22} />
                  </a>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
                  <button onClick={() => router.push(`/custom/${problem.id}`)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', filter: 'grayscale(1)', opacity: 0.7, transition: 'all 0.2s' }} onMouseEnter={(e) => {e.currentTarget.style.filter='grayscale(0)'; e.currentTarget.style.opacity=1;}} onMouseLeave={(e) => {e.currentTarget.style.filter='grayscale(1)'; e.currentTarget.style.opacity=0.7;}}>📝</button>
                  <button onClick={() => deleteProblem(problem.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', filter: 'grayscale(1)', opacity: 0.7, transition: 'all 0.2s' }} onMouseEnter={(e) => {e.currentTarget.style.filter='grayscale(0)'; e.currentTarget.style.opacity=1;}} onMouseLeave={(e) => {e.currentTarget.style.filter='grayscale(1)'; e.currentTarget.style.opacity=0.7;}}>🗑️</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}


