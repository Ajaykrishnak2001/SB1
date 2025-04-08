import  { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ReportTable } from './components/ReportTable';
import { CandidateView } from './components/CandidateView';
import { AdminDashboard } from './components/AdminDashboard';
import { Login } from './components/Login';
import { Layout } from './components/Layout';
import { Unauthorized } from './components/Unauthorized';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import type { ReportData } from './types/report';
import { AlertTriangle } from 'lucide-react';
// import { Box, Tab, Tabs } from '@mui/material';

function App() {
  const [data, setData] = useState<ReportData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://sb1-k8e7.onrender.com/api/candidates") 
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(jsonData => {
        if (!Array.isArray(jsonData)) {
          throw new Error("Invalid data format");
        }
        setData(jsonData);
        setError(null);
      })
      .catch(error => {
        console.error("Error fetching data:", error);
        setError("Failed to load report data. Please try again later.");
        setData(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);
  

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full mx-4">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="text-red-500" size={24} />
            <h2 className="text-lg font-semibold text-gray-900">Error</h2>
          </div>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <p className="text-gray-600 font-medium">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={
              <ProtectedRoute requiredRole="expert">
                <ReportTable data={data} />
              </ProtectedRoute>
            } />
            <Route path="candidates" element={
              <ProtectedRoute requiredRole="expert">
                <CandidateView data={data} />
              </ProtectedRoute>
            } />
            <Route path="dashboard" element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } />
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;