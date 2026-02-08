import React from 'react';

const Header = ({ title, subtitle, children }) => {
  return (
    <header className="dashboard-header" style={{marginBottom: '50px'}} >
      <div>
          <h1 style={{ margin: 0, fontSize: '2rem', color: '#333' }}>{title}</h1>
          <p style={{ color: '#666', margin: '5px 0 0 0' }}>{subtitle}</p>
      </div>
      {children && (
          <div className="header-actions" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {children}
          </div>
      )}
    </header>
  );
};

export default Header;
