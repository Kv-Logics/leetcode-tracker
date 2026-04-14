'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const [token, setToken] = useState('');
  const [user, setUser] = useState<any>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [userProgress, setUserProgress] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (!savedToken || !savedUser) {
      router.push('/');
      return;
    }
    const parsedUser = JSON.parse(savedUser);
    if (parsedUser.role !== 'admin') {
      router.push('/');
      return;
    }
    setToken(savedToken);
    setUser(parsedUser);
    fetchData(savedToken);
  }, [router]);

  const fetchData = async (authToken: string) => {
    const [companiesRes, usersRes] = await Promise.all([
      fetch('/api/admin/companies', { headers: { 'Authorization': `Bearer ${authToken}` } }),
      fetch('/api/admin/users', { headers: { 'Authorization': `Bearer ${authToken}` } })
    ]);
    const companiesData = await companiesRes.json();
    const usersData = await usersRes.json();
    setCompanies(companiesData.companies || []);
    setUsers(usersData.users || []);
  };

  const fetchUserProgress = async (userId: string) => {
    const res = await fetch(`/api/admin/progress?userId=${userId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    setUserProgress(data.progress || []);
  };

  const deleteCompany = async (companyId: string) => {
    if (!confirm('Delete this company? All user progress will be lost.')) return;
    await fetch(`/api/admin/companies?id=${companyId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchData(token);
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Delete this user? All their data will be lost.')) return;
    await fetch(`/api/admin/users?id=${userId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchData(token);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a1f2e 0%, #0d1117 100%)', padding: '2rem' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ color: '#c9d1d9', fontSize: '2rem', fontWeight: '600' }}>🔐 Admin Dashboard</h1>
          <button onClick={() => router.push('/')} style={{ padding: '0.5rem 1rem', background: 'rgba(88, 166, 255, 0.1)', color: '#58a6ff', border: '1px solid rgba(88, 166, 255, 0.3)', borderRadius: '8px', cursor: 'pointer' }}>
            ← Back to App
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
          <div style={{ background: 'rgba(22, 27, 34, 0.95)', padding: '2rem', borderRadius: '12px', border: '1px solid rgba(48, 54, 61, 0.5)' }}>
            <h2 style={{ color: '#c9d1d9', fontSize: '1.25rem', marginBottom: '1.5rem' }}>📊 Companies ({companies.length})</h2>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {companies.map(company => (
                <div key={company.id} style={{ padding: '1rem', marginBottom: '0.5rem', background: 'rgba(13, 17, 23, 0.6)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ color: '#c9d1d9', fontWeight: '600' }}>{company.name}</div>
                    <div style={{ color: '#8b949e', fontSize: '0.875rem' }}>{company.problems?.length || 0} problems</div>
                  </div>
                  <button onClick={() => deleteCompany(company.id)} style={{ padding: '0.5rem 1rem', background: 'rgba(248, 81, 73, 0.1)', color: '#f85149', border: '1px solid rgba(248, 81, 73, 0.3)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.875rem' }}>
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: 'rgba(22, 27, 34, 0.95)', padding: '2rem', borderRadius: '12px', border: '1px solid rgba(48, 54, 61, 0.5)' }}>
            <h2 style={{ color: '#c9d1d9', fontSize: '1.25rem', marginBottom: '1.5rem' }}>👥 Users ({users.length})</h2>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {users.map(u => (
                <div key={u.id} style={{ padding: '1rem', marginBottom: '0.5rem', background: 'rgba(13, 17, 23, 0.6)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ color: '#c9d1d9', fontWeight: '600' }}>{u.username}</div>
                    <div style={{ color: '#8b949e', fontSize: '0.875rem' }}>{u.role}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => { setSelectedUser(u.id); fetchUserProgress(u.id); }} style={{ padding: '0.5rem 1rem', background: 'rgba(88, 166, 255, 0.1)', color: '#58a6ff', border: '1px solid rgba(88, 166, 255, 0.3)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.875rem' }}>
                      View Progress
                    </button>
                    {u.role !== 'admin' && (
                      <button onClick={() => deleteUser(u.id)} style={{ padding: '0.5rem 1rem', background: 'rgba(248, 81, 73, 0.1)', color: '#f85149', border: '1px solid rgba(248, 81, 73, 0.3)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.875rem' }}>
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {selectedUser && (
          <div style={{ background: 'rgba(22, 27, 34, 0.95)', padding: '2rem', borderRadius: '12px', border: '1px solid rgba(48, 54, 61, 0.5)' }}>
            <h2 style={{ color: '#c9d1d9', fontSize: '1.25rem', marginBottom: '1.5rem' }}>📈 User Progress</h2>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {userProgress.map((p, i) => (
                <div key={i} style={{ padding: '0.75rem', marginBottom: '0.5rem', background: 'rgba(13, 17, 23, 0.6)', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', color: '#8b949e', fontSize: '0.875rem' }}>
                  <span>{p.company_name} - Problem #{p.problem_id}</span>
                  <span style={{ color: p.completed ? '#3fb950' : '#f85149' }}>{p.completed ? '✓ Completed' : '○ Pending'}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
