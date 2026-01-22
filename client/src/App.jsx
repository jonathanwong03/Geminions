import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import BrandKits from './pages/BrandKits';
import Templates from './pages/Templates';
import Exports from './pages/Exports';
import RunHistory from './pages/RunHistory';
import Layout from './components/Layout';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/brand-kits" element={<BrandKits />} />
        <Route path="/templates" element={<Templates />} />
        <Route path="/exports" element={<Exports />} />
        <Route path="/run-history" element={<RunHistory />} />
      </Route>
    </Routes>
  );
}

export default App;
