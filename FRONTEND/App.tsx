
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/common/Header';
import LoginPage from './components/auth/LoginPage';
import SignupPage from './components/auth/SignupPage';
import TicketsListPage from './components/tickets/TicketsListPage';
import CreateTicketPage from './components/tickets/CreateTicketPage';
import TicketDetailPage from './components/tickets/TicketDetailPage';
import AdminDashboardPage from './components/admin/AdminDashboardPage';
import ProtectedRoute from './components/common/ProtectedRoute';
import { useAuth } from './hooks/useAuth';
import Spinner from './components/common/Spinner';

const App: React.FC = () => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <Header />
      <main className="container mx-auto p-4 md:p-6">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          
          <Route path="/" element={<ProtectedRoute><TicketsListPage /></ProtectedRoute>} />
          <Route path="/tickets/new" element={<ProtectedRoute><CreateTicketPage /></ProtectedRoute>} />
          <Route path="/tickets/:id" element={<ProtectedRoute><TicketDetailPage /></ProtectedRoute>} />
          
          <Route path="/admin" element={<ProtectedRoute adminOnly={true}><AdminDashboardPage /></ProtectedRoute>} />

          <Route path="*" element={<LoginPage />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
