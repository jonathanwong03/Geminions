import React from 'react';
import { AlertCircle, Check, X, RefreshCw } from 'lucide-react';
import Header from '../components/Header';

const RunHistory = () => {
  return (
    <div style={{ padding: '20px' }}>
       <Header 
         title="The Feedback Loop"
         subtitle="Autonomous quality control & critique history"
       />

        <div className="minion-card" style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '20px' }}>
             <div style={{ width: '50px', height: '50px', background: 'white', borderRadius: '50%', border: '2px solid #ffebee', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d32f2f' }}>
                 <AlertCircle size={24} />
             </div>
             <div style={{ flex: 1 }}>
                 <h3 style={{ margin: '0 0 5px 0' }}>Recent Correction Triggered</h3>
                 <p style={{ margin: 0, color: '#666' }}>Gemini 3 detected illegible text in "Banner V2" and triggered Nano Banana paint-to-edit to repair it.</p>
             </div>
             <button style={{ padding: '8px 16px', background: 'white', border: '1px solid #ddd', borderRadius: '20px', cursor: 'pointer' }}>View Details</button>
        </div>

        <h2 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Generation Log</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
             {[
                 { action: 'Repair', status: 'Fixed', desc: 'Text contrast adjustment', time: '10 mins ago' },
                 { action: 'Critique', status: 'Approved', desc: 'Visual hallucination check passed', time: '1 hour ago' },
                 { action: 'Generate', status: 'Completed', desc: 'Initial concept generation from brief', time: '2 hours ago' },
             ].map((log, i) => (
                 <div key={i} className="minion-card" style={{ padding: '15px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                         <div style={{ 
                             width: '10px', height: '10px', 
                             borderRadius: '50%', 
                             background: log.status === 'Fixed' || log.status === 'Completed' ? '#4caf50' : '#2196f3' 
                         }}></div>
                         <div>
                             <div style={{ fontWeight: 'bold' }}>{log.action}: {log.desc}</div>
                             <div style={{ fontSize: '0.85rem', color: '#888' }}>{log.time}</div>
                         </div>
                     </div>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem', color: '#555' }}>
                         {log.status === 'Fixed' ? <RefreshCw size={14} /> : <Check size={14} />}
                         {log.status}
                     </div>
                 </div>
             ))}
        </div>
    </div>
  );
};

export default RunHistory;
