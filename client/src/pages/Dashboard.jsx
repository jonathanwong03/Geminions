import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Folder, User, Zap, MessageSquare, Video, ShieldCheck, History } from 'lucide-react';
import { useOutletContext, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const [stats, setStats] = useState({ generated: 0, brandScore: 0, passingRate: 0 });
  const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [projectsRes] = await Promise.all([
            fetch(`${serverUrl}/api/projects`, { credentials: 'include' })
        ]);

        if (projectsRes.ok) {
            const projects = await projectsRes.json();
            
            const totalCount = projects.length;
            
            // Real logic: Average the scores stored in projects
            let totalBrandScore = 0;
            let totalSatScore = 0;
            let ratedBrandCount = 0;
            let ratedSatCount = 0;

            projects.forEach(p => {
                if (p.brandScore) {
                    totalBrandScore += p.brandScore;
                    ratedBrandCount++;
                }
                if (p.satisfactionScore) {
                    totalSatScore += p.satisfactionScore;
                    ratedSatCount++;
                }
            });

            // If no data, fallback to "New User" stats (e.g., 100% or 0%)
            // Scale is 1-10, so multiply by 10 for percentage
            const brandScore = ratedBrandCount > 0 ? Math.round((totalBrandScore / ratedBrandCount) * 10) : 0;
            const passingRate = ratedSatCount > 0 ? Math.round((totalSatScore / ratedSatCount) * 10) : 0;

            setStats({
                generated: totalCount,
                brandScore,
                passingRate
            });
        }
      } catch (error) {
          console.error("Failed to fetch dashboard stats", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div>
        <Header 
            title="Dashboard" 
            subtitle={`Welcome back, ${user?.username || 'Minion'}!`}
        >
            <button className="btn-primary" onClick={() => navigate('/projects')}>Create Campaign</button>
            <button className="btn-secondary" style={{ background: '#e0e0e0', color: '#333' }} onClick={() => navigate('/exports')}>Export Pack</button>
        </Header>

        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px' }}>
             <StatCard label="Assets Generated" value={stats.generated} color="var(--minion-blue)" />
             <StatCard label="Avg Brand Score" value={`${stats.brandScore}%`} color="var(--minion-blue)" />
             <StatCard label="Passing Rate" value={`${stats.passingRate}%`} color="var(--minion-yellow)" />
        </div>

        <h2 style={{ marginBottom: '30px' }}>Core Features</h2>
        <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          <FeatureCard 
            title="Brand DNA Vault" 
            description="Analyzes brand guidelines to ensure strict adherence to hex codes and tone." 
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
