import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Folder, Palette, FileText, Download, History, LogOut, Zap, MessageSquare, Video, ShieldCheck, User } from 'lucide-react';

const Sidebar = ({ user, handleLogout }) => (
  <div style={{ width: '250px', background: 'white', padding: '20px', display: 'flex', flexDirection: 'column', height: '100vh', boxSizing: 'border-box', position: 'fixed', left: 0, top: 0 }}>
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '40px' }}>
      <div style={{ width: '40px', height: '40px', background: 'var(--minion-yellow)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '10px', fontSize: '20px' }}>👀</div>
      <h2 style={{ margin: 0, color: '#333' }}>Grumini</h2>
    </div>
    
    <nav style={{ flex: 1 }}>
      <NavItem icon={<LayoutDashboard size={20} />} text="Dashboard" active />
      <NavItem icon={<Folder size={20} />} text="Projects" />
      <NavItem icon={<Palette size={20} />} text="Brand Kits" />
      <NavItem icon={<FileText size={20} />} text="Templates" />
      <NavItem icon={<Download size={20} />} text="Exports" />
      <NavItem icon={<History size={20} />} text="Run History" />
    </nav>
    
    <div style={{ borderTop: '1px solid #eee', paddingTop: '20px' }}>
         <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
             {user?.avatar_url && <img src={user.avatar_url} alt="Avatar" style={{ width: '30px', height: '30px', borderRadius: '50%', marginRight: '10px' }} />}
             <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{user?.username || user?.email || 'User'}</span>
         </div>
        <button onClick={handleLogout} style={{ background: 'transparent', border: 'none', color: 'red', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <LogOut size={16} /> Logout
        </button>
    </div>
  </div>
);

const NavItem = ({ icon, text, active }) => (
  <div style={{ 
    display: 'flex', 
    alignItems: 'center', 
    padding: '10px 15px', 
    marginBottom: '5px', 
    borderRadius: '10px', 
    background: active ? 'var(--minion-blue)' : 'transparent', 
    color: active ? 'white' : '#666', 
    cursor: 'pointer' 
  }}>
    <span style={{ marginRight: '10px' }}>{icon}</span>
    {text}
  </div>
);

const FeatureCard = ({ title, description, icon, color }) => (
  <div className="minion-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
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
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    axios.get('/auth/user')
      .then(res => {
        if (res.data.authenticated) {
          setUser(res.data.user);
        } else {
          navigate('/login');
        }
      })
      .catch((err) => {
         console.error(err);
         navigate('/login'); 
      });
  }, [navigate]);

  const handleLogout = async () => {
      try {
        await axios.post('/auth/logout');
        navigate('/login');
      } catch (err) {
        console.error(err);
      }
  };

  if (!user) return <div style={{height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>Loading...</div>;

  return (
    <div style={{ display: 'flex', background: '#f5f7fa', minHeight: '100vh' }}>
      <Sidebar user={user} handleLogout={handleLogout} />
      
      <main style={{ flex: 1, padding: '40px', marginLeft: '250px', overflowY: 'auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '2rem' }}>Dashboard</h1>
            <p style={{ color: '#666' }}>Welcome back, {user.username || 'Minion'}!</p>
          </div>
          <div style={{ display: 'flex', gap: '15px' }}>
              <button className="btn-primary">Create Campaign</button>
              <button className="btn-secondary" style={{ background: '#e0e0e0', color: '#333' }}>Export Pack</button>
          </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px' }}>
             <StatCard label="Assets Generated" value="128" color="var(--minion-blue)" />
             <StatCard label="Avg Brand Score" value="82%" color="var(--minion-blue)" />
             <StatCard label="Passing Rate" value="4" color="var(--minion-yellow)" />
        </div>

        <h2 style={{ marginBottom: '20px' }}>Core Features</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          <FeatureCard 
            title="Brand DNA Vault" 
            description="Analyzes brand guidelines to create a 'Vibe Vector' ensuring strict adherence to hex codes and tone." 
            icon={<ShieldCheck />} color="#0057ae" 
          />
          <FeatureCard 
            title="Feedback Loop" 
            description="Autonomous quality control where Gemini 3 critiques and triggers Nano Banana to repair errors." 
            icon={<MessageSquare />} color="#f5e050" 
          />
          <FeatureCard 
            title="Context-Aware Adaptation" 
            description="Intelligently recomposes designs for different channels (banner to Story) keeping elements safe." 
            icon={<LayoutDashboard />} color="#0057ae" 
          />
          <FeatureCard 
            title="The Agency Interface" 
            description="Converts unstructured inputs (transcripts) into design briefs with AI reasoning." 
            icon={<User />} color="#f5e050" 
          />
           <FeatureCard 
            title="Generative Core" 
            description="Transforms text briefs into high-fidelity assets using Nano Banana Pro." 
            icon={<Zap />} color="#0057ae" 
          />
           <FeatureCard 
            title="Narrative Continuity" 
            description="Ensures character consistency across sequences, preventing random visual changes." 
            icon={<History />} color="#f5e050" 
          />
           <FeatureCard 
            title="Motion & Video Extension" 
            description="Expands static assets into motion graphics by predicting logical movement." 
            icon={<Video />} color="#0057ae" 
          />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
