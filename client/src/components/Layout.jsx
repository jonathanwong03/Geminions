import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';

const Layout = () => {
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

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
      })
      .finally(() => setIsLoading(false));
  }, [navigate]);

  const handleLogout = async () => {
      try {
        await axios.post('/auth/logout');
        navigate('/login');
      } catch (err) {
        console.error(err);
      }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-color)' }}>
      <Sidebar 
         user={user} 
         handleLogout={handleLogout} 
         isOpen={isSidebarOpen} 
         onClose={() => setIsSidebarOpen(false)} 
      />
      
      <div style={{ flex: 1, marginLeft: isSidebarOpen ? '290px' : '0', transition: 'margin 0.3s', display: 'flex', flexDirection: 'column' }} className="main-content">
        {!isSidebarOpen && (
            <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 50 }}>
                <button onClick={() => setIsSidebarOpen(true)} style={{ background: 'white', border: '1px solid #ddd', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#333', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                    <Menu size={24} />
                </button>
            </div>
        )}
        <main style={{ padding: '0 20px', maxWidth: '1200px', width: '100%', boxSizing: 'border-box', margin: '0 auto', paddingTop: '20px' }}>
            <Outlet context={{ user }} />
        </main>
      </div>

       <style>{`
        .sidebar {
            width: 250px;
            background: white;
            padding: 20px;
            display: flex;
            flex-direction: column;
            border-right: 1px solid #eee;
            position: fixed;
            height: 100vh;
            overflow-y: auto;
            z-index: 100;
            transition: transform 0.3s ease-in-out;
            transform: translateX(-100%);
        }
        
        .sidebar.open {
            transform: translateX(0);
        }

        /* Desktop override if needed, but we controlling via JS marginLeft now mostly */
      `}</style>
    </div>
  );
};

export default Layout;
