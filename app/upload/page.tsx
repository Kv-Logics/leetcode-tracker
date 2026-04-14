'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function UploadPage() {
  const [token, setToken] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (!savedToken) {
      router.push('/');
    } else {
      setToken(savedToken);
    }
  }, [router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCsvFile(file);
      parseCSV(file);
    }
  };

  const parseCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',');
      
      const problems = lines.slice(1).map(line => {
        const values = line.split(',');
        return {
          id: values[0]?.trim(),
          url: values[1]?.trim(),
          title: values[2]?.trim(),
          difficulty: values[3]?.trim() as 'Easy' | 'Medium' | 'Hard',
          acceptance: values[4]?.trim(),
          frequency: values[5]?.trim()
        };
      }).filter(p => p.id && p.title);
      
      setPreview(problems.slice(0, 5));
    };
    reader.readAsText(file);
  };

  const handleUpload = async () => {
    if (!csvFile || !companyName) return;
    
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      
      const problems = lines.slice(1).map(line => {
        const values = line.split(',');
        return {
          id: values[0]?.trim(),
          leetcodeUrl: values[1]?.trim(),
          title: values[2]?.trim(),
          difficulty: values[3]?.trim(),
          acceptance: values[4]?.trim(),
          frequency: values[5]?.trim()
        };
      }).filter(p => p.id && p.title);
      
      const res = await fetch('/api/companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: companyName, problems })
      });
      
      if (res.ok) {
        router.push('/');
      }
      setUploading(false);
    };
    reader.readAsText(csvFile);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a1f2e 0%, #0d1117 100%)', padding: '2rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <button onClick={() => router.push('/')} style={{ padding: '0.5rem 1rem', background: 'rgba(88, 166, 255, 0.1)', color: '#58a6ff', border: '1px solid rgba(88, 166, 255, 0.3)', borderRadius: '8px', cursor: 'pointer' }}>
            ← Back to Dashboard
          </button>
        </div>

        <div style={{ background: 'rgba(22, 27, 34, 0.95)', padding: '2.5rem', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', border: '1px solid rgba(48, 54, 61, 0.5)' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📤</div>
            <h1 style={{ margin: 0, fontSize: '1.75rem', color: '#c9d1d9', fontWeight: '600' }}>Upload Company CSV</h1>
            <p style={{ margin: '0.5rem 0 0 0', color: '#8b949e', fontSize: '0.875rem' }}>Add a new company's LeetCode problems</p>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#c9d1d9', fontSize: '0.875rem', fontWeight: '500' }}>Company Name</label>
            <input
              type="text"
              placeholder="e.g., Google, Amazon, Microsoft"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              style={{ width: '100%', padding: '0.875rem', border: '1px solid #30363d', borderRadius: '8px', background: '#0d1117', color: '#c9d1d9', fontSize: '1rem' }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#c9d1d9', fontSize: '0.875rem', fontWeight: '500' }}>CSV File</label>
            <div style={{ position: 'relative' }}>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                style={{ width: '100%', padding: '0.875rem', border: '2px dashed #30363d', borderRadius: '8px', background: '#0d1117', color: '#c9d1d9', cursor: 'pointer' }}
              />
            </div>
            <p style={{ margin: '0.5rem 0 0 0', color: '#8b949e', fontSize: '0.75rem' }}>
              CSV format: ID, URL, Title, Difficulty, Acceptance %, Frequency %
            </p>
          </div>

          {preview.length > 0 && (
            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(13, 17, 23, 0.6)', borderRadius: '8px', border: '1px solid #30363d' }}>
              <h3 style={{ margin: '0 0 1rem 0', color: '#c9d1d9', fontSize: '0.875rem' }}>Preview (first 5 problems)</h3>
              {preview.map((p, i) => (
                <div key={i} style={{ padding: '0.5rem 0', borderBottom: i < preview.length - 1 ? '1px solid #30363d' : 'none', color: '#8b949e', fontSize: '0.875rem' }}>
                  #{p.id} - {p.title} ({p.difficulty})
                </div>
              ))}
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!csvFile || !companyName || uploading}
            style={{
              width: '100%',
              padding: '0.875rem',
              background: (!csvFile || !companyName || uploading) ? '#30363d' : 'linear-gradient(135deg, #238636 0%, #2ea043 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: (!csvFile || !companyName || uploading) ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: '600',
              opacity: (!csvFile || !companyName || uploading) ? 0.5 : 1
            }}
          >
            {uploading ? 'Uploading...' : 'Upload & Create Company Sheet'}
          </button>
        </div>
      </div>
    </div>
  );
}
