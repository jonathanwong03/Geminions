import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Folder, Palette, FileText, Download, History, LogOut, X } from 'lucide-react';

const Sidebar = ({ user, handleLogout, isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '40px', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
          <div style={{ width: '40px', height: '40px', background: 'var(--minion-yellow)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '10px', fontSize: '20px' }}>👀</div>
          <h2 style={{ margin: 0, color: '#333' }}>Grumini</h2>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#333' }} className="block md:hidden">
            <X size={24} />
        </button>
      </div>
      
      <nav style={{ flex: 1 }}>
        <NavItem 
            icon={<LayoutDashboard size={20} />} 
            text="Dashboard" 
            active={isActive('/dashboard')} 
            onClick={() => navigate('/dashboard')} 
        />
        <NavItem 
            icon={<Folder size={20} />} 
            text="Projects" 
            active={isActive('/projects')} 
            onClick={() => navigate('/projects')}
        />
        <NavItem 
            icon={<Palette size={20} />} 
            text="Brand Kits" 
            active={isActive('/brand-kits')} 
            onClick={() => navigate('/brand-kits')}
        />
        <NavItem 
            icon={<FileText size={20} />} 
            text="Templates" 
            active={isActive('/templates')} 
            onClick={() => navigate('/templates')}
        />
        <NavItem 
            icon={<Download size={20} />} 
            text="Exports" 
            active={isActive('/exports')} 
            onClick={() => navigate('/exports')}
        />
        <NavItem 
            icon={<History size={20} />} 
            text="Run History" 
            active={isActive('/run-history')} 
            onClick={() => navigate('/run-history')}
        />
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
};

const NavItem = ({ icon, text, active, onClick }) => (
  <div onClick={onClick} style={{ 
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

export default Sidebar;
