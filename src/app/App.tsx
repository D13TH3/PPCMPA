import { RouterProvider } from 'react-router';
import { router } from './routes';
import { Toaster } from './components/ui/sonner';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { MpaProvider } from './contexts/MpaContext';

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <MpaProvider>
          <RouterProvider router={router} />
          <Toaster />
        </MpaProvider>
      </DataProvider>
    </AuthProvider>
  );
}