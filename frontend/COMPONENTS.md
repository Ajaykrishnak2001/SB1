# Components Documentation

## Table of Contents
- [App](#app)
- [AdminDashboard](#admindashboard)
- [CandidateView](#candidateview)
- [Header](#header)
- [Layout](#layout)
- [Login](#login)
- [ProtectedRoute](#protectedroute)
- [ReportTable](#reporttable)
- [Unauthorized](#unauthorized)

## App
```tsx
import React, { useEffect, useState } from 'react';
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
import { Box, Tab, Tabs } from '@mui/material';

function App() {
  const [data, setData] = useState<ReportData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/ItsmeBlackOps/Reports/refs/heads/main/Report.json')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(jsonData => {
        if (!Array.isArray(jsonData)) {
          throw new Error('Invalid data format');
        }
        setData(jsonData);
        setError(null);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setError('Failed to load report data. Please try again later.');
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
```

## AdminDashboard
```tsx
// Full AdminDashboard component code from src/components/AdminDashboard.tsx
${fs.readFileSync('/home/project/src/components/AdminDashboard.tsx', 'utf8')}
```

## CandidateView
```tsx
// Full CandidateView component code from src/components/CandidateView.tsx
${fs.readFileSync('/home/project/src/components/CandidateView.tsx', 'utf8')}
```

## Header
```tsx
// Full Header component code from src/components/Header.tsx
${fs.readFileSync('/home/project/src/components/Header.tsx', 'utf8')}
```

## Layout
```tsx
// Full Layout component code from src/components/Layout.tsx
${fs.readFileSync('/home/project/src/components/Layout.tsx', 'utf8')}
```

## Login
```tsx
// Full Login component code from src/components/Login.tsx
${fs.readFileSync('/home/project/src/components/Login.tsx', 'utf8')}
```

## ProtectedRoute
```tsx
// Full ProtectedRoute component code from src/components/ProtectedRoute.tsx
${fs.readFileSync('/home/project/src/components/ProtectedRoute.tsx', 'utf8')}
```

## ReportTable
```tsx
// Full ReportTable component code from src/components/ReportTable.tsx
${fs.readFileSync('/home/project/src/components/ReportTable.tsx', 'utf8')}
```

## Unauthorized
```tsx
// Full Unauthorized component code from src/components/Unauthorized.tsx
${fs.readFileSync('/home/project/src/components/Unauthorized.tsx', 'utf8')}
```