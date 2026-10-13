import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import { CourseAccessCode } from '../types';

export const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'codes' | 'videos'>('codes');

  // Codes state
  const [codes, setCodes] = useState<CourseAccessCode[]>([]);
  const [customCode, setCustomCode] = useState('');
  const [codeCount, setCodeCount] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [codeMessage, setCodeMessage] = useState<string | null>(null);

  // Video mapping CSV state
  const [csvInput, setCsvInput] = useState('');
  const [csvMessage, setCsvMessage] = useState<string | null>(null);
  const [csvErrors, setCsvErrors] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/');
      return;
    }
    if (user && user.role === 'admin') {
      loadCodes();
    }
  }, [user]);

  const loadCodes = async () => {
    try {
      const data = await api.listCodes();
      setCodes(data.codes || []);
    } catch {
      // Ignore
    }
  };

  const handleGenerateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    setCodeMessage(null);
    try {
      const res = await api.generateCode('home-spoken-english', customCode || undefined, codeCount);
      setCodeMessage(`Generated code(s): ${res.codes.map(c => c.code).join(', ')}`);
      setCustomCode('');
      loadCodes();
    } catch (err: unknown) {
      setCodeMessage(`Error: ${(err as Error).message}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleRevokeCode = async (codeId: string) => {
    try {
      await api.revokeCode(codeId);
      loadCodes();
    } catch (err: unknown) {
      alert(`Failed to revoke code: ${(err as Error).message}`);
    }
  };

  const handleCsvImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvInput.trim()) return;

    setUploading(true);
    setCsvMessage(null);
    setCsvErrors([]);

    try {
      const res = await api.importVideoMappings(csvInput);
      setCsvMessage(res.message);
      if (res.errors && res.errors.length > 0) {
        setCsvErrors(res.errors);
      }
      setCsvInput('');
    } catch (err: unknown) {
      setCsvMessage(`CSV Import Error: ${(err as Error).message}`);
    } finally {
      setUploading(false);
    }
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <main className="shell">
      <Navbar />

      <h1 className="page-title">Admin Management Portal</h1>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <button
          type="button"
          className="nav-btn"
          style={{
            background: activeTab === 'codes' ? '#103665' : '#e0e0e0',
            color: activeTab === 'codes' ? '#fff' : '#333',
            padding: '12px 24px',
            fontSize: '16px'
          }}
          onClick={() => setActiveTab('codes')}
        >
          Course Access Codes
        </button>

        <button
          type="button"
          className="nav-btn"
          style={{
            background: activeTab === 'videos' ? '#103665' : '#e0e0e0',
            color: activeTab === 'videos' ? '#fff' : '#333',
            padding: '12px 24px',
            fontSize: '16px'
          }}
          onClick={() => setActiveTab('videos')}
        >
          Video Filename Mapping
        </button>
      </div>

      {activeTab === 'codes' ? (
        <section className="panel">
          <h2>Course Access Code Generator</h2>
          <p>Generate secure, single-use course password access codes for students.</p>

          {codeMessage && (
            <div style={{ padding: '12px', background: '#dcfce7', border: '1px solid #22c55e', color: '#15803d', borderRadius: '10px', marginBottom: '16px' }}>
              {codeMessage}
            </div>
          )}

          <form onSubmit={handleGenerateCode} style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '28px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Custom Code (e.g. HSC-STUDENT-01)"
              style={{ flex: '1', minWidth: '220px' }}
              value={customCode}
              onChange={e => setCustomCode(e.target.value)}
            />

            <input
              type="number"
              className="form-input"
              min="1"
              max="50"
              style={{ width: '100px' }}
              value={codeCount}
              onChange={e => setCodeCount(Number(e.target.value))}
            />

            <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '12px 24px' }} disabled={generating}>
              {generating ? 'Generating...' : 'Generate Code(s)'}
            </button>
          </form>

          <h3>Active and Generated Access Codes</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '12px', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: '#f0f4f8', borderBottom: '2px solid #ccc', textAlign: 'left' }}>
                  <th style={{ padding: '10px' }}>Code ID</th>
                  <th style={{ padding: '10px' }}>Status</th>
                  <th style={{ padding: '10px' }}>Claimed By</th>
                  <th style={{ padding: '10px' }}>Created At</th>
                  <th style={{ padding: '10px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {codes.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '16px', textAlign: 'center', color: '#666' }}>
                      No course access codes found.
                    </td>
                  </tr>
                ) : (
                  codes.map(c => (
                    <tr key={c.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '10px', fontFamily: 'monospace' }}>{c.id.slice(0, 8)}...</td>
                      <td style={{ padding: '10px' }}>
                        <span
                          style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontWeight: 'bold',
                            fontSize: '12px',
                            background: c.status === 'active' ? '#dcfce7' : c.status === 'claimed' ? '#dbeafe' : '#fee2e2',
                            color: c.status === 'active' ? '#15803d' : c.status === 'claimed' ? '#1e40af' : '#b91c1c'
                          }}
                        >
                          {c.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '10px' }}>
                        {c.profiles ? `${c.profiles.full_name} (${c.profiles.phone_number})` : '-'}
                      </td>
                      <td style={{ padding: '10px' }}>{new Date(c.created_at).toLocaleDateString()}</td>
                      <td style={{ padding: '10px' }}>
                        {c.status === 'active' && (
                          <button
                            type="button"
                            onClick={() => handleRevokeCode(c.id)}
                            style={{ background: '#ef4444', color: '#fff', border: 0, padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                          >
                            Revoke
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <section className="panel">
          <h2>Video Filename CSV Mapping Import</h2>
          <p>
            Provide your actual MP4 video filenames to map them to course lesson buttons.
          </p>

          {csvMessage && (
            <div style={{ padding: '12px', background: '#dcfce7', border: '1px solid #22c55e', color: '#15803d', borderRadius: '10px', marginBottom: '16px' }}>
              {csvMessage}
            </div>
          )}

          {csvErrors.length > 0 && (
            <div className="error-message" style={{ marginBottom: '16px' }}>
              <strong>CSV Import Warnings / Errors:</strong>
              <ul style={{ margin: '6px 0 0 20px', padding: 0 }}>
                {csvErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          <form onSubmit={handleCsvImport}>
            <div className="form-group">
              <label className="form-label">Paste CSV Content (Format: lesson_id, video_filename, status)</label>
              <textarea
                rows={8}
                className="form-input"
                style={{ fontFamily: 'monospace', fontSize: '13px' }}
                placeholder={`lesson_id,video_filename,status\nrelative-mother,mother_lesson_v1.mp4,available\nrelative-father,father_lesson_v1.mp4,available`}
                value={csvInput}
                onChange={e => setCsvInput(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '12px 28px' }} disabled={uploading}>
              {uploading ? 'Processing CSV...' : 'Import Video Filename Mappings'}
            </button>
          </form>
        </section>
      )}
    </main>
  );
};
