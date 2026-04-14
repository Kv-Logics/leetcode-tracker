'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
    const res = await fetch('/api/custom-problems', {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const data = await res.json();
    setProblems(data.problems || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/custom-problems', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(formData)
    });
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
    fetchProblems(token);
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a1f2e 0%, #0d1117 100%)', padding: '2rem' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button onClick={() => router.push('/')} style={{ padding: '0.5rem 1rem', background: 'rgba(88, 166, 255, 0.1)', color: '#58a6ff', border: '1px solid rgba(88, 166, 255, 0.3)', borderRadius: '8px', cursor: 'pointer' }}>
              ← Back
            </button>
            <h1 style={{ color: '#c9d1d9', fontSize: '1.75rem', margin: 0 }}>📚 My Custom Sheet</h1>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            style={{ padding: '0.75rem 1.5rem', background: 'linear-gradient(135deg, #238636 0%, #2ea043 100%)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', fontWeight: '600' }}
          >
            + Add Problem
          </button>
        </div>

        {showAddForm && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '2rem' }}>
            <div style={{ background: 'rgba(22, 27, 34, 0.98)', padding: '2rem', borderRadius: '12px', border: '1px solid rgba(48, 54, 61, 0.5)', maxWidth: '800px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
              <h2 style={{ color: '#c9d1d9', fontSize: '1.5rem', marginBottom: '1.5rem' }}>Add New Problem</h2>
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', color: '#8b949e', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Problem ID (e.g., 1, 2, 3)</label>
                    <input
                      type="text"
                      value={formData.problemId}
                      onChange={(e) => setFormData({ ...formData, problemId: e.target.value })}
                      required
                      style={{ width: '100%', padding: '0.75rem', background: '#0d1117', border: '1px solid #30363d', borderRadius: '6px', color: '#c9d1d9' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#8b949e', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Difficulty</label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', background: '#0d1117', border: '1px solid #30363d', borderRadius: '6px', color: '#c9d1d9', cursor: 'pointer' }}
                    >
                      <option>Easy</option>
                      <option>Medium</option>
                      <option>Hard</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', color: '#8b949e', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Problem Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    placeholder="e.g., Two Sum"
                    style={{ width: '100%', padding: '0.75rem', background: '#0d1117', border: '1px solid #30363d', borderRadius: '6px', color: '#c9d1d9' }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', color: '#8b949e', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Category/Topic (e.g., Arrays, Strings, DP)</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Arrays, Hash Table, Two Pointers"
                    style={{ width: '100%', padding: '0.75rem', background: '#0d1117', border: '1px solid #30363d', borderRadius: '6px', color: '#c9d1d9' }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', color: '#8b949e', fontSize: '0.875rem', marginBottom: '0.5rem' }}>LeetCode URL (optional)</label>
                  <input
                    type="url"
                    value={formData.leetcodeUrl}
                    onChange={(e) => setFormData({ ...formData, leetcodeUrl: e.target.value })}
                    placeholder="https://leetcode.com/problems/..."
                    style={{ width: '100%', padding: '0.75rem', background: '#0d1117', border: '1px solid #30363d', borderRadius: '6px', color: '#c9d1d9' }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', color: '#8b949e', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Notes/Approach (optional)</label>
                  <textarea
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    placeholder="Your approach, time complexity, key insights..."
                    style={{ width: '100%', minHeight: '100px', padding: '0.75rem', background: '#0d1117', border: '1px solid #30363d', borderRadius: '6px', color: '#c9d1d9', fontFamily: 'monospace', resize: 'vertical' }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', color: '#8b949e', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Language</label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', background: '#0d1117', border: '1px solid #30363d', borderRadius: '6px', color: '#c9d1d9', cursor: 'pointer' }}
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                    <option value="go">Go</option>
                    <option value="rust">Rust</option>
                  </select>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', color: '#8b949e', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Code Solution (optional)</label>
                  <textarea
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="Paste your solution code here..."
                    style={{ width: '100%', minHeight: '150px', padding: '0.75rem', background: '#0d1117', border: '1px solid #30363d', borderRadius: '6px', color: '#c9d1d9', fontFamily: 'monospace', fontSize: '0.875rem', resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    type="submit"
                    style={{ flex: 1, padding: '0.75rem', background: 'linear-gradient(135deg, #238636 0%, #2ea043 100%)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', fontWeight: '600' }}
                  >
                    Add Problem
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    style={{ flex: 1, padding: '0.75rem', background: 'rgba(248, 81, 73, 0.1)', color: '#f85149', border: '1px solid rgba(248, 81, 73, 0.3)', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', fontWeight: '600' }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div style={{ background: 'rgba(22, 27, 34, 0.6)', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.3)', border: '1px solid rgba(48, 54, 61, 0.5)', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '60px 80px 1fr 120px 150px 70px 70px', padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(48, 54, 61, 0.5)', background: 'rgba(13, 17, 23, 0.6)', fontWeight: '600', color: '#8b949e', fontSize: '0.875rem' }}>
            <div style={{ textAlign: 'center' }}>✓</div>
            <div>ID</div>
            <div>Problem</div>
            <div>Difficulty</div>
            <div>Category</div>
            <div style={{ textAlign: 'center' }}>Link</div>
            <div style={{ textAlign: 'center' }}>Actions</div>
          </div>
          {problems.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#8b949e' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
              <p>No custom problems yet. Click "Add Problem" to get started!</p>
            </div>
          ) : (
            problems.map((problem, index) => (
              <div key={problem.id} style={{ display: 'grid', gridTemplateColumns: '60px 80px 1fr 120px 150px 70px 70px', padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(48, 54, 61, 0.3)', alignItems: 'center', transition: 'all 0.2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(13, 17, 23, 0.4)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <label style={{ position: 'relative', cursor: 'pointer', width: '26px', height: '26px' }}>
                    <input
                      type="checkbox"
                      checked={problem.completed || false}
                      onChange={() => toggleComplete(problem.id, problem.completed)}
                      style={{ position: 'absolute', opacity: 0, cursor: 'pointer' }}
                    />
                    <span style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      height: '26px',
                      width: '26px',
                      background: problem.completed ? 'linear-gradient(135deg, #238636 0%, #2ea043 100%)' : 'rgba(13, 17, 23, 0.6)',
                      border: `2px solid ${problem.completed ? '#2ea043' : '#30363d'}`,
                      borderRadius: '6px',
                      transition: 'all 0.3s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: problem.completed ? '0 2px 8px rgba(35, 134, 54, 0.4)' : 'none'
                    }}>
                      {problem.completed && <span style={{ color: 'white', fontSize: '18px', fontWeight: 'bold' }}>✓</span>}
                    </span>
                  </label>
                </div>
                <div style={{ color: '#8b949e', fontSize: '0.95rem', fontWeight: '600' }}>#{problem.problem_id}</div>
                <div>
                  <h3 style={{ margin: 0, textDecoration: problem.completed ? 'line-through' : 'none', color: problem.completed ? '#6e7681' : '#c9d1d9', fontSize: '1rem', fontWeight: '500' }}>{problem.title}</h3>
                </div>
                <div>
                  <span style={{
                    color: problem.difficulty === 'Easy' ? '#3fb950' : problem.difficulty === 'Medium' ? '#d29922' : '#f85149',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                    padding: '0.375rem 0.75rem',
                    borderRadius: '6px',
                    background: problem.difficulty === 'Easy' ? 'rgba(63, 185, 80, 0.15)' : problem.difficulty === 'Medium' ? 'rgba(210, 153, 34, 0.15)' : 'rgba(248, 81, 73, 0.15)',
                    border: `1px solid ${problem.difficulty === 'Easy' ? 'rgba(63, 185, 80, 0.3)' : problem.difficulty === 'Medium' ? 'rgba(210, 153, 34, 0.3)' : 'rgba(248, 81, 73, 0.3)'}`,
                    display: 'inline-block'
                  }}>
                    {problem.difficulty}
                  </span>
                </div>
                <div style={{ color: '#8b949e', fontSize: '0.875rem' }}>{problem.category || '-'}</div>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  {problem.leetcode_url ? (
                    <a href={problem.leetcode_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', opacity: 0.6, transition: 'all 0.2s', padding: '0.5rem', borderRadius: '8px' }}
                      onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.background = 'rgba(255, 161, 22, 0.1)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.6'; e.currentTarget.style.background = 'transparent'; }}>
                      <img src="/leetcode-icon.webp" alt="LeetCode" style={{ width: '26px', height: '26px' }} />
                    </a>
                  ) : (
                    <span style={{ color: '#6e7681' }}>-</span>
                  )}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                  <button
                    onClick={() => router.push(`/custom/${problem.id}`)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: '#58a6ff', opacity: 0.6, transition: 'all 0.2s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1.2)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.6'; e.currentTarget.style.transform = 'scale(1)'; }}
                    title="View/Edit"
                  >
                    📝
                  </button>
                  <button
                    onClick={() => deleteProblem(problem.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: '#f85149', opacity: 0.6, transition: 'all 0.2s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1.2)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.6'; e.currentTarget.style.transform = 'scale(1)'; }}
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
