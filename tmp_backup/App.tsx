
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import DashboardPreview from './components/DashboardPreview';
import WhyUs from './components/WhyUs';
import Pricing from './components/Pricing';
import Footer from './components/Footer';
import QuickScanModal from './components/QuickScanModal';
import FloatingScanButton from './components/FloatingScanButton';
import ChatBot from './components/ChatBot';
import Dashboard from './components/Dashboard';
import AdminPage from './components/AdminPage';
import AdminLogin from './components/AdminLogin';
import AuthModal from './components/AuthModal';
import authService from './services/authService';

function App() {
  const [isQuickScanOpen, setIsQuickScanOpen] = useState(false);
  const [pendingScan, setPendingScan] = useState<{username: string, platform: string} | null>(null);
  
  // View State: 'home' (Landing), 'dashboard' (App), 'admin-login' (Admin Login), or 'admin' (Admin Panel)
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [dashboardTab, setDashboardTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string[]>([]);
  
  // Initialize auth state by checking backend tokens
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return !!localStorage.getItem('accessToken');
    } catch (e) {
      console.warn("Storage access restricted:", e);
      return false;
    }
  });

  // Check auth status on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // If we have a token, verify it's still valid
        if (localStorage.getItem('accessToken')) {
          const profile = await authService.getUserProfile();
          if (profile.success) {
            setIsAuthenticated(true);
            setUserRole(profile.data?.roles || []);
          } else {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            setIsAuthenticated(false);
          }
        }
      } catch (error) {
        console.error("Auth verification failed:", error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Effect to handle URL-based routing for /admin (only on initial mount)
  useEffect(() => {
    const pathname = window.location.pathname;
    if (pathname === '/admin' || pathname === '/admin/login') {
      setIsAdminLoginOpen(true);
    }
  }, []); // Empty deps - only run once on mount

  // Effect to sync dashboard state with auth state
  useEffect(() => {
    if (!isAuthenticated && isDashboardOpen) {
      setIsDashboardOpen(false);
    }
    if (!isAuthenticated && isAdminOpen) {
      setIsAdminOpen(false);
    }
    // Only close admin login if ALREADY authenticated (not on first login)
    if (isAuthenticated && isAdminLoginOpen && localStorage.getItem('accessToken')) {
      console.log('🔄 Closing admin login due to auth state');
      setIsAdminLoginOpen(false);
    }
  }, [isAuthenticated, isDashboardOpen, isAdminOpen, isAdminLoginOpen]);

  // Effect to update URL when admin state changes
  useEffect(() => {
    if (isAdminLoginOpen) {
      window.history.pushState({}, '', '/admin');
    } else if (isAdminOpen) {
      window.history.pushState({}, '', '/admin/dashboard');
    } else if (!isDashboardOpen && !isAdminOpen) {
      window.history.pushState({}, '', '/');
    }
  }, [isAdminLoginOpen, isAdminOpen, isDashboardOpen]);

  const handleLoginSuccess = async () => {
    setIsAuthenticated(true);
    // Fetch updated user profile to get roles
    try {
      const profile = await authService.getUserProfile();
      if (profile.success && profile.data?.roles) {
        setUserRole(profile.data.roles);
      }
    } catch (error) {
      console.error("Failed to fetch user profile after login:", error);
    }
    // Default to Landing Page first, or Dashboard if they had a pending action
    if (pendingScan) {
      setIsQuickScanOpen(true);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await authService.logout();
    } catch (err) {
      console.warn("Logout error:", err);
    } finally {
      setIsAuthenticated(false);
      setIsDashboardOpen(false);
      setIsAdminOpen(false);
      setIsAdminLoginOpen(false);
      setPendingScan(null);
      setUserRole([]);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setLoading(false);
    }
  };

  const openQuickScan = (username?: string, platform?: string) => {
    if (username) setPendingScan({ username, platform: platform || 'instagram' });
    setIsQuickScanOpen(true);
  };

  const openAdminLogin = () => {
    setIsAdminLoginOpen(true);
  };
  
  const enterDashboard = (tab: string = 'overview') => {
    setDashboardTab(tab);
    setIsDashboardOpen(true);
    window.scrollTo(0, 0);
  };

  // --- RENDER LOGIC ---

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-cyber-dark">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <div className="w-12 h-12 border-4 border-cyber-cyan border-t-transparent rounded-full"></div>
          </div>
          <p className="text-cyber-cyan">Initializing...</p>
        </div>
      </div>
    );
  }
  // 1. If Admin Login modal is open, show it
  if (isAdminLoginOpen) {
    return (
      <AdminLogin
        onLoginSuccess={async () => {
          console.log('🔐 Admin login success callback triggered');
          // First, mark as authenticated since the login was successful
          setIsAuthenticated(true);
          setIsAdminLoginOpen(false);
          // Fetch user profile to get roles
          try {
            const profile = await authService.getUserProfile();
            console.log('📋 Profile in callback:', profile);
            if (profile.success && profile.user?.roles) {
              console.log('👨‍💼 Setting user roles:', profile.user.roles);
              setUserRole(profile.user.roles);
            }
          } catch (error) {
            console.error("Failed to fetch admin profile:", error);
          }
          console.log('✅ Setting isAdminOpen to true');
          setIsAdminOpen(true);
        }}
        onBackToHome={() => setIsAdminLoginOpen(false)}
      />
    );
  }

  // 2. If NOT authenticated, show the AuthModal (Login/Signup) exclusively
  if (!isAuthenticated) {
    return (
      <AuthModal 
        isOpen={true}
        onClose={() => {}} // Can't close when not authenticated
        initialView="login"
        onLoginSuccess={handleLoginSuccess}
        preventClose={true}
      />
    );
  }

  // 3. If Authenticated AND Admin Panel is active, show the protected Admin Panel
  if (isAdminOpen && userRole.includes('admin')) {
    return (
      <div className="min-h-screen bg-[#0F0F1E]">
        <div className="flex items-center justify-between bg-gradient-to-r from-cyber-cyan/10 to-cyber-purple/10 border-b border-cyber-border px-6 py-4 sticky top-0 z-50">
          <h1 className="text-xl font-display font-bold text-white">Admin Panel</h1>
          <button 
            onClick={() => setIsAdminOpen(false)}
            className="px-4 py-2 bg-white/5 border border-cyber-border rounded-lg hover:bg-white/10 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
        <AdminPage />
      </div>
    );
  }

  // 3. If Authenticated AND Dashboard is active, show the protected Dashboard view
  if (isDashboardOpen) {
    return (
      <Dashboard 
        onLogout={handleLogout} 
        initialTab={dashboardTab} 
        onHome={() => setIsDashboardOpen(false)}
        onAdmin={userRole.includes('admin') ? () => setIsAdminOpen(true) : undefined}
      />
    );
  }

  // 4. Otherwise, show the full Landing Page experience
  return (
    <div className="min-h-screen bg-transparent text-cyber-text font-sans selection:bg-cyber-cyan selection:text-cyber-dark relative">
      
      {/* Mesh Gradient Background Layer */}
      <div className="fixed inset-0 pointer-events-none -z-40 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-cyber-cyan/10 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-cyber-purple/10 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="transition-all duration-500">
        
        <Header 
          isAuthenticated={isAuthenticated}
          onLogin={() => {}} // Not needed as we are already logged in to see this
          onSignup={() => {}} 
          onLogout={handleLogout}
          onDashboard={() => enterDashboard('overview')}
          onAdmin={userRole.includes('admin') ? () => setIsAdminOpen(true) : undefined}
          onAdminLogin={openAdminLogin}
          isAdmin={userRole.includes('admin')}
        />
        
        <main className="relative z-10">
          <Hero onScanClick={openQuickScan} />
          <Features />
          <DashboardPreview />
          <WhyUs />
          <Pricing />
        </main>
        <Footer />

        {/* Interactive Overlays */}
        <FloatingScanButton onClick={() => openQuickScan()} />
        <ChatBot />
        
        <QuickScanModal 
          isOpen={isQuickScanOpen} 
          initialData={pendingScan || undefined}
          onClose={() => {
            setIsQuickScanOpen(false);
            setPendingScan(null);
          }} 
          onUpgrade={() => {
            setDashboardTab('billing');
            setIsDashboardOpen(true);
            setIsQuickScanOpen(false);
          }} 
        />
      </div>
    </div>
  );
}

export default App;
