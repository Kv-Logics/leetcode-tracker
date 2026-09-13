'use client';
import { useState, useEffect } from 'react';
import { Problem } from '@/lib/problems';

export default function Home() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [user, setUser] = useState<any>(null);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('All');
  const [companies, setCompanies] = useState<string[]>(['PayPal']);
  const [selectedCompany, setSelectedCompany] = useState('PayPal');
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [showBookmarkDropdown, setShowBookmarkDropdown] = useState<string | null>(null);
  const [showCreateBookmark, setShowCreateBookmark] = useState(false);
  const [newBookmarkName, setNewBookmarkName] = useState('');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    const savedTheme = (localStorage.getItem('theme') as 'dark' | 'light') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      fetchCompanies(savedToken);
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  useEffect(() => {
    if (token && selectedCompany) {
      fetchProblems(token, selectedCompany);
      fetchBookmarks(token);
    }
  }, [selectedCompany, token]);

  const fetchBookmarks = async (authToken: string) => {
    const res = await fetch('/api/bookmarks', {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const data = await res.json();
    setBookmarks(data.bookmarks || []);
  };

  const createBookmark = async () => {
    if (!newBookmarkName.trim()) return;
    await fetch('/api/bookmarks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name: newBookmarkName })
    });
    setNewBookmarkName('');
    setShowCreateBookmark(false);
    fetchBookmarks(token);
  };

  const addToBookmark = async (bookmarkId: string, problemId: string) => {
    await fetch('/api/bookmarks/items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ bookmarkId, problemId, companyName: selectedCompany })
    });
    fetchBookmarks(token);
    setShowBookmarkDropdown(null);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
    
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, role: 'user' })
    });
    
    const data = await res.json();
    if (data.token) {
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      await fetchCompanies(data.token);
    }
  };

  const fetchCompanies = async (authToken: string) => {
    const res = await fetch('/api/companies', {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const data = await res.json();
    const companyNames = data.companies.map((c: any) => c.name);
    setCompanies(companyNames.length > 0 ? companyNames : ['PayPal']);
    if (companyNames.length > 0) {
      setSelectedCompany(companyNames[0]);
    }
  };

  const fetchProblems = async (authToken: string, company: string) => {
    const res = await fetch(`/api/problems?company=${company}`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const data = await res.json();
    setProblems(data.problems || []);
    setCompleted(data.completed || {});
  };

  const toggleProblem = async (problemId: string) => {
    const newStatus = !completed[problemId];
    // Optimistic UI update for zero lag
    setCompleted(prev => ({ ...prev, [problemId]: newStatus }));

    try {
      await fetch('/api/problems', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ problemId, completed: newStatus, company: selectedCompany })
      });
    } catch (error) {
      console.error('Failed to sync toggle with server:', error);
      // Rollback if request fails
      setCompleted(prev => ({ ...prev, [problemId]: !newStatus }));
    }
  };

  const logout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const filteredProblems = problems.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         p.id.includes(searchTerm);
    const matchesDifficulty = difficultyFilter === 'All' || p.difficulty === difficultyFilter;
    return matchesSearch && matchesDifficulty;
  });

  const completedCount = Object.values(completed).filter(Boolean).length;
  const progressPercent = problems.length > 0 ? Math.round((completedCount / problems.length) * 100) : 0;

  // Login Screen
  if (!token) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)', padding: '20px' }}>
        <div className="saas-card" style={{ padding: '2.5rem', width: '100%', maxWidth: '400px' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            <button onClick={toggleTheme} className="theme-toggle-btn">
              {theme === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode'}
            </button>
          </div>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ width: '48px', height: '48px', background: 'var(--primary-light)', borderRadius: '12px', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 800, marginBottom: '12px' }}>
              ⚡
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>adflux.com</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '4px' }}>{isLogin ? 'Sign in to your dashboard' : 'Create an account to track DSA'}</p>
          </div>
          <form onSubmit={handleAuth}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px', letterSpacing: '0.05em' }}>USERNAME</label>
              <input
                type="text"
                className="saas-input"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px', letterSpacing: '0.05em' }}>PASSWORD</label>
              <input
                type="password"
                className="saas-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
            <button type="submit" className="saas-btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '11px' }}>
              {isLogin ? 'Sign In' : 'Sign Up'}
            </button>
          </form>
          <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
            <button onClick={() => setIsLogin(!isLogin)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}>
              {isLogin ? "Need an account? Sign up" : 'Have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', color: 'var(--text-main)', display: 'flex' }}>
      
      {/* Sidebar */}
      <div style={{ width: '68px', background: 'var(--bg-card)', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0', zIndex: 100 }}>
        <div style={{ width: '40px', height: '40px', background: 'var(--primary)', borderRadius: '10px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 'bold', marginBottom: '24px' }}>
          ⚡
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
          <button onClick={() => window.location.href = '/'} style={{ width: '40px', height: '40px', borderRadius: '10px', border: 'none', background: 'var(--primary-light)', color: 'var(--primary)', cursor: 'pointer', fontSize: '18px' }} title="Dashboard">📊</button>
          <button onClick={() => window.location.href = '/custom'} style={{ width: '40px', height: '40px', borderRadius: '10px', border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '18px' }} title="My Custom Sheet">📚</button>
          <button onClick={() => window.location.href = '/upload'} style={{ width: '40px', height: '40px', borderRadius: '10px', border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '18px' }} title="Add Company">➕</button>
          <button onClick={() => window.location.href = '/leetcode-all'} style={{ width: '40px', height: '40px', borderRadius: '10px', border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '18px' }} title="All Problems">🔍</button>
        </div>
        <button onClick={logout} style={{ width: '40px', height: '40px', borderRadius: '10px', border: 'none', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', cursor: 'pointer', fontSize: '18px' }} title="Logout">🚪</button>
      </div>

      {/* Main Workspace Layout */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px 32px' }}>
        
        {/* Header Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 600, display: 'flex', gap: '6px', alignItems: 'center' }}>
              <span>Campaigns</span> › <span>Overview</span> › <span style={{ color: 'var(--text-main)' }}>{selectedCompany} Strategy</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>{selectedCompany} Sheet</h1>
              <span style={{ background: 'var(--easy-bg)', color: 'var(--easy)', padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>Active</span>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {/* UI Theme Switch Button */}
            <button onClick={toggleTheme} className="theme-toggle-btn">
              {theme === 'dark' ? '🌙 Dark Eye-Care' : '☀️ Light SaaS'}
            </button>

            <input
              type="text"
              className="saas-input"
              placeholder="Search problems..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '220px' }}
            />
            <button onClick={() => window.location.href = '/upload'} className="saas-btn-primary">
              + Create Campaign Sheet
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-card)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
              <button
                key={diff}
                onClick={() => setDifficultyFilter(diff)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  background: difficultyFilter === diff ? 'var(--primary-light)' : 'transparent',
                  color: difficultyFilter === diff ? 'var(--primary)' : 'var(--text-muted)',
                  fontWeight: difficultyFilter === diff ? 700 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                {diff}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Company Target:</span>
            <select
              className="saas-input"
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              style={{ fontWeight: 600 }}
            >
              {companies.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '28px' }}>
          
          <div className="saas-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Total Problems</span>
              <span style={{ background: 'var(--easy-bg)', color: 'var(--easy)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>100% Target</span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', margin: '8px 0 2px 0' }}>{problems.length}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Loaded for {selectedCompany}</div>
          </div>

          <div className="saas-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Solved Conversion</span>
              <span style={{ background: 'var(--easy-bg)', color: 'var(--easy)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>{progressPercent}% Complete</span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', margin: '8px 0 2px 0' }}>{completedCount}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>from {problems.length} total questions</div>
          </div>

          <div className="saas-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Remaining Target</span>
              <span style={{ background: 'var(--medium-bg)', color: 'var(--medium)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>In Progress</span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', margin: '8px 0 2px 0' }}>{problems.length - completedCount}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>questions remaining to solve</div>
          </div>

        </div>

        {/* Data Table */}
        <div className="saas-card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>Target Questions</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>Track progress for active campaigns.</p>
            </div>
            <span style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700 }}>
              {filteredProblems.length} Items
            </span>
          </div>

          {/* Table Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '60px 80px 1fr 140px 80px 60px 60px', padding: '12px 24px', background: 'var(--bg-card-hover)', borderBottom: '1px solid var(--border-color)', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
            <div style={{ textAlign: 'center' }}>DONE</div>
            <div>#ID</div>
            <div>PROBLEM TITLE</div>
            <div>DIFFICULTY</div>
            <div style={{ textAlign: 'center' }}>LEETCODE</div>
            <div style={{ textAlign: 'center' }}>FAV</div>
            <div style={{ textAlign: 'center' }}>NOTES</div>
          </div>

          {/* Table Rows */}
          {filteredProblems.map((problem) => (
            <div
              key={problem.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '60px 80px 1fr 140px 80px 60px 60px',
                padding: '14px 24px',
                borderBottom: '1px solid var(--border-color)',
                alignItems: 'center',
                background: completed[problem.id] ? 'var(--bg-card-hover)' : 'transparent'
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <input
                  type="checkbox"
                  checked={completed[problem.id] || false}
                  onChange={() => toggleProblem(problem.id)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                />
              </div>
              <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem', fontWeight: 600 }}>#{problem.id}</div>
              <div style={{ fontWeight: 600, color: completed[problem.id] ? 'var(--text-dim)' : 'var(--text-main)', textDecoration: completed[problem.id] ? 'line-through' : 'none' }}>
                {problem.title}
              </div>
              <div>
                <span className={problem.difficulty === 'Easy' ? 'badge-easy' : problem.difficulty === 'Medium' ? 'badge-medium' : 'badge-hard'} style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>
                  {problem.difficulty}
                </span>
              </div>
              <div style={{ textAlign: 'center' }}>
                <a href={problem.leetcodeUrl} target="_blank" rel="noopener noreferrer">
                  <img src="/leetcode-icon.webp" alt="LeetCode" style={{ width: '20px', height: '20px' }} />
                </a>
              </div>
              <div style={{ textAlign: 'center' }}>
                <button onClick={() => setShowBookmarkDropdown(problem.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: '#f59e0b' }}>★</button>
              </div>
              <div style={{ textAlign: 'center' }}>
                <button onClick={() => window.location.href = `/problem/${selectedCompany}/${problem.id}`} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: 'var(--primary)' }}>📝</button>
              </div>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
}
