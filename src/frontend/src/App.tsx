import './App.css';
import { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './auth/AuthContext';
import AppLayout from './components/layout/AppLayout';
import AppProviders from './components/layout/AppProviders';
import LoginPage from './components/login/LoginPage';
import StudentsView from './components/students/StudentsView';
import { createQueryClient } from './queryClient';

function AuthenticatedShell() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <AppLayout>
      <StudentsView />
    </AppLayout>
  );
}

function App() {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppProviders>
          <AuthenticatedShell />
        </AppProviders>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
