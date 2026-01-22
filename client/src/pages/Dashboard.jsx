import React from 'react';
import { LayoutDashboard, Folder, User, Zap, MessageSquare, Video, ShieldCheck, History } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import Header from '../components/Header';

const FeatureCard = ({ title, description, icon, color }) => (
  <div className="minion-card" style={{ display: 'flex', flexDirection: 'column', height: '100%'}}>
    <div style={{ background: color + '20', width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: color, marginBottom: '15px' }}>
      {icon}
    </div>
    <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1rem' }}>{title}</h3>
    <p style={{ margin: 0, fontSize: '0.9rem', color: '#666', lineHeight: '1.5' }}>{description}</p>
  </div>
);

const StatCard = ({ label, value, color }) => (
    <div className="minion-card" style={{ textAlign: 'center', padding: '15px' }}>
        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: color }}>{value}</div>
        <div style={{ fontSize: '0.9rem', color: '#888' }}>{label}</div>
    </div>
)

const Dashboard = () => {
  const { user } = useOutletContext();

  return (
    <div>
        <Header 
            title="Dashboard" 
            subtitle={`Welcome back, ${user?.username || 'Minion'}!`}
        >
            <button className="btn-primary">Create Campaign</button>
            <button className="btn-secondary" style={{ background: '#e0e0e0', color: '#333' }}>Export Pack</button>
        </Header>

        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px' }}>
             <StatCard label="Assets Generated" value="128" color="var(--minion-blue)" />
             <StatCard label="Avg Brand Score" value="82%" color="var(--minion-blue)" />
             <StatCard label="Passing Rate" value="4" color="var(--minion-yellow)" />
        </div>

        <h2 style={{ marginBottom: '30px' }}>Core Features</h2>
        <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          <FeatureCard 
            title="Brand DNA Vault" 
            description="Analyzes brand guidelines to create a 'Vibe Vector' ensuring strict adherence to hex codes and tone." 
            icon={<ShieldCheck size={24} />} color="#0057ae" 
          />
          <FeatureCard 
            title="Feedback Loop" 
            description="Autonomous quality control where Gemini 3 critiques and triggers Nano Banana to repair errors." 
            icon={<MessageSquare size={24} />} color="#f5e050" 
          />
          <FeatureCard 
            title="Context-Aware Adaptation" 
            description="Intelligently recomposes designs for different channels (banner to Story) keeping elements safe." 
            icon={<LayoutDashboard size={24} />} color="#0057ae" 
          />
          <FeatureCard 
            title="The Agency Interface" 
            description="Converts unstructured inputs (transcripts) into design briefs with AI reasoning." 
            icon={<User size={24} />} color="#f5e050" 
          />
           <FeatureCard 
            title="Generative Core" 
            description="Transforms text briefs into high-fidelity assets using Nano Banana Pro." 
            icon={<Zap size={24} />} color="#0057ae" 
          />
           <FeatureCard 
            title="Narrative Continuity" 
            description="Ensures character consistency across sequences, preventing random visual changes." 
            icon={<History size={24} />} color="#f5e050" 
          />
           <FeatureCard 
            title="Motion & Video Extension" 
            description="Expands static assets into motion graphics by predicting logical movement." 
            icon={<Video size={24} />} color="#0057ae" 
          />
        </div>
    </div>
  );
};

export default Dashboard;
