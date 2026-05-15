import { useState } from 'react';
import { Outlet, Link, Navigate, useLocation } from 'react-router';
import { Sun, Home, Clock, Map as MapIcon, User, Menu, X } from 'lucide-react';
import { motion } from 'motion/react';
import { isAuthenticated } from './core/api';

export function Background() {
  return (
    <div className="fixed inset-0 pointer-events-none -z-10 bg-[linear-gradient(180deg,#fff7ed_0%,#f8fafc_45%,#f1f5f9_100%)]" />
  );
}

export function AppHeader() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const navItems = [
    { path: '/app', icon: Home, label: 'Dashboard' },
    { path: '/app/history', icon: Clock, label: 'History' },
    { path: '/app/map', icon: MapIcon, label: 'Map' },
    { path: '/app/profile', icon: User, label: 'Profile' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-[1200] bg-white/70 backdrop-blur-xl border-b border-white/40 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        <Link to="/app" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-yellow-400 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Sun className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent tracking-tight">
            SYNAR
          </h1>
        </Link>
        <nav aria-label="Primary navigation" className="hidden md:flex gap-6 text-sm font-bold text-slate-500">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path} aria-current={location.pathname === item.path ? 'page' : undefined} className={`hover:text-orange-500 transition-colors ${location.pathname === item.path ? 'text-orange-500' : ''}`}>{item.label}</Link>
          ))}
        </nav>
        <button onClick={() => setMenuOpen((value) => !value)} className="md:hidden w-10 h-10 rounded-xl bg-orange-50 text-orange-600 border border-orange-100 flex items-center justify-center" aria-label="Open navigation menu">
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>
      {menuOpen && (
        <motion.nav aria-label="Mobile navigation" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="md:hidden relative z-[1201] max-w-5xl mx-auto px-4 pb-4">
          <div className="rounded-2xl bg-white border border-slate-100 shadow-xl overflow-hidden">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path} aria-current={isActive ? 'page' : undefined} onClick={() => setMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 font-bold border-b border-slate-100 last:border-b-0 ${isActive ? 'text-orange-500 bg-orange-50' : 'text-slate-600'}`}>
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </motion.nav>
      )}
    </header>
  );
}

export function PublicLayout() {
  const location = useLocation();
  const authPages = ['/login', '/register', '/forgot-password'];

  if (isAuthenticated() && authPages.includes(location.pathname)) {
    return <Navigate to="/app" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 selection:bg-orange-200 overflow-x-hidden relative">
      <Background />
      <header className="fixed top-0 left-0 right-0 z-[1200] bg-white/50 backdrop-blur-xl border-b border-white/40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-400 to-yellow-400 flex items-center justify-center">
              <Sun className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">SYNAR</h1>
          </Link>
          <nav aria-label="Account navigation" className="flex gap-4">
            <Link to="/login" className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-orange-500 transition-colors">Log In</Link>
            <Link to="/register" className="px-4 py-2 text-sm font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-colors shadow-md shadow-orange-500/20">Sign Up</Link>
          </nav>
        </div>
      </header>
      <div className="pt-16">
        <Outlet />
      </div>
    </div>
  );
}

export function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 selection:bg-orange-200 overflow-x-hidden relative">
      <Background />
      <AppHeader />
      <main className="max-w-5xl mx-auto px-4 pt-24 pb-6 md:pt-28 md:pb-8">
        <Outlet />
      </main>
    </div>
  );
}

export function RequireAuth() {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
