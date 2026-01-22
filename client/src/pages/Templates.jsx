import React from 'react';
import { Layout, Smartphone, Monitor, Video, Layers } from 'lucide-react';
import Header from '../components/Header';

const Templates = () => {
  return (
    <div style={{ padding: '20px' }}>
        <Header 
          title="Context-Aware Templates"
          subtitle="Automatically adapt designs for different channels"
        />

        <div className="minion-card" style={{ marginBottom: '30px', borderLeft: '5px solid var(--minion-blue)' }}>
            <h3 style={{ marginTop: 0 }}>Automatic Adaptation Active</h3>
            <p>
                When you select a template, our system intelligently moves logos and text to ensure legibility and safe-zone compliance across platforms (Instagram Stories, LinkedIn Banners, etc.).
            </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '10px' }}>
            {['All', 'Social Media', 'Ads', 'Presentations', 'Video'].map(cat => (
                <button key={cat} style={{ 
                    padding: '8px 16px', 
                    borderRadius: '20px', 
                    border: '1px solid #ddd', 
                    background: cat === 'All' ? '#333' : 'white', 
                    color: cat === 'All' ? 'white' : '#333',
                    cursor: 'pointer'
                }}>
                    {cat}
                </button>
            ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
            {[
                { name: 'Instagram Story', icon: <Smartphone size={24} /> },
                { name: 'LinkedIn Banner', icon: <Monitor size={24} /> },
                { name: 'YouTube Thumbnail', icon: <Video size={24} /> },
                { name: 'Carousel Ad', icon: <Layers size={24} /> }
            ].map((template, i) => (
                <div key={i} className="minion-card" style={{ cursor: 'pointer', textAlign: 'center', padding: '40px 20px' }}>
                    <div style={{ 
                        width: '60px', height: '60px', 
                        background: 'var(--minion-yellow)', 
                        borderRadius: '50%', 
                        margin: '0 auto 20px', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#333'
                    }}>
                        {template.icon}
                    </div>
                    <h3 style={{ margin: '0 0 10px 0' }}>{template.name}</h3>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>Smart Layout Ready</p>
                </div>
            ))}
        </div>
    </div>
  );
};

export default Templates;
