import React, { useState, useEffect, Suspense } from 'react';
import Layout from './components/Layout';
import AuthScreen from './components/AuthScreen';
import { 
  useAuth,
  logout, 
  seedData
} from './services/storageService';
import { User } from './types';
import { Loader2 } from 'lucide-react';

// Lazy Load Components for Performance (Code Splitting)
const Dashboard = React.lazy(() => import('./components/Dashboard'));
const PostGenerator = React.lazy(() => import('./components/PostGenerator'));
const Analytics = React.lazy(() => import('./components/Analytics'));
const CalendarView = React.lazy(() => import('./components/CalendarView'));
const CompanySettings = React.lazy(() => import('./components/CompanySettings'));

// Loading Fallback
const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="animate-spin text-indigo-600 dark:text-indigo-400" size={48} />
      <p className="text-gray-500 dark:text-gray-400 font-medium animate-pulse">Cargando PostFlow...</p>
    </div>
  </div>
);

const App: React.FC = () => {
  // Use the useAuth hook which handles the async Firebase restoration
  const { user, loading: authLoading } = useAuth();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('theme');
        if (stored) return stored === 'dark';
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Theme Management
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Seed Data when user loads
  useEffect(() => {
    if (user) {
      seedData(user.uid);
    }
  }, [user]);

  const handleLogout = () => {
    logout();
  };

  const toggleTheme = () => setDarkMode(!darkMode);

  // 1. Show Loader while Firebase restores session
  if (authLoading) {
    return <PageLoader />;
  }

  // 2. Show Auth Screen if no user found after loading
  if (!user) {
    // onLogin is just a trigger to re-check, but useAuth handles state updates automatically
    return <AuthScreen onLogin={() => {}} />;
  }

  // 3. Render App Content
  const renderContent = () => {
    return (
      <Suspense fallback={<div className="flex h-full items-center justify-center min-h-[400px]"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>}>
        {(() => {
          switch (activeTab) {
            case 'generator': return <PostGenerator />;
            case 'profile': return <CompanySettings />;
            case 'analytics': return <Analytics isDarkMode={darkMode} />;
            case 'calendar': return <CalendarView />;
            case 'dashboard':
            default: return <Dashboard />;
          }
        })()}
      </Suspense>
    );
  };

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      user={user} 
      onLogout={handleLogout}
      isDarkMode={darkMode}
      toggleTheme={toggleTheme}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;