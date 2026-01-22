import React from 'react';
import { Upload, Lock, ShieldCheck, Palette } from 'lucide-react';
import Header from '../components/Header';

const BrandKits = () => {
  return (
    <div style={{ padding: '20px' }}>
       <Header 
         title="Brand DNA Vault"
         subtitle="Secure asset lock-box & Vibe Vector analysis"
       >
        <button className="btn-primary">
          <Upload size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
          Ingest Guidelines
        </button>
      </Header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          <div className="minion-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                  <div style={{ padding: '10px', background: '#e3f2fd', borderRadius: '10px', color: 'var(--minion-blue)' }}>
                    <ShieldCheck size={24} />
                  </div>
                  <h3 style={{ margin: 0 }}>Vibe Vector</h3>
              </div>
              <p style={{ color: '#666', lineHeight: '1.6' }}>
                  Your semantic analysis of brand guidelines is active. Content generation is currently locked to official tone and style.
              </p>
              <div style={{ marginTop: '20px', height: '8px', background: '#eee', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '85%', background: 'var(--minion-blue)', height: '100%' }}></div>
              </div>
              <div style={{ textAlign: 'right', fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>85% Adherence Score</div>
          </div>

           <div className="minion-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                  <div style={{ padding: '10px', background: '#fff9c4', borderRadius: '10px', color: '#fbc02d' }}>
                    <Lock size={24} />
                  </div>
                  <h3 style={{ margin: 0 }}>Asset Lock-Box</h3>
              </div>
               <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                   {['#FFD700', '#0057AE', '#FFFFFF', '#333333'].map(color => (
                       <div key={color} style={{ width: '40px', height: '40px', borderRadius: '50%', background: color, border: '2px solid #eee', cursor: 'pointer' }} title={color}></div>
                   ))}
               </div>
               <div style={{ marginTop: '20px', fontWeight: 'bold' }}>Typography</div>
               <div style={{ fontFamily: 'sans-serif', color: '#666', marginTop: '5px' }}>Helvetica Neue, Arial (Primary)</div>
          </div>
      </div>

      <h2 style={{ marginBottom: '20px' }}>Active Brand Kits</h2>
      <div className="minion-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ width: '60px', height: '60px', background: '#f0f0f0', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Palette size={24} color="#666" />
              </div>
              <div>
                  <h3 style={{ margin: 0 }}>Minion Global</h3>
                  <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>Last updated 2 days ago</p>
              </div>
          </div>
          <button className="btn-secondary" style={{ fontSize: '0.9rem' }}>Manage Assets</button>
      </div>
    </div>
  );
};

export default BrandKits;
