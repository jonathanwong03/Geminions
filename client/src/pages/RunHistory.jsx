import React, { useState, useEffect } from 'react';
import { AlertCircle, Check, X, RefreshCw } from 'lucide-react';
import Header from '../components/Header';

const RunHistory = () => {
  const [history, setHistory] = useState([]);
  const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

  useEffect(() => {
    fetchHistory();
    // Poll every 5 seconds for updates
    const interval = setInterval(fetchHistory, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchHistory = async () => {
    try {
        const res = await fetch(`${serverUrl}/api/history`, { credentials: 'include' });
        if (res.ok) {
            const data = await res.json();
            setHistory(data);
        }
    } catch (e) {
        console.error("Failed to fetch history");
    }
  };

  return (
    <div style={{ padding: '20px' }}>
       <Header 
         title="Run History"
         subtitle="All logs are generated here"
       />

        <h2 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Generation Log</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
             {history.length === 0 ? (
                 <p style={{ color: '#888', fontStyle: 'italic' }}>No activity recorded yet.</p>
             ) : (
                 history.map((log, i) => (
                    <div key={i} className="minion-card" style={{ padding: '15px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div style={{ 
                                width: '10px', height: '10px', 
                                borderRadius: '50%', 
                                background: (log.status === 'Fixed' || log.status === 'Completed') ? '#4caf50' : '#2196f3' 
                            }}></div>
                            <div>
                                <div style={{ fontWeight: 'bold' }}>{log.action}: {log.desc}</div>
                                <div style={{ fontSize: '0.85rem', color: '#888' }}>{log.time}</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem', color: '#555' }}>
                            {(log.status === 'Fixed' || log.action === 'Repair') ? <RefreshCw size={14} /> : <Check size={14} />}
                            {log.status}
                        </div>
                    </div>
                ))
             )}
        </div>
    </div>
  );
};

export default RunHistory;
