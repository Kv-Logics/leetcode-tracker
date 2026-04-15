'use client';
import { useState, useEffect } from 'react';

interface LeetCodeQuestion {
  id: string;
  title: string;
  difficulty: string;
  category: string;
  url: string;
}

export default function LeetCodeAll() {
  const [token, setToken] = useState('');
  const [user, setUser] = useState<any>(null);
  const [questions, setQuestions] = useState<LeetCodeQuestion[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      loadQuestions();
    }
  }, []);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/leetcode-all', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setQuestions(data.questions || []);
    } catch (error) {
      console.error('Error loading questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         q.id.includes(searchTerm);
    const matchesDifficulty = difficultyFilter === 'All' || q.difficulty === difficultyFilter;
    return matchesSearch && matchesDifficulty;
  });

  const logout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  if (!token) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000000' }}>
        <div style={{ textAlign: 'center', color: '#ffffff' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔐</div>
          <p>Please login first</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#000000', padding: '2rem' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid #222222' }}>
          <div>
            <h1 style={{ color: '#ffffff', fontSize: '2rem', margin: 0, fontWeight: '600' }}>🔍 All LeetCode Questions</h1>
            <p style={{ color: '#999999', margin: '0.5rem 0 0 0' }}>Browse all {questions.length} questions</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span style={{ color: '#999999', fontSize: '0.875rem' }}>👤 {user?.username}</span>
            <button 
              onClick={() => window.location.href = '/'}
              style={{ padding: '0.5rem 1rem', background: 'rgba(88, 166, 255, 0.15)', color: '#58a6ff', border: '1px solid rgba(88, 166, 255, 0.4)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.875rem', transition: 'all 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(88, 166, 255, 0.25)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(88, 166, 255, 0.15)'; }}
            >
              ← Back
            </button>
            <button 
              onClick={logout}
              style={{ padding: '0.5rem 1rem', background: 'rgba(218, 54, 51, 0.15)', color: '#f85149', border: '1px solid rgba(248, 81, 73, 0.4)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.875rem', transition: 'all 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(218, 54, 51, 0.25)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(218, 54, 51, 0.15)'; }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div style={{ background: '#1a1a1a', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', border: '1px solid #222222', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="🔍 Search by title or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: 1, minWidth: '280px', padding: '0.875rem 1rem', border: '1px solid #333333', borderRadius: '8px', background: '#0a0a0a', color: '#ffffff', fontSize: '0.95rem' }}
            onFocus={(e) => { e.target.style.borderColor = '#58a6ff'; }}
            onBlur={(e) => { e.target.style.borderColor = '#333333'; }}
          />
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            style={{ padding: '0.875rem 1rem', border: '1px solid #333333', borderRadius: '8px', cursor: 'pointer', background: '#0a0a0a', color: '#ffffff', fontSize: '0.95rem', minWidth: '120px' }}
          >
            <option>All</option>
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>
        </div>

        {/* Questions Table */}
        {loading ? (
          <div style={{ textAlign: 'center', color: '#999999', padding: '3rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
            <p>Loading questions...</p>
          </div>
        ) : (
          <div style={{ background: '#1a1a1a', borderRadius: '12px', border: '1px solid #222222', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 140px 100px 50px', padding: '1.25rem 1.5rem', borderBottom: '1px solid #222222', background: '#0a0a0a', fontWeight: '600', color: '#999999', fontSize: '0.875rem' }}>
              <div>ID</div>
              <div>Title</div>
              <div>Difficulty</div>
              <div>Category</div>
              <div style={{ textAlign: 'center' }}>Link</div>
            </div>
            {filteredQuestions.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#999999' }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔍</div>
                <p>No questions found</p>
              </div>
            ) : (
              filteredQuestions.map((question) => (
                <div key={question.id} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 140px 100px 50px', padding: '1.25rem 1.5rem', borderBottom: '1px solid #222222', alignItems: 'center', transition: 'all 0.2s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(88, 166, 255, 0.05)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
                  <div style={{ color: '#999999', fontSize: '0.875rem', fontWeight: '600' }}>#{question.id}</div>
                  <div style={{ color: '#ffffff', fontSize: '0.95rem' }}>{question.title}</div>
                  <div>
                    <span style={{ 
                      color: question.difficulty === 'Easy' ? '#3fb950' : question.difficulty === 'Medium' ? '#d29922' : '#f85149', 
                      fontWeight: '600', 
                      fontSize: '0.875rem',
                      padding: '0.375rem 0.75rem',
                      borderRadius: '6px',
                      background: question.difficulty === 'Easy' ? 'rgba(63, 185, 80, 0.15)' : question.difficulty === 'Medium' ? 'rgba(210, 153, 34, 0.15)' : 'rgba(248, 81, 73, 0.15)',
                      border: `1px solid ${question.difficulty === 'Easy' ? 'rgba(63, 185, 80, 0.3)' : question.difficulty === 'Medium' ? 'rgba(210, 153, 34, 0.3)' : 'rgba(248, 81, 73, 0.3)'}`,
                      display: 'inline-block'
                    }}>
                      {question.difficulty}
                    </span>
                  </div>
                  <div style={{ color: '#999999', fontSize: '0.875rem' }}>{question.category}</div>
                  <div style={{ textAlign: 'center' }}>
                    <a
                      href={question.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', opacity: 0.6, transition: 'all 0.2s', padding: '0.5rem', borderRadius: '8px' }}
                      onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.background = 'rgba(255, 161, 22, 0.1)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.6'; e.currentTarget.style.background = 'transparent'; }}
                    >
                      <img src="/leetcode-icon.webp" alt="LeetCode" style={{ width: '20px', height: '20px' }} />
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
