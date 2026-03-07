import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { base44 } from '@/api/base44Client';
import {
  Home,
  Users,
  Building2,
  UserCheck,
  FileText,
  Calendar,
  Bell,
  FileDown,
  Menu,
  X,
  LogOut,
  ChevronLeft,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function Layout({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadNotifications();
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
    } catch (e) {
      console.log('User not logged in');
    }
  };

  const loadNotifications = async () => {
    try {
      const data = await base44.entities.Notification.filter({ is_read: false });
      setNotifications(data);
    } catch (e) {
      console.log(e);
    }
  };

  const navItems = [
    { name: 'Dashboard', label: 'لوحة التحكم', icon: Home },
    { name: 'Owners', label: 'الملاك', icon: Users },
    { name: 'Units', label: 'الوحدات', icon: Building2 },
    { name: 'Tenants', label: 'المستأجرين', icon: UserCheck },
    { name: 'Contracts', label: 'العقود', icon: FileText },
    { name: 'ContractTemplates', label: 'نماذج العقود', icon: FileDown },
    { name: 'ContractCalendar', label: 'التقويم', icon: Calendar },
    { name: 'Reports', label: 'التقارير', icon: BarChart3 },
    { name: 'Notifications', label: 'الإشعارات', icon: Bell },
  ];

  const handleLogout = () => {
    base44.auth.logout();
  };

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50">
      <style>{`
        :root {
          --primary: #1e3a5f;
          --primary-light: #2d5a8a;
          --accent: #d4af37;
          --accent-light: #e8c861;
        }
        .gradient-primary {
          background: linear-gradient(135deg, #1e3a5f 0%, #2d5a8a 100%);
        }
        .text-primary { color: #1e3a5f; }
        .bg-primary { background-color: #1e3a5f; }
        .text-accent { color: #d4af37; }
        .bg-accent { background-color: #d4af37; }
        .border-accent { border-color: #d4af37; }
      `}</style>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 gradient-primary text-white shadow-lg">
        <div className="flex items-center justify-between px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="text-white hover:bg-white/10"
          >
            <Menu className="h-6 w-6" />
          </Button>
          <h1 className="text-lg font-bold">نظام إدارة العقارات</h1>
          <Link to={createPageUrl('Notifications')} className="relative">
            <Bell className="h-6 w-6" />
            {notifications.length > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-red-500">
                {notifications.length}
              </Badge>
            )}
          </Link>
        </div>
      </header>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 right-0 h-full w-72 gradient-primary text-white z-50 transform transition-transform duration-300 ease-in-out",
          "lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="font-bold text-lg">إدارة العقارات</h1>
                  <p className="text-xs text-white/60">نظام الإيجارات</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-white hover:bg-white/10"
              >
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
                  to={createPageUrl(item.name)}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                    isActive
                      ? "bg-white text-primary shadow-lg"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <Icon className={cn("h-5 w-5", isActive && "text-accent")} />
                  <span className="font-medium">{item.label}</span>
                  {item.name === 'Notifications' && notifications.length > 0 && (
                    <Badge className="mr-auto bg-red-500 text-white">
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
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                  <span className="text-accent font-bold">
                    {user.full_name?.[0] || user.email?.[0] || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.full_name || 'مستخدم'}</p>
                  <p className="text-xs text-white/60 truncate">{user.email}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="w-full justify-start text-white/80 hover:text-white hover:bg-white/10"
              >
                <LogOut className="h-4 w-4 ml-2" />
                تسجيل الخروج
              </Button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:mr-72 min-h-screen">
        <div className="pt-16 lg:pt-0">
          {children}
        </div>
      </main>
    </div>
  );
}