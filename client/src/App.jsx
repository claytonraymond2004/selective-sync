import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import PageTitle from './components/PageTitle';
import Dashboard from './pages/Dashboard';
import Browser from './pages/Browser';
import Jobs from './pages/Jobs';
import Settings from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <PageTitle />
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/browse" element={<Browser />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
