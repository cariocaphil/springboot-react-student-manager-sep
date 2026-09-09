import './App.css';
import { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import AppLayout from './components/layout/AppLayout';
import StudentsView from './components/students/StudentsView';
import { createQueryClient } from './queryClient';

function App() {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AppLayout>
        <StudentsView />
      </AppLayout>
    </QueryClientProvider>
  );
}

export default App;
