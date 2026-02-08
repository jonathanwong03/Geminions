import React, { useState, useEffect } from 'react';
import { Download, CheckCircle, FileImage, FileVideo, Clock, Trash2 } from 'lucide-react';
import Header from '../components/Header';

const Exports = () => {
  const [exports, setExports] = useState([]);
  const [loading, setLoading] = useState(true);
  const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

  useEffect(() => {
    fetchExports();
  }, []);

  const fetchExports = async () => {
    try {
        const res = await fetch(`${serverUrl}/api/exports`, { credentials: 'include' });
        if (res.ok) {
            const data = await res.json();
            setExports(data);
        }
    } catch (e) {
        console.error("Failed to fetch exports");
    } finally {
        setLoading(false);
    }
  };

  const handleDownload = async (url, filename) => {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename || 'download';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        // clean up
        window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
        console.error("Download failed", error);
        alert("Failed to download file");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this export?")) return;
    try {
        const res = await fetch(`${serverUrl}/api/exports/${id}`, { 
            method: 'DELETE',
            credentials: 'include' 
        });
        if (res.ok) {
            setExports(exports.filter(e => e.id !== id));
        } else {
            alert("Failed to delete export");
        }
    } catch (e) {
        console.error("Delete failed", e);
        alert("Error connecting to server");
    }
  };

  return (
    <div style={{ padding: '20px' }}>
       <Header 
         title="Export Center"
         subtitle="Download your context-aware adapted assets"
       />

       {loading ? (
           <p>Loading...</p>
       ) : (
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
                    <thead>
                        <tr style={{ background: '#f8f9fa', textAlign: 'left' }}>
                            <th style={{ padding: '15px 20px', color: '#666' }}>Asset Name</th>
                            <th style={{ padding: '15px 20px', color: '#666' }}>Format</th>
                            <th style={{ padding: '15px 20px', color: '#666' }}>Project Source</th>
                            <th style={{ padding: '15px 20px', color: '#666' }}>Status</th>
                            <th style={{ padding: '15px 20px', color: '#666' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {exports.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#888' }}>
                                    No exported assets yet. Go to Templates to generate some!
                                </td>
                            </tr>
                        ) : (
                            exports.map((file, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '15px 20px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '500' }}>
                                        {file.type === 'image' ? <FileImage size={18} color="#666"/> : <FileVideo size={18} color="#666"/>}
                                        {file.name}
                                    </td>
                                    <td style={{ padding: '15px 20px', color: '#666' }}>{file.format}</td>
                                    <td style={{ padding: '15px 20px' }}>{file.project}</td>
                                    <td style={{ padding: '15px 20px' }}>
                                        <span style={{ background: '#e8f5e9', color: '#2e7d32', padding: '5px 10px', borderRadius: '15px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                                            <CheckCircle size={12} /> {file.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '15px 20px', display: 'flex', gap: '43px' }}>
                                        <button 
                                            className="btn-secondary"  
                                            style={{ padding: '5px 15px', fontSize: '0.9rem' }}
                                            onClick={() => handleDownload(file.url, file.name)}
                                        >
                                            <Download size={14} style={{ marginRight: '5px' }} /> Download
                                        </button>
                                        <button 
                                            style={{ 
                                                padding: '5px 10px', 
                                                fontSize: '0.9rem', 
                                                background: '#fff0f0', 
                                                color: '#d32f2f', 
                                                border: '1px solid #ffcdd2', 
                                                borderRadius: '4px', 
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                            onClick={() => handleDelete(file.id)}
                                            title="Delete"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
       )}
    </div>
  );
};

export default Exports;
