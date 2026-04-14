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
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1a1f2e 0%, #0d1117 100%)' }}>
        <div style={{ background: 'rgba(22, 27, 34, 0.95)', padding: '2.5rem', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', width: '100%', maxWidth: '420px', border: '1px solid rgba(48, 54, 61, 0.5)', backdropFilter: 'blur(10px)' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎯</div>
            <h1 style={{ margin: 0, fontSize: '1.75rem', color: '#c9d1d9', fontWeight: '600' }}>{isLogin ? 'Welcome Back' : 'Get Started'}</h1>
            <p style={{ margin: '0.5rem 0 0 0', color: '#8b949e', fontSize: '0.875rem' }}>Track your LeetCode journey</p>
          </div>
          <form onSubmit={handleAuth}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ width: '100%', padding: '0.875rem', marginBottom: '1rem', border: '1px solid #30363d', borderRadius: '8px', background: '#0d1117', color: '#c9d1d9', fontSize: '1rem', transition: 'border-color 0.2s' }}
              onFocus={(e) => e.target.style.borderColor = '#58a6ff'}
              onBlur={(e) => e.target.style.borderColor = '#30363d'}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '0.875rem', marginBottom: '1.5rem', border: '1px solid #30363d', borderRadius: '8px', background: '#0d1117', color: '#c9d1d9', fontSize: '1rem', transition: 'border-color 0.2s' }}
              onFocus={(e) => e.target.style.borderColor = '#58a6ff'}
              onBlur={(e) => e.target.style.borderColor = '#30363d'}
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a1f2e 0%, #0d1117 100%)', display: 'flex' }}>
      {/* Sidebar */}
      <div style={{ 
        width: sidebarOpen ? '280px' : '60px', 
        background: 'rgba(22, 27, 34, 0.95)', 
        borderRight: '1px solid rgba(48, 54, 61, 0.5)', 
        transition: 'width 0.3s',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(48, 54, 61, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {sidebarOpen && <h2 style={{ color: '#c9d1d9', fontSize: '1.25rem', margin: 0, fontWeight: '600' }}>Companies</h2>}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ background: 'none', border: 'none', color: '#8b949e', cursor: 'pointer', fontSize: '1.25rem', padding: '0.25rem' }}
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
          {companies.map(company => (
            <div
              key={company}
              onClick={() => setSelectedCompany(company)}
              style={{
                padding: sidebarOpen ? '1rem' : '0.75rem',
                marginBottom: '0.5rem',
                background: selectedCompany === company ? 'rgba(88, 166, 255, 0.15)' : 'rgba(13, 17, 23, 0.6)',
                border: `1px solid ${selectedCompany === company ? 'rgba(88, 166, 255, 0.4)' : 'rgba(48, 54, 61, 0.5)'}`,
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                color: selectedCompany === company ? '#58a6ff' : '#c9d1d9',
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
                  e.currentTarget.style.background = 'rgba(13, 17, 23, 0.6)';
                  e.currentTarget.style.borderColor = 'rgba(48, 54, 61, 0.5)';
                }
              }}
            >
              {sidebarOpen ? company : company.charAt(0).toUpperCase()}
            </div>
          ))}
        </div>

        {sidebarOpen && (
          <div style={{ padding: '1rem', borderTop: '1px solid rgba(48, 54, 61, 0.5)' }}>
            <button 
              onClick={() => window.location.href = '/custom'}
              style={{ 
                width: '100%', 
                padding: '0.75rem', 
                background: 'rgba(210, 153, 34, 0.1)', 
                color: '#d29922', 
                border: '1px solid rgba(210, 153, 34, 0.3)', 
                borderRadius: '8px', 
                cursor: 'pointer', 
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '0.5rem',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(210, 153, 34, 0.2)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(210, 153, 34, 0.1)'; }}
            >
              📚 My Custom Sheet
            </button>
            <button 
              onClick={() => window.location.href = '/upload'}
              style={{ 
                width: '100%', 
                padding: '0.75rem', 
                background: 'rgba(88, 166, 255, 0.1)', 
                color: '#58a6ff', 
                border: '1px solid rgba(88, 166, 255, 0.3)', 
                borderRadius: '8px', 
                cursor: 'pointer', 
                fontSize: '0.875rem',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(88, 166, 255, 0.2)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(88, 166, 255, 0.1)'; }}
            >
              + Add Company
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <nav style={{ background: 'rgba(22, 27, 34, 0.95)', padding: '1.25rem 2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(48, 54, 61, 0.5)', backdropFilter: 'blur(10px)' }}>
          <h1 style={{ color: '#c9d1d9', fontSize: '1.5rem', fontWeight: '600', margin: 0 }}>🎯 {selectedCompany} Problems</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {user?.role === 'admin' && (
              <button onClick={() => window.location.href = '/admin'} style={{ padding: '0.5rem 1rem', background: 'rgba(210, 153, 34, 0.1)', color: '#d29922', border: '1px solid rgba(210, 153, 34, 0.3)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.875rem', transition: 'all 0.2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(210, 153, 34, 0.2)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(210, 153, 34, 0.1)'; }}>
                🔐 Admin
              </button>
            )}
            <span style={{ color: '#8b949e', fontSize: '0.875rem' }}>👤 {user?.username}</span>
            <button onClick={logout} style={{ padding: '0.5rem 1rem', background: 'rgba(218, 54, 51, 0.1)', color: '#f85149', border: '1px solid rgba(248, 81, 73, 0.3)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.875rem', transition: 'all 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(218, 54, 51, 0.2)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(218, 54, 51, 0.1)'; }}>
              Logout
            </button>
          </div>
        </nav>
      
        <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ background: 'rgba(22, 27, 34, 0.6)', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.3)', marginBottom: '1.5rem', border: '1px solid rgba(48, 54, 61, 0.5)', backdropFilter: 'blur(10px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem' }}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', flex: 1 }}>
              <input
                type="text"
                placeholder="🔍 Search by title or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ flex: 1, minWidth: '280px', padding: '0.875rem 1rem', border: '1px solid #30363d', borderRadius: '10px', background: 'rgba(13, 17, 23, 0.6)', color: '#c9d1d9', fontSize: '0.95rem', transition: 'all 0.2s' }}
                onFocus={(e) => { e.target.style.borderColor = '#58a6ff'; e.target.style.background = '#0d1117'; }}
                onBlur={(e) => { e.target.style.borderColor = '#30363d'; e.target.style.background = 'rgba(13, 17, 23, 0.6)'; }}
              />
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                style={{ padding: '0.875rem 1rem', border: '1px solid #30363d', borderRadius: '10px', cursor: 'pointer', background: 'rgba(13, 17, 23, 0.6)', color: '#c9d1d9', fontSize: '0.95rem', minWidth: '120px' }}
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
                  <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#c9d1d9' }}>
                    {Object.values(completed).filter(Boolean).length}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#8b949e', fontWeight: '500' }}>of {problems.length}</div>
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', color: '#8b949e', marginBottom: '0.5rem', fontWeight: '500' }}>Overall Progress</div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#2ea043', marginBottom: '0.25rem' }}>
                  {problems.length > 0 ? Math.round((Object.values(completed).filter(Boolean).length / problems.length) * 100) : 0}%
                </div>
                <div style={{ fontSize: '0.875rem', color: '#8b949e' }}>
                  {filteredProblems.length} problems shown
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ background: 'rgba(22, 27, 34, 0.6)', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.3)', border: '1px solid rgba(48, 54, 61, 0.5)', overflow: 'hidden', backdropFilter: 'blur(10px)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '60px 80px 1fr 140px 70px 50px 50px', padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(48, 54, 61, 0.5)', background: 'rgba(13, 17, 23, 0.6)', fontWeight: '600', color: '#8b949e', fontSize: '0.875rem', letterSpacing: '0.5px' }}>
            <div style={{ textAlign: 'center' }}>✓</div>
            <div>S.No</div>
            <div>Problem</div>
            <div>Difficulty</div>
            <div style={{ textAlign: 'center' }}>Link</div>
            <div style={{ textAlign: 'center' }}>★</div>
            <div style={{ textAlign: 'center' }}>📝</div>
          </div>
          {filteredProblems.map((problem, index) => (
            <div key={problem.id} style={{ display: 'grid', gridTemplateColumns: '60px 80px 1fr 140px 70px 50px 50px', padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(48, 54, 61, 0.3)', alignItems: 'center', transition: 'all 0.2s', position: 'relative' }} 
              onMouseEnter={(e) => { if (showBookmarkDropdown !== problem.id) { e.currentTarget.style.background = 'rgba(13, 17, 23, 0.4)'; e.currentTarget.style.transform = 'translateX(4px)'; } }} 
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
              <div style={{ color: '#8b949e', fontSize: '0.95rem', fontWeight: '500' }}>{index + 1}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.875rem', color: '#6e7681', minWidth: '50px', fontWeight: '600' }}>#{problem.id}</span>
                <h3 style={{ margin: 0, textDecoration: completed[problem.id] ? 'line-through' : 'none', color: completed[problem.id] ? '#6e7681' : '#c9d1d9', fontSize: '1rem', fontWeight: '500' }}>{problem.title}</h3>
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
                  onClick={(e) => { e.stopPropagation(); setShowBookmarkDropdown(showBookmarkDropdown === problem.id ? null : problem.id); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: '#ffa116', opacity: 0.6, transition: 'all 0.2s', padding: '0.25rem', zIndex: 10 }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1.2)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.6'; e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  ★
                </button>
                {showBookmarkDropdown === problem.id && (
                  <div 
                    onClick={(e) => e.stopPropagation()}
                    onMouseEnter={(e) => e.stopPropagation()}
                    onMouseLeave={(e) => e.stopPropagation()}
                    style={{ position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem', background: 'rgba(22, 27, 34, 0.98)', border: '1px solid #30363d', borderRadius: '8px', padding: '0.5rem', minWidth: '200px', zIndex: 9999, boxShadow: '0 4px 16px rgba(0,0,0,0.4)', pointerEvents: 'auto' }}>
                    <div style={{ padding: '0.5rem', borderBottom: '1px solid #30363d', marginBottom: '0.5rem' }}>
                      {showCreateBookmark ? (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <input
                            type="text"
                            placeholder="Bookmark name"
                            value={newBookmarkName}
                            onChange={(e) => setNewBookmarkName(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && createBookmark()}
                            style={{ flex: 1, padding: '0.5rem', background: '#0d1117', border: '1px solid #30363d', borderRadius: '4px', color: '#c9d1d9', fontSize: '0.875rem' }}
                            autoFocus
                          />
                          <button onClick={createBookmark} style={{ padding: '0.5rem', background: 'rgba(35, 134, 54, 0.2)', color: '#3fb950', border: '1px solid rgba(35, 134, 54, 0.3)', borderRadius: '4px', cursor: 'pointer' }}>✓</button>
                          <button onClick={() => { setShowCreateBookmark(false); setNewBookmarkName(''); }} style={{ padding: '0.5rem', background: 'rgba(248, 81, 73, 0.1)', color: '#f85149', border: '1px solid rgba(248, 81, 73, 0.3)', borderRadius: '4px', cursor: 'pointer' }}>✕</button>
                        </div>
                      ) : (
                        <button onClick={() => setShowCreateBookmark(true)} style={{ width: '100%', padding: '0.5rem', background: 'rgba(88, 166, 255, 0.1)', color: '#58a6ff', border: '1px solid rgba(88, 166, 255, 0.3)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.875rem' }}>
                          + New Bookmark
                        </button>
                      )}
                    </div>
                    {bookmarks.length === 0 ? (
                      <div style={{ padding: '1rem', textAlign: 'center', color: '#8b949e', fontSize: '0.875rem' }}>No bookmarks yet</div>
                    ) : (
                      bookmarks.map(bookmark => (
                        <div key={bookmark.id} style={{ padding: '0.5rem', cursor: 'pointer', borderRadius: '4px', transition: 'background 0.2s', color: '#c9d1d9', fontSize: '0.875rem' }}
                          onClick={(e) => { e.stopPropagation(); addToBookmark(bookmark.id, problem.id); }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(88, 166, 255, 0.1)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                          {isInBookmark(problem.id, bookmark.id) ? '✓ ' : ''}{bookmark.name}
                        </div>
                      ))
                    )}
                  </div>
                )}
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
    </div>
  );
}
