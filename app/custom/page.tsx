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
    // Optimistic state update for instant UI feedback
    setProblems(prev => prev.map(p => p.id === id ? { ...p, completed: !completed } : p));

    try {
      await fetch('/api/custom-problems', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id, completed: !completed })
      });
    } catch (error) {
      console.error('Failed to sync custom problem toggle:', error);
      // Rollback on failure
      setProblems(prev => prev.map(p => p.id === id ? { ...p, completed } : p));
    }
  };

  const completedCount = problems.filter(p => p.completed).length;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-dark)', color: 'var(--text-main)' }}>
      {/* Header */}
      <nav style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '1rem 2rem', borderBottom: '1px solid var(--border-color)', backdropFilter: 'blur(12px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={() => router.push('/')} className="saas-button-secondary">◀ Back to Dashboard</button>
          <h1 className="font-heading" style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📚</span> My Custom Sheet
          </h1>
        </div>
        <button onClick={() => setShowAddForm(true)} className="saas-button">+ Add Problem by ID</button>
      </nav>

      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>CUSTOM PROBLEMS</div>
            <div className="font-heading" style={{ fontSize: '2rem', fontWeight: 700, color: '#fff' }}>{problems.length}</div>
          </div>
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>SOLVED</div>
            <div className="font-heading" style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--easy)' }}>{completedCount}</div>
          </div>
        </div>

        {/* Add Modal */}
        {showAddForm && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '2rem', background: 'var(--bg-card)' }}>
              <h2 className="font-heading" style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#fff' }}>Add Problem to Custom Sheet</h2>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>LeetCode Problem ID</label>
                  <input
                    type="text"
                    className="saas-input"
                    placeholder="e.g. 1, 42, 121"
                    value={formData.problemId}
                    onChange={(e) => setFormData({ ...formData, problemId: e.target.value })}
                    style={{ width: '100%' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Notes (Optional)</label>
                  <textarea
                    className="saas-input"
                    rows={3}
                    placeholder="Key concepts or approaches..."
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    style={{ width: '100%', fontFamily: 'inherit' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                  <button type="button" onClick={() => setShowAddForm(false)} className="saas-button-secondary">Cancel</button>
                  <button type="submit" className="saas-button">Add Problem</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '60px 80px 1fr 120px 80px 80px', padding: '14px 20px', background: 'rgba(15, 23, 42, 0.8)', borderBottom: '1px solid var(--border-color)', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            <div style={{ textAlign: 'center' }}>STATUS</div>
            <div>#ID</div>
            <div>TITLE</div>
            <div>DIFFICULTY</div>
            <div style={{ textAlign: 'center' }}>LINK</div>
            <div style={{ textAlign: 'center' }}>ACTION</div>
          </div>

          {problems.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No custom problems added yet. Click "+ Add Problem by ID" to build your sheet!
            </div>
          ) : (
            problems.map((p) => (
              <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '60px 80px 1fr 120px 80px 80px', padding: '14px 20px', borderBottom: '1px solid var(--border-color)', alignItems: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={p.completed}
                    onChange={() => toggleComplete(p.id, p.completed)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                  />
                </div>
                <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem', fontWeight: 600 }}>#{p.problem_id}</div>
                <div style={{ color: p.completed ? 'var(--text-muted)' : '#fff', textDecoration: p.completed ? 'line-through' : 'none' }}>{p.title}</div>
                <div>
                  <span className={p.difficulty === 'Easy' ? 'badge-easy' : p.difficulty === 'Medium' ? 'badge-medium' : 'badge-hard'} style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>
                    {p.difficulty}
                  </span>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <a href={p.leetcode_url} target="_blank" rel="noopener noreferrer">
                    <img src="/leetcode-icon.webp" alt="LeetCode" style={{ width: '20px', height: '20px' }} />
                  </a>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <button onClick={() => deleteProblem(p.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1rem' }}>🗑️</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
