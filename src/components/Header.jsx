import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Bookmark, 
  PhoneCall, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  MessageSquareHeart,
  Compass
} from 'lucide-react';
import { storage } from '../utils/storage.js';

export function Header({
  favoritesCount = 0,
  onOpenFavorites,
  onOpenEmergency,
  onOpenFeedback,
  onGoHome,
  currentCityName = null
}) {
  const [theme, setTheme] = useState(() => storage.getTheme());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    storage.setTheme(newTheme);
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            onClick={onGoHome}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <Compass className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-slate-900 via-brand-900 to-indigo-900 dark:from-white dark:via-brand-200 dark:to-indigo-200 bg-clip-text text-transparent">
                  CitySearch
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                  Live
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
                City Discovery Platform
              </p>
            </div>
          </div>

          {/* Current City indicator if active */}
          {currentCityName && (
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              <MapPin className="w-3.5 h-3.5 text-brand-500" />
              <span>Exploring: <strong className="text-slate-900 dark:text-white">{currentCityName}</strong></span>
            </div>
          )}

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={onGoHome}
              className="px-3.5 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Explore
            </button>

            <button
              onClick={onOpenEmergency}
              className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors border border-rose-200/60 dark:border-rose-900/60"
            >
              <PhoneCall className="w-4 h-4 animate-pulse" />
              <span>Emergency 112</span>
            </button>

            <button
              onClick={onOpenFavorites}
              className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
            >
              <Bookmark className="w-4 h-4 text-amber-500" />
              <span>Saved Places</span>
              {favoritesCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 text-[11px] font-bold rounded-full bg-amber-500 text-white">
                  {favoritesCount}
                </span>
              )}
            </button>

            <button
              onClick={onOpenFeedback}
              className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Share Feedback"
              aria-label="Share Feedback"
            >
              <MessageSquareHeart className="w-4 h-4" />
            </button>

            <div className="h-5 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1" />

            {/* Dark mode toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-slate-700 hover:text-brand-600 transition-colors" />
              ) : (
                <Sun className="w-5 h-5 text-amber-400 hover:text-amber-300 transition-colors" />
              )}
            </button>
          </div>

          {/* Mobile buttons */}
          <div className="flex md:hidden items-center gap-1.5">
            <button
              onClick={onOpenEmergency}
              className="p-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg"
              title="Emergency"
              aria-label="Emergency Services"
            >
              <PhoneCall className="w-5 h-5" />
            </button>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-amber-400" />}
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 pt-3 pb-5 space-y-2">
          {currentCityName && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 mb-2">
              <MapPin className="w-4 h-4 text-brand-500 shrink-0" />
              <span>Current City: {currentCityName}</span>
            </div>
          )}

          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              onGoHome();
            }}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between"
          >
            <span>Explore Cities</span>
            <Compass className="w-4 h-4 text-brand-500" />
          </button>

          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              onOpenFavorites();
            }}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-amber-500" />
              <span>Saved Places</span>
            </div>
            {favoritesCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-500 text-white">
                {favoritesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              onOpenEmergency();
            }}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center justify-between border border-rose-200 dark:border-rose-900/50"
          >
            <div className="flex items-center gap-2">
              <PhoneCall className="w-4 h-4" />
              <span>Emergency Services (112)</span>
            </div>
            <span className="text-xs font-bold uppercase tracking-wider">Fast Call</span>
          </button>

          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              onOpenFeedback();
            }}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
          >
            <MessageSquareHeart className="w-4 h-4 text-brand-500" />
            <span>Send App Feedback</span>
          </button>
        </div>
      )}
    </header>
  );
}
