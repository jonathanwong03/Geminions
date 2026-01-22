import React from 'react';
import { Plus, Search, MoreHorizontal, MessageSquare, Zap } from 'lucide-react';
import Header from '../components/Header';

const Projects = () => {
  return (
    <div style={{ padding: '20px' }}>
      <Header 
        title="Projects" 
        subtitle="The Agency Interface & Generative Core"
      >
        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={20} /> New Project
        </button>
      </Header>

      <div className="minion-card" style={{ marginBottom: '20px', padding: '30px', background: 'linear-gradient(135deg, #0057ae 0%, #0077ee 100%)', color: 'white' }}>
         <h2 style={{marginTop: 0}}>Create from Brief</h2>
         <p style={{ opacity: 0.9, maxWidth: '600px', lineHeight: '1.6' }}>
            Enter unstructured inputs like meeting transcripts or rough notes. Our <strong>Agency Interface</strong> will convert them into precise design briefs.
         </p>
         <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
             <input type="text" placeholder="Describe your campaign..." style={{ border: 'none', padding: '15px' }} />
             <button className="btn-secondary" style={{ whiteSpace: 'nowrap' }}>
                 <Zap size={16} style={{ marginRight: '5px', verticalAlign: 'middle' }}/> 
                 Generate Assets
             </button>
         </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="minion-card">
            <div style={{ height: '150px', background: '#eee', borderRadius: '10px', marginBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
               Preview Image
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                    <h3 style={{ margin: '0 0 5px 0' }}>Summer Campaign {i}</h3>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#666' }}>Generated 2 hours ago</p>
                </div>
                <MoreHorizontal size={20} color="#999" style={{ cursor: 'pointer' }} />
            </div>
            <div style={{ marginTop: '15px', padding: '10px', background: '#f8f9fa', borderRadius: '8px', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px', color: 'var(--minion-blue)', fontWeight: 'bold' }}>
                    <MessageSquare size={14} /> Reasoning
                </div>
                Aligns with strategic goals by emphasizing product freshness.
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Projects;
