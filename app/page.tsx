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
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      fetchCompanies(savedToken);
    }
  }, []);

  useEffect(() => {
    if (token && selectedCompany) {
      fetchProblems(token, selectedCompany);
      fetchBookmarks(token);
    }
  }, [selectedCompany, token]);

  // Handle Escape key to close bookmark modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showBookmarkDropdown) {
        setShowBookmarkDropdown(null);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [showBookmarkDropdown]);

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

  const isInBookmark = (problemId: string, bookmarkId: string) => {
    const bookmark = bookmarks.find(b => b.id === bookmarkId);
    return bookmark?.bookmark_items?.some((item: any) => 
      item.problem_id === problemId && item.company_name === selectedCompany
    );
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
    setProblems(data.problems);
    setCompleted(data.completed);
  };

  const toggleProblem = async (problemId: string) => {
    const newStatus = !completed[problemId];
    await fetch('/api/problems', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ problemId, completed: newStatus, company: selectedCompany })
    });
    setCompleted({ ...completed, [problemId]: newStatus });
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

  if (!token) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000000' }}>
        <div style={{ background: '#1a1a1a', padding: '2.5rem', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', width: '100%', maxWidth: '420px', border: '1px solid #333333', backdropFilter: 'blur(10px)' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎯</div>
            <h1 style={{ margin: 0, fontSize: '1.75rem', color: '#ffffff', fontWeight: '600' }}>{isLogin ? 'Welcome Back' : 'Get Started'}</h1>
            <p style={{ margin: '0.5rem 0 0 0', color: '#999999', fontSize: '0.875rem' }}>Track your LeetCode journey</p>
          </div>
          <form onSubmit={handleAuth}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ width: '100%', padding: '0.875rem', marginBottom: '1rem', border: '1px solid #333333', borderRadius: '8px', background: '#0a0a0a', color: '#ffffff', fontSize: '1rem', transition: 'border-color 0.2s' }}
              onFocus={(e) => e.target.style.borderColor = '#58a6ff'}
              onBlur={(e) => e.target.style.borderColor = '#333333'}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '0.875rem', marginBottom: '1.5rem', border: '1px solid #333333', borderRadius: '8px', background: '#0a0a0a', color: '#ffffff', fontSize: '1rem', transition: 'border-color 0.2s' }}
              onFocus={(e) => e.target.style.borderColor = '#58a6ff'}
              onBlur={(e) => e.target.style.borderColor = '#333333'}
            />
            <button type="submit" style={{ width: '100%', padding: '0.875rem', background: 'linear-gradient(135deg, #238636 0%, #2ea043 100%)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', fontWeight: '600', transition: 'transform 0.2s, box-shadow 0.2s', boxShadow: '0 4px 12px rgba(35, 134, 54, 0.3)' }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(35, 134, 54, 0.4)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(35, 134, 54, 0.3)'; }}>
              {isLogin ? 'Login' : 'Sign Up'}
            </button>
          </form>
          <p style={{ marginTop: '1rem', textAlign: 'center' }}>
            <button onClick={() => setIsLogin(!isLogin)} style={{ background: 'none', border: 'none', color: '#58a6ff', cursor: 'pointer' }}>
              {isLogin ? 'Need an account? Sign up' : 'Have an account? Login'}
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#000000', display: 'flex' }}>
      {/* Sidebar */}
      
      {/* Sidebar */}
      <div style={{ 
        width: sidebarOpen ? '280px' : '60px', 
        background: '#0a0a0a', 
        borderRight: '1px solid #222222', 
        transition: 'width 0.3s',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        left: 0,
        top: 0,
        zIndex: 100
      }}>
        {/* Header - Fixed at top */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #222222', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          {sidebarOpen && <h2 style={{ color: '#ffffff', fontSize: '1.25rem', margin: 0, fontWeight: '600' }}>Companies</h2>}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ background: 'none', border: 'none', color: '#888888', cursor: 'pointer', fontSize: '1.25rem', padding: '0.25rem' }}
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        {/* Fixed buttons at top - below header */}
        <div style={{ padding: '1rem', borderBottom: '1px solid #222222', flexShrink: 0 }}>
          {sidebarOpen ? (
            <>
              <button 
                onClick={() => window.location.href = '/custom'}
                style={{ 
                  width: '100%', 
                  padding: '0.75rem', 
                  background: 'rgba(210, 153, 34, 0.15)', 
                  color: '#d29922', 
                  border: '1px solid rgba(210, 153, 34, 0.4)', 
                  borderRadius: '8px', 
                  cursor: 'pointer', 
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  marginBottom: '0.5rem',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(210, 153, 34, 0.25)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(210, 153, 34, 0.15)'; }}
              >
                📚 My Custom Sheet
              </button>
              <button 
                onClick={() => window.location.href = '/upload'}
                style={{ 
                  width: '100%', 
                  padding: '0.75rem', 
                  background: 'rgba(88, 166, 255, 0.15)', 
                  color: '#58a6ff', 
                  border: '1px solid rgba(88, 166, 255, 0.4)', 
                  borderRadius: '8px', 
                  cursor: 'pointer', 
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  marginBottom: '0.5rem',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(88, 166, 255, 0.25)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(88, 166, 255, 0.15)'; }}
              >
                + Add Company
              </button>
              <button 
                onClick={() => window.location.href = '/leetcode-all'}
                style={{ 
                  width: '100%', 
                  padding: '0.75rem', 
                  background: 'rgba(255, 161, 22, 0.15)', 
                  color: '#ffa116', 
                  border: '1px solid rgba(255, 161, 22, 0.4)', 
                  borderRadius: '8px', 
                  cursor: 'pointer', 
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 161, 22, 0.25)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 161, 22, 0.15)'; }}
              >
                🔍 All LeetCode
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => window.location.href = '/custom'}
                style={{ width: '100%', padding: '0.75rem', background: 'rgba(210, 153, 34, 0.1)', color: '#d29922', border: '1px solid rgba(210, 153, 34, 0.3)', borderRadius: '8px', cursor: 'pointer', fontSize: '1.25rem', marginBottom: '0.5rem', transition: 'all 0.2s' }}
                title="My Custom Sheet"
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(210, 153, 34, 0.2)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(210, 153, 34, 0.1)'; }}
              >
                📚
              </button>
              <button 
                onClick={() => window.location.href = '/upload'}
                style={{ width: '100%', padding: '0.75rem', background: 'rgba(88, 166, 255, 0.15)', color: '#58a6ff', border: '1px solid rgba(88, 166, 255, 0.4)', borderRadius: '8px', cursor: 'pointer', fontSize: '1.25rem', marginBottom: '0.5rem', transition: 'all 0.2s' }}
                title="Add Company"
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(88, 166, 255, 0.25)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(88, 166, 255, 0.15)'; }}
              >
                +
              </button>
              <button 
                onClick={() => window.location.href = '/leetcode-all'}
                style={{ width: '100%', padding: '0.75rem', background: 'rgba(255, 161, 22, 0.15)', color: '#ffa116', border: '1px solid rgba(255, 161, 22, 0.4)', borderRadius: '8px', cursor: 'pointer', fontSize: '1.25rem', transition: 'all 0.2s' }}
                title="All LeetCode"
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 161, 22, 0.25)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 161, 22, 0.15)'; }}
              >
                🔍
              </button>
            </>
          )}
        </div>
        
        {/* Scrollable company list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
          {companies.map(company => (
            <div
              key={company}
              onClick={() => setSelectedCompany(company)}
              style={{
                padding: sidebarOpen ? '1rem' : '0.75rem',
                marginBottom: '0.5rem',
                background: selectedCompany === company ? 'rgba(88, 166, 255, 0.15)' : '#0a0a0a',
                border: `1px solid ${selectedCompany === company ? 'rgba(88, 166, 255, 0.4)' : '#333333'}`,
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                color: selectedCompany === company ? '#58a6ff' : '#ffffff',
                fontWeight: selectedCompany === company ? '600' : '500',
                fontSize: '0.95rem',
                textAlign: sidebarOpen ? 'left' : 'center',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis'
              }}
              onMouseEnter={(e) => {
                if (selectedCompany !== company) {
                  e.currentTarget.style.background = 'rgba(88, 166, 255, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(88, 166, 255, 0.2)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedCompany !== company) {
                  e.currentTarget.style.background = '#0a0a0a';
                  e.currentTarget.style.borderColor = '#333333';
                }
              }}
            >
              {sidebarOpen ? company : company.charAt(0).toUpperCase()}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginLeft: sidebarOpen ? '280px' : '60px', transition: 'margin-left 0.3s' }}>
        <nav style={{ background: '#1a1a1a', padding: '1.25rem 2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #222222', backdropFilter: 'blur(10px)' }}>
          <h1 style={{ color: '#ffffff', fontSize: '1.5rem', fontWeight: '600', margin: 0 }}>🎯 {selectedCompany} Problems</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {user?.role === 'admin' && (
              <button onClick={() => window.location.href = '/admin'} style={{ padding: '0.5rem 1rem', background: 'rgba(210, 153, 34, 0.15)', color: '#d29922', border: '1px solid rgba(210, 153, 34, 0.4)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.875rem', transition: 'all 0.2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(210, 153, 34, 0.25)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(210, 153, 34, 0.15)'; }}>
                🔐 Admin
              </button>
            )}
            <span style={{ color: '#999999', fontSize: '0.875rem' }}>👤 {user?.username}</span>
            <button onClick={logout} style={{ padding: '0.5rem 1rem', background: 'rgba(218, 54, 51, 0.15)', color: '#f85149', border: '1px solid rgba(248, 81, 73, 0.4)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.875rem', transition: 'all 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(218, 54, 51, 0.25)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(218, 54, 51, 0.15)'; }}>
              Logout
            </button>
          </div>
        </nav>
      
        <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ background: '#1a1a1a', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.3)', marginBottom: '1.5rem', border: '1px solid #222222', backdropFilter: 'blur(10px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem' }}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', flex: 1 }}>
              <input
                type="text"
                placeholder="🔍 Search by title or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ flex: 1, minWidth: '280px', padding: '0.875rem 1rem', border: '1px solid #333333', borderRadius: '10px', background: '#0a0a0a', color: '#ffffff', fontSize: '0.95rem', transition: 'all 0.2s' }}
                onFocus={(e) => { e.target.style.borderColor = '#58a6ff'; e.target.style.background = '#0a0a0a'; }}
                onBlur={(e) => { e.target.style.borderColor = '#333333'; e.target.style.background = '#0a0a0a'; }}
              />
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                style={{ padding: '0.875rem 1rem', border: '1px solid #333333', borderRadius: '10px', cursor: 'pointer', background: '#0a0a0a', color: '#ffffff', fontSize: '0.95rem', minWidth: '120px' }}
              >
                <option>All</option>
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
              <div style={{ position: 'relative', width: '110px', height: '110px' }}>
                <svg width="110" height="110" style={{ transform: 'rotate(-90deg)', filter: 'drop-shadow(0 2px 8px rgba(35, 134, 54, 0.3))' }}>
                  <circle cx="55" cy="55" r="45" fill="none" stroke="rgba(48, 54, 61, 0.5)" strokeWidth="10" />
                  <circle 
                    cx="55" 
                    cy="55" 
                    r="45" 
                    fill="none" 
                    stroke="url(#gradient)" 
                    strokeWidth="10"
                    strokeDasharray={`${(Object.values(completed).filter(Boolean).length / problems.length) * 282.6} 282.6`}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#238636" />
                      <stop offset="100%" stopColor="#2ea043" />
                    </linearGradient>
                  </defs>
                </svg>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#ffffff' }}>
                    {Object.values(completed).filter(Boolean).length}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#999999', fontWeight: '500' }}>of {problems.length}</div>
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', color: '#999999', marginBottom: '0.5rem', fontWeight: '500' }}>Overall Progress</div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#2ea043', marginBottom: '0.25rem' }}>
                  {problems.length > 0 ? Math.round((Object.values(completed).filter(Boolean).length / problems.length) * 100) : 0}%
                </div>
                <div style={{ fontSize: '0.875rem', color: '#999999' }}>
                  {filteredProblems.length} problems shown
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ background: '#1a1a1a', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.3)', border: '1px solid #222222', overflow: 'hidden', backdropFilter: 'blur(10px)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '60px 80px 1fr 140px 70px 50px 50px', padding: '1.25rem 1.5rem', borderBottom: '1px solid #222222', background: '#0a0a0a', fontWeight: '600', color: '#999999', fontSize: '0.875rem', letterSpacing: '0.5px' }}>
            <div style={{ textAlign: 'center' }}>✓</div>
            <div>S.No</div>
            <div>Problem</div>
            <div>Difficulty</div>
            <div style={{ textAlign: 'center' }}>Link</div>
            <div style={{ textAlign: 'center' }}>★</div>
            <div style={{ textAlign: 'center' }}>📝</div>
          </div>
          {filteredProblems.map((problem, index) => (
            <div key={problem.id} style={{ display: 'grid', gridTemplateColumns: '60px 80px 1fr 140px 70px 50px 50px', padding: '1.25rem 1.5rem', borderBottom: '1px solid #222222', alignItems: 'center', transition: 'all 0.2s', position: 'relative' }} 
              onMouseEnter={(e) => { if (showBookmarkDropdown !== problem.id) { e.currentTarget.style.background = 'rgba(88, 166, 255, 0.05)'; e.currentTarget.style.transform = 'translateX(4px)'; } }} 
              onMouseLeave={(e) => { if (showBookmarkDropdown !== problem.id) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'translateX(0)'; } }}>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <label style={{ position: 'relative', cursor: 'pointer', width: '26px', height: '26px' }}>
                  <input
                    type="checkbox"
                    checked={completed[problem.id] || false}
                    onChange={() => toggleProblem(problem.id)}
                    style={{ position: 'absolute', opacity: 0, cursor: 'pointer' }}
                  />
                  <span style={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    height: '26px', 
                    width: '26px', 
                    background: completed[problem.id] ? 'linear-gradient(135deg, #238636 0%, #2ea043 100%)' : 'rgba(13, 17, 23, 0.6)', 
                    border: `2px solid ${completed[problem.id] ? '#2ea043' : '#30363d'}`,
                    borderRadius: '6px',
                    transition: 'all 0.3s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: completed[problem.id] ? '0 2px 8px rgba(35, 134, 54, 0.4)' : 'none'
                  }}>
                    {completed[problem.id] && <span style={{ color: 'white', fontSize: '18px', fontWeight: 'bold' }}>✓</span>}
                  </span>
                </label>
              </div>
              <div style={{ color: '#999999', fontSize: '0.95rem', fontWeight: '500' }}>{index + 1}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.875rem', color: '#666666', minWidth: '50px', fontWeight: '600' }}>#{problem.id}</span>
                <h3 style={{ margin: 0, textDecoration: completed[problem.id] ? 'line-through' : 'none', color: completed[problem.id] ? '#666666' : '#ffffff', fontSize: '1rem', fontWeight: '500' }}>{problem.title}</h3>
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
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <a
                  href={problem.leetcodeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', opacity: 0.6, transition: 'all 0.2s', padding: '0.5rem', borderRadius: '8px' }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.background = 'rgba(255, 161, 22, 0.1)'; e.currentTarget.style.transform = 'scale(1.1)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.6'; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  <img src="/leetcode-icon.webp" alt="LeetCode" style={{ width: '26px', height: '26px' }} />
                </a>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
                <button
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    e.preventDefault();
                    setShowBookmarkDropdown(showBookmarkDropdown === problem.id ? null : problem.id); 
                  }}
                  onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: '#ffa116', opacity: 0.6, transition: 'all 0.2s', padding: '0.5rem', zIndex: 10 }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1.2)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.6'; e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  ★
                </button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button
                  onClick={(e) => { e.stopPropagation(); window.location.href = `/problem/${selectedCompany}/${problem.id}`; }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: '#58a6ff', opacity: 0.6, transition: 'all 0.2s', padding: '0.25rem' }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1.2)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.6'; e.currentTarget.style.transform = 'scale(1)'; }}
                  title="Notes & Code"
                >
                  📝
                </button>
              </div>
            </div>
          ))}
        </div>
          </div>
        </div>
      </div>

      {/* Bookmark Modal - Outside main div so it doesn't get blurred */}
      {showBookmarkDropdown && (
        <>
          {/* Backdrop - Semi transparent, no blur */}
          <div 
            onClick={() => setShowBookmarkDropdown(null)}
            style={{ 
              position: 'fixed', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0, 
              background: 'rgba(0, 0, 0, 0.4)', 
              zIndex: 9999,
              pointerEvents: 'auto'
            }} 
          />
          
          {/* Modal Content - Top right position */}
          <div 
            onClick={(e) => { e.stopPropagation(); }}
            onMouseDown={(e) => { e.stopPropagation(); }}
            style={{ 
              position: 'fixed',
              top: '80px',
              right: '20px',
              background: '#1a1a1a', 
              border: '1px solid #333333', 
              borderRadius: '12px', 
              padding: '1.5rem', 
              width: '380px',
              maxHeight: 'calc(100vh - 120px)',
              zIndex: 10000, 
              boxShadow: '0 12px 48px rgba(0,0,0,0.8)', 
              pointerEvents: 'auto',
              overflowY: 'auto'
            }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid #333333' }}>
              <div>
                <h3 style={{ margin: 0, color: '#ffffff', fontSize: '1.1rem', fontWeight: '600' }}>📌 Add to Bookmark</h3>
                <p style={{ margin: '0.5rem 0 0 0', color: '#999999', fontSize: '0.8rem' }}>Problem #{showBookmarkDropdown}</p>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); e.preventDefault(); setShowBookmarkDropdown(null); }}
                onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); }}
                style={{ background: 'none', border: 'none', color: '#999999', cursor: 'pointer', fontSize: '1.5rem', padding: '0 0.25rem', lineHeight: 1, transition: 'color 0.2s', flexShrink: 0, marginLeft: '1rem' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#ffffff'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#999999'; }}
                title="Close (Esc)"
              >
                ✕
              </button>
            </div>
            <div style={{ marginBottom: '1.25rem' }}>
              {showCreateBookmark ? (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="Bookmark name"
                    value={newBookmarkName}
                    onChange={(e) => { e.stopPropagation(); setNewBookmarkName(e.target.value); }}
                    onKeyDown={(e) => { 
                      e.stopPropagation(); 
                      if (e.key === 'Enter') { 
                        e.preventDefault(); 
                        createBookmark(); 
                      } 
                    }}
                    onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}
                    onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); }}
                    style={{ flex: 1, padding: '0.75rem', background: '#0a0a0a', border: '1px solid #333333', borderRadius: '6px', color: '#ffffff', fontSize: '0.875rem' }}
                    autoFocus
                  />
                  <button onClick={(e) => { e.stopPropagation(); e.preventDefault(); createBookmark(); }} onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); }} style={{ padding: '0.75rem 1rem', background: 'rgba(35, 134, 54, 0.2)', color: '#3fb950', border: '1px solid rgba(35, 134, 54, 0.4)', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>✓</button>
                  <button onClick={(e) => { e.stopPropagation(); e.preventDefault(); setShowCreateBookmark(false); setNewBookmarkName(''); }} onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); }} style={{ padding: '0.75rem 1rem', background: 'rgba(248, 81, 73, 0.15)', color: '#f85149', border: '1px solid rgba(248, 81, 73, 0.4)', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>✕</button>
                </div>
              ) : (
                <button onClick={(e) => { e.stopPropagation(); e.preventDefault(); setShowCreateBookmark(true); }} onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); }} style={{ width: '100%', padding: '0.875rem', background: 'rgba(88, 166, 255, 0.15)', color: '#58a6ff', border: '1px solid rgba(88, 166, 255, 0.4)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '600', transition: 'all 0.2s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(88, 166, 255, 0.25)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(88, 166, 255, 0.15)'; }}>
                  + New Bookmark
                </button>
              )}
            </div>
            <div style={{ maxHeight: 'none', overflowY: 'visible' }}>
              {bookmarks.length === 0 ? (
                <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#999999', fontSize: '0.875rem' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📑</div>
                  <div>No bookmarks yet</div>
                  <div style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: '#666666' }}>Create one to get started</div>
                </div>
              ) : (
                bookmarks.map(bookmark => (
                  <div 
                    key={bookmark.id} 
                    style={{ padding: '0.875rem', cursor: 'pointer', borderRadius: '6px', transition: 'all 0.2s', color: '#ffffff', fontSize: '0.875rem', marginBottom: '0.5rem', border: '1px solid transparent', background: 'transparent' }}
                    onClick={(e) => { e.stopPropagation(); e.preventDefault(); addToBookmark(bookmark.id, showBookmarkDropdown); }}
                    onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(88, 166, 255, 0.15)'; e.currentTarget.style.borderColor = 'rgba(88, 166, 255, 0.4)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}>
                    <span style={{ marginRight: '0.75rem', fontSize: '1rem' }}>{isInBookmark(showBookmarkDropdown, bookmark.id) ? '✓' : '○'}</span>
                    {bookmark.name}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
