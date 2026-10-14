import './App.css';
import { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './auth/AuthContext';
import AppLayout from './components/layout/AppLayout';
import AppProviders from './components/layout/AppProviders';
import LoginPage from './components/login/LoginPage';
import CoursesView from './components/courses/CoursesView';
import EnrollmentsView from './components/enrollments/EnrollmentsView';
import StudentsView from './components/students/StudentsView';
import { createQueryClient } from './queryClient';

export type AppView = 'students' | 'courses' | 'enrollments';

function AuthenticatedShell() {
  const { isAuthenticated } = useAuth();
  const [activeView, setActiveView] = useState<AppView>('students');

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  let content;
  if (activeView === 'courses') {
    content = <CoursesView />;
  } else if (activeView === 'enrollments') {
    content = <EnrollmentsView />;
  } else {
    content = <StudentsView />;
  }

  return (
    <AppLayout activeView={activeView} onNavigate={setActiveView}>
      {content}
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
