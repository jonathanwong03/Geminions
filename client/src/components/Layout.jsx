import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';

const Layout = () => {
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
      
      <div style={{ flex: 1, marginLeft: isSidebarOpen ? '0' : '0', transition: 'margin 0.3s', display: 'flex', flexDirection: 'column' }} className="main-content">
        <header style={{ padding: '20px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }} className="block md:hidden">
            <button onClick={() => setIsSidebarOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#333' }}>
                <Menu size={24} />
            </button>
        </header>
        
        <main style={{ padding: '0 20px', maxWidth: '1200px', width: '100%', boxSizing: 'border-box', margin: '0 auto' }}>
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
        }
        
        .main-content {
            margin-left: 290px !important; /* width + padding */
        }
        
        @media (max-width: 768px) {
            .sidebar {
                transform: translateX(-100%);
            }
            .sidebar.open {
                transform: translateX(0);
            }
            .main-content {
                margin-left: 0 !important;
            }
        }
      `}</style>
    </div>
  );
};

export default Layout;
