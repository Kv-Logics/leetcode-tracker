'use client';
import { useState, useEffect } from 'react';
import { Problem } from '@/lib/problems';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'sheets'>('sheets');
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [user, setUser] = useState<any>(null);
  
  // Dashboard state
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loadingDashboard, setLoadingDashboard] = useState(false);

  // Sheets state
  const [problems, setProblems] = useState<Problem[]>([]);
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [revisionCount, setRevisionCount] = useState<Record<string, number>>({});
  const [isPinned, setIsPinned] = useState<Record<string, boolean>>({});
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
      fetchDashboard(savedToken);
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

  const fetchDashboard = async (authToken: string) => {
    setLoadingDashboard(true);
    try {
      const res = await fetch('/api/dashboard', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const data = await res.json();
      setDashboardData(data);
    } catch (err) {
      console.error('Failed to fetch dashboard:', err);
    } finally {
      setLoadingDashboard(false);
    }
  };

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
      await fetchDashboard(data.token);
    }
  };

  const fetchCompanies = async (authToken: string) => {
    const res = await fetch('/api/companies', {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const data = await res.json();
    const companyNames = data.companies.map((c: any) => c.name);
    setCompanies(companyNames.length > 0 ? companyNames : ['PayPal']);
    if (companyNames.length > 0 && !selectedCompany) {
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
    setRevisionCount(data.revisionCount || {});
    setIsPinned(data.isPinned || {});
  };

  // Toggle problem completed (Optimistic UI)
  const toggleProblem = async (problemId: string) => {
    const newStatus = !completed[problemId];
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
      fetchDashboard(token);
    } catch (error) {
      setCompleted(prev => ({ ...prev, [problemId]: !newStatus }));
    }
  };

  // Increment Revision Count (+1 button)
  const incrementRevision = async (problemId: string) => {
    const currentCount = revisionCount[problemId] || 0;
    const newCount = currentCount + 1;

    setRevisionCount(prev => ({ ...prev, [problemId]: newCount }));

    try {
      await fetch('/api/problems', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ problemId, revisionCount: newCount, company: selectedCompany })
      });
      fetchDashboard(token);
    } catch (error) {
      setRevisionCount(prev => ({ ...prev, [problemId]: currentCount }));
    }
  };

  // Toggle Pin / Unpin
  const togglePin = async (problemId: string) => {
    const currentPin = isPinned[problemId] || false;
    const newPin = !currentPin;

    setIsPinned(prev => ({ ...prev, [problemId]: newPin }));

    try {
      await fetch('/api/problems', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ problemId, isPinned: newPin, company: selectedCompany })
      });
      fetchDashboard(token);
    } catch (error) {
      setIsPinned(prev => ({ ...prev, [problemId]: currentPin }));
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
      
      {/* Sidebar Navigation */}
      <div style={{ width: '68px', background: 'var(--bg-card)', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0', zIndex: 100 }}>
        <div style={{ width: '40px', height: '40px', background: 'var(--primary)', borderRadius: '10px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 'bold', marginBottom: '24px' }}>
          ⚡
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
          <button 
            onClick={() => setActiveTab('dashboard')} 
            style={{ width: '40px', height: '40px', borderRadius: '10px', border: 'none', background: activeTab === 'dashboard' ? 'var(--primary-light)' : 'transparent', color: activeTab === 'dashboard' ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer', fontSize: '18px' }} 
            title="Main Overview Dashboard"
          >
            📊
          </button>
          <button 
            onClick={() => setActiveTab('sheets')} 
            style={{ width: '40px', height: '40px', borderRadius: '10px', border: 'none', background: activeTab === 'sheets' ? 'var(--primary-light)' : 'transparent', color: activeTab === 'sheets' ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer', fontSize: '18px' }} 
            title="Company Problem Sheets"
          >
            🏢
          </button>
          <button onClick={() => window.location.href = '/custom'} style={{ width: '40px', height: '40px', borderRadius: '10px', border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '18px' }} title="My Custom Sheet">📚</button>
          <button onClick={() => window.location.href = '/upload'} style={{ width: '40px', height: '40px', borderRadius: '10px', border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '18px' }} title="Add Company">➕</button>
          <button onClick={() => window.location.href = '/leetcode-all'} style={{ width: '40px', height: '40px', borderRadius: '10px', border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '18px' }} title="All Problems">🔍</button>
        </div>
        <button onClick={logout} style={{ width: '40px', height: '40px', borderRadius: '10px', border: 'none', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', cursor: 'pointer', fontSize: '18px' }} title="Logout">🚪</button>
      </div>

      {/* Main Content Workspace */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px 32px' }}>
        
        {/* Navigation Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 600, display: 'flex', gap: '6px', alignItems: 'center' }}>
              <span>Platform</span> › <span style={{ color: 'var(--text-main)' }}>{activeTab === 'dashboard' ? 'Master Overview Dashboard' : `${selectedCompany} Problems`}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '6px' }}>
              <div style={{ display: 'flex', background: 'var(--bg-card)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    background: activeTab === 'dashboard' ? 'var(--primary)' : 'transparent',
                    color: activeTab === 'dashboard' ? '#000' : 'var(--text-muted)',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  📊 Master Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('sheets')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    background: activeTab === 'sheets' ? 'var(--primary)' : 'transparent',
                    color: activeTab === 'sheets' ? '#000' : 'var(--text-muted)',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  🏢 Company Sheets ({companies.length})
                </button>
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button onClick={toggleTheme} className="theme-toggle-btn">
              {theme === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode'}
            </button>
            <button onClick={() => window.location.href = '/upload'} className="saas-btn-primary">
              + Import Company Sheet
            </button>
          </div>
        </div>

        {/* VIEW 1: MASTER DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Top Metric Cards Overview */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
              
              <div className="saas-card" style={{ padding: '20px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>TOTAL COMPANY SHEETS</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', margin: '8px 0 2px 0' }}>
                  {dashboardData?.summary?.totalCompanies || companies.length}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Active problem sets</div>
              </div>

              <div className="saas-card" style={{ padding: '20px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>TOTAL PROBLEMS</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', margin: '8px 0 2px 0' }}>
                  {dashboardData?.summary?.totalProblemsAll || 0}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Across all sheets</div>
              </div>

              <div className="saas-card" style={{ padding: '20px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>SOLVED PROGRESS</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--easy)', margin: '8px 0 2px 0' }}>
                  {dashboardData?.summary?.totalCompletedAll || 0}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                  {dashboardData?.summary?.overallPercent || 0}% overall completion rate
                </div>
              </div>

              <div className="saas-card" style={{ padding: '20px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>REVISION COUNTER HUB</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', margin: '8px 0 2px 0' }}>
                  {dashboardData?.summary?.totalRevisionsAll || 0}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Total problem revisit sessions</div>
              </div>

            </div>

            {/* All Company Sheets Overview Table */}
            <div className="saas-card" style={{ overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>🏢 All Company Sheets Overview</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>Click any sheet to view and solve questions.</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 2fr 1fr 120px', padding: '12px 24px', background: 'var(--bg-card-hover)', borderBottom: '1px solid var(--border-color)', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                <div>COMPANY NAME</div>
                <div>TOTAL PROBLEMS</div>
                <div>SOLVED</div>
                <div>PROGRESS BAR</div>
                <div>PINNED FOR REVISION</div>
                <div style={{ textAlign: 'center' }}>ACTION</div>
              </div>

              {(dashboardData?.companies || []).map((comp: any) => (
                <div
                  key={comp.id || comp.name}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr 2fr 1fr 120px',
                    padding: '16px 24px',
                    borderBottom: '1px solid var(--border-color)',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>🏢</span> {comp.name}
                  </div>
                  <div style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{comp.totalProblems} Qs</div>
                  <div style={{ fontWeight: 700, color: 'var(--easy)' }}>{comp.completedCount} Solved</div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '4px' }}>
                      <span>Completion</span>
                      <span>{comp.progressPercent}%</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${comp.progressPercent}%`, height: '100%', background: 'var(--primary)', borderRadius: '3px' }}></div>
                    </div>
                  </div>
                  <div>
                    <span style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '3px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700 }}>
                      📌 {comp.pinnedCount} Pinned
                    </span>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <button
                      onClick={() => {
                        setSelectedCompany(comp.name);
                        setActiveTab('sheets');
                      }}
                      className="saas-btn-primary"
                      style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                    >
                      Open Sheet →
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pinned Questions for Revision Section */}
            {(dashboardData?.pinnedItems || []).length > 0 && (
              <div className="saas-card" style={{ padding: '20px 24px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  📌 Pinned Revision Queue ({dashboardData.pinnedItems.length})
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                  {dashboardData.pinnedItems.map((item: any) => (
                    <div key={item.problemId + item.companyName} style={{ background: 'var(--bg-main)', padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Problem #{item.problemId}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{item.companyName} Sheet</div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedCompany(item.companyName);
                          setActiveTab('sheets');
                        }}
                        className="saas-btn-secondary"
                        style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                      >
                        Revise ({item.revisionCount}x) →
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* VIEW 2: INDIVIDUAL COMPANY SHEETS & PROBLEM TRACKER */}
        {activeTab === 'sheets' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Sheet Control Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input
                  type="text"
                  className="saas-input"
                  placeholder="Search problem title or #ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ width: '220px' }}
                />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Switch Sheet:</span>
                <select
                  className="saas-input"
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                  style={{ fontWeight: 700 }}
                >
                  {companies.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
              <div className="saas-card" style={{ padding: '20px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>TOTAL QUESTIONS</span>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', margin: '4px 0' }}>{problems.length}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{selectedCompany} Problem Set</div>
              </div>

              <div className="saas-card" style={{ padding: '20px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>SOLVED</span>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--easy)', margin: '4px 0' }}>{completedCount}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{progressPercent}% Complete</div>
              </div>

              <div className="saas-card" style={{ padding: '20px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>REMAINING</span>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', margin: '4px 0' }}>{problems.length - completedCount}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Target questions to solve</div>
              </div>
            </div>

            {/* Company Sheet Problem Table */}
            <div className="saas-card" style={{ overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>🏢 {selectedCompany} Problem Sheet</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>Track, revise (+1 counter), and pin questions.</p>
                </div>
                <span style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700 }}>
                  {filteredProblems.length} Problems
                </span>
              </div>

              {/* Table Header */}
              <div style={{ display: 'grid', gridTemplateColumns: '60px 80px 1fr 120px 70px 110px 70px 60px 60px', padding: '12px 24px', background: 'var(--bg-card-hover)', borderBottom: '1px solid var(--border-color)', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                <div style={{ textAlign: 'center' }}>DONE</div>
                <div>#ID</div>
                <div>PROBLEM TITLE</div>
                <div>DIFFICULTY</div>
                <div style={{ textAlign: 'center' }}>LEETCODE</div>
                <div style={{ textAlign: 'center' }}>REVISIT (+1)</div>
                <div style={{ textAlign: 'center' }}>PIN</div>
                <div style={{ textAlign: 'center' }}>FAV</div>
                <div style={{ textAlign: 'center' }}>NOTES</div>
              </div>

              {/* Table Rows */}
              {filteredProblems.map((problem) => (
                <div
                  key={problem.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '60px 80px 1fr 120px 70px 110px 70px 60px 60px',
                    padding: '14px 24px',
                    borderBottom: '1px solid var(--border-color)',
                    alignItems: 'center',
                    background: completed[problem.id] ? 'var(--bg-card-hover)' : 'transparent'
                  }}
                >
                  {/* Done Checkbox */}
                  <div style={{ textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={completed[problem.id] || false}
                      onChange={() => toggleProblem(problem.id)}
                      style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                    />
                  </div>

                  {/* ID */}
                  <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem', fontWeight: 600 }}>#{problem.id}</div>

                  {/* Title */}
                  <div style={{ fontWeight: 600, color: completed[problem.id] ? 'var(--text-dim)' : 'var(--text-main)', textDecoration: completed[problem.id] ? 'line-through' : 'none' }}>
                    {problem.title}
                  </div>

                  {/* Difficulty */}
                  <div>
                    <span className={problem.difficulty === 'Easy' ? 'badge-easy' : problem.difficulty === 'Medium' ? 'badge-medium' : 'badge-hard'} style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>
                      {problem.difficulty}
                    </span>
                  </div>

                  {/* LeetCode link */}
                  <div style={{ textAlign: 'center' }}>
                    <a href={problem.leetcodeUrl} target="_blank" rel="noopener noreferrer">
                      <img src="/leetcode-icon.webp" alt="LeetCode" style={{ width: '20px', height: '20px' }} />
                    </a>
                  </div>

                  {/* Revisit Counter +1 Button with badge inside */}
                  <div style={{ textAlign: 'center' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        incrementRevision(problem.id);
                      }}
                      className="saas-btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      title="Click to increment revisit count by 1"
                    >
                      <span>🔄</span>
                      <span style={{ background: 'var(--primary)', color: '#000', padding: '1px 6px', borderRadius: '10px', fontSize: '0.7rem' }}>
                        {revisionCount[problem.id] || 0}
                      </span>
                    </button>
                  </div>

                  {/* Pin / Unpin Button */}
                  <div style={{ textAlign: 'center' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        togglePin(problem.id);
                      }}
                      style={{
                        background: isPinned[problem.id] ? 'var(--primary-light)' : 'transparent',
                        border: `1px solid ${isPinned[problem.id] ? 'var(--primary)' : 'var(--border-color)'}`,
                        borderRadius: '6px',
                        padding: '4px 8px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        color: isPinned[problem.id] ? 'var(--primary)' : 'var(--text-muted)'
                      }}
                      title={isPinned[problem.id] ? 'Unpin question' : 'Pin question for revision'}
                    >
                      {isPinned[problem.id] ? '📌 Pinned' : '📌'}
                    </button>
                  </div>

                  {/* Favorite */}
                  <div style={{ textAlign: 'center' }}>
                    <button onClick={() => setShowBookmarkDropdown(problem.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: '#f59e0b' }}>★</button>
                  </div>

                  {/* Notes */}
                  <div style={{ textAlign: 'center' }}>
                    <button onClick={() => window.location.href = `/problem/${selectedCompany}/${problem.id}`} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: 'var(--primary)' }}>📝</button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
