import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { db, auth } from './firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import {
  Home, Users, Building2, UserCheck, FileText, Calendar,
  Bell, Menu, X, LogOut, BarChart3, HelpCircle, PlayCircle, Car, Globe
} from 'lucide-react';

// Simple Button Component
const Button = ({ children, variant, size, icon, className, onClick, ...props }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-lg transition-all ${className || ''} ${
      variant === 'ghost' ? 'hover:bg-gray-100' : 'bg-blue-600 text-white hover:bg-blue-700'
    }`}
    {...props}
  >
    {children}
  </button>
);

// Simple Badge Component
const Badge = ({ children, className }) => (
  <span className={`px-2 py-1 text-xs rounded-full ${className || 'bg-gray-200'}`}>
    {children}
  </span>
);

export default function Layout({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [user, setUser] = useState(null);
  const [language, setLanguage] = useState('ar'); // 'ar' or 'en'
  const navigate = useNavigate();

  useEffect(() => {
    // Check auth state
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (user) loadNotifications();
    });
    return () => unsubscribe();
  }, []);

  const loadNotifications = async () => {
    try {
      const q = query(collection(db, 'notifications'), where('read', '==', false));
      const snapshot = await getDocs(q);
      setNotifications(snapshot.docs);
    } catch (e) {
      console.log(e);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const toggleLanguage = () => {
    setLanguage(lang => lang === 'ar' ? 'en' : 'ar');
    document.documentElement.dir = language === 'ar' ? 'ltr' : 'rtl';
    document.documentElement.lang = language === 'ar' ? 'en' : 'ar';
  };

  // Translations
  const t = {
    ar: {
      appName: 'نظام إدارة العقود',
      dashboard: 'لوحة التحكم',
      owners: 'الملاك',
      units: 'الوحدات',
      vehicles: 'المركبات',
      tenants: 'المستأجرين',
      contracts: 'العقود',
      calendar: 'التقويم',
      reports: 'التقارير',
      notifications: 'الإشعارات',
      tour: 'جولة تعريفية',
      tutorial: 'فيديو تعليمي',
      logout: 'تسجيل الخروج',
      welcome: 'مرحباً'
    },
    en: {
      appName: 'Contract Management System',
      dashboard: 'Dashboard',
      owners: 'Owners',
      units: 'Units',
      vehicles: 'Vehicles',
      tenants: 'Tenants',
      contracts: 'Contracts',
      calendar: 'Calendar',
      reports: 'Reports',
      notifications: 'Notifications',
      tour: 'Take a Tour',
      tutorial: 'Tutorial Video',
      logout: 'Logout',
      welcome: 'Welcome'
    }
  };

  const currentT = t[language];

  const navItems = [
    { name: 'Dashboard', icon: Home, label: currentT.dashboard },
    { name: 'Owners', icon: Users, label: currentT.owners },
    { name: 'Units', icon: Building2, label: currentT.units },
    { name: 'Vehicles', icon: Car, label: currentT.vehicles },
    { name: 'Tenants', icon: UserCheck, label: currentT.tenants },
    { name: 'Contracts', icon: FileText, label: currentT.contracts },
    { name: 'Calendar', icon: Calendar, label: currentT.calendar },
    { name: 'Reports', icon: BarChart3, label: currentT.reports },
    { name: 'Notifications', icon: Bell, label: currentT.notifications },
  ];

  return (
    <div dir={language === 'ar' ? 'rtl' : 'ltr'} className="min-h-screen bg-gray-50">
      {/* Modern CSS */}
      <style>{`
        :root {
          --primary: #1e3a5f;
          --primary-light: #2d5a8a;
          --accent: #d4af37;
        }
        .sidebar-gradient {
          background: linear-gradient(180deg, #1e3a5f 0%, #15304f 100%);
        }
        .nav-item-active {
          background: rgba(255,255,255,0.15);
          border-right: 4px solid #d4af37;
        }
      `}</style>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
        <div className="flex items-center justify-between px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-6 w-6" />
          </Button>
          <h1 className="text-lg font-bold text-primary">{currentT.appName}</h1>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={toggleLanguage}>
              <Globe className="h-5 w-5" />
            </Button>
            <Link to="/notifications" className="relative">
              <Bell className="h-6 w-6" />
              {notifications.length > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-red-500 text-white">
                  {notifications.length}
                </Badge>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 ${language === 'ar' ? 'right-0' : 'left-0'} h-full w-72 sidebar-gradient text-white z-50 transform transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : language === 'ar' ? 'translate-x-full' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#d4af37] flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-[#1e3a5f]" />
                </div>
                <div>
                  <h1 className="font-bold text-lg">{currentT.appName}</h1>
                  <p className="text-xs text-white/60">v2.0</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} className="lg:hidden text-white">
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPageName === item.name;
              return (
                <Link
                  key={item.name}
                  to={`/${item.name.toLowerCase()}`}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive ? 'nav-item-active' : 'hover:bg-white/10'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                  {item.name === 'Notifications' && notifications.length > 0 && (
                    <Badge className={`${language === 'ar' ? 'mr-auto' : 'ml-auto'} bg-red-500`}>
                      {notifications.length}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          {user && (
            <div className="p-4 border-t border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-[#d4af37]/20 flex items-center justify-center">
                  <span className="text-[#d4af37] font-bold">
                    {user.email?.[0].toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.email}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="w-full justify-start text-white/80 hover:text-white hover:bg-white/10"
                >
                  <LogOut className={`h-4 w-4 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                  {currentT.logout}
                </Button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className={`${language === 'ar' ? 'lg:mr-72' : 'lg:ml-72'} pt-16 lg:pt-0 min-h-screen`}>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}