import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './Layout';
import Dashboard from './pages/Dashboard';
import Owners from './pages/Owners';
import Units from './pages/Units';
import Tenants from './pages/Tenants';
import Contracts from './pages/Contracts';
import Notifications from './pages/Notifications';
import Login from './pages/Login';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout><Dashboard /></Layout>} />
        <Route path="/dashboard" element={<Layout currentPageName="Dashboard"><Dashboard /></Layout>} />
        <Route path="/owners" element={<Layout currentPageName="Owners"><Owners /></Layout>} />
        <Route path="/units" element={<Layout currentPageName="Units"><Units /></Layout>} />
        <Route path="/tenants" element={<Layout currentPageName="Tenants"><Tenants /></Layout>} />
        <Route path="/contracts" element={<Layout currentPageName="Contracts"><Contracts /></Layout>} />
        <Route path="/notifications" element={<Layout currentPageName="Notifications"><Notifications /></Layout>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;