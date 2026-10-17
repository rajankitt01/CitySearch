import React from 'react';
import { Compass, ExternalLink, ShieldCheck } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                <Compass className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
                CitySearch
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              Complete, verified city discovery platform helping citizens, travelers, and students explore vital public infrastructure, emergency centers, transit, and cultural landmarks using 100% open real-world geographic data.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Real data guarantee — No synthetic or invented places</span>
            </div>
          </div>

          {/* Attribution & Providers */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Data Attribution
            </h4>
            <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1.5">
              <li>
                <a
                  href="https://www.openstreetmap.org/copyright"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-brand-600 dark:hover:text-brand-400 inline-flex items-center gap-1"
                >
                  <span>© OpenStreetMap contributors</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </li>
              <li>
                <a
                  href="https://leafletjs.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-brand-600 dark:hover:text-brand-400 inline-flex items-center gap-1"
                >
                  <span>Leaflet Interactive Maps</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </li>
              <li>
                <a
                  href="https://overpass-turbo.eu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-brand-600 dark:hover:text-brand-400 inline-flex items-center gap-1"
                >
                  <span>Overpass API Engine</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </li>
              <li>
                <a
                  href="https://nominatim.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-brand-600 dark:hover:text-brand-400 inline-flex items-center gap-1"
                >
                  <span>Nominatim Geocoding</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </li>
            </ul>
          </div>

          {/* Quick Legal & Emergency */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Guidelines & Safety
            </h4>
            <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1.5">
              <li>
                <span className="text-slate-400">Emergency Dispatch: Call 112</span>
              </li>
              <li>
                <span className="text-slate-400">ODbL 1.0 Open Data License</span>
              </li>
              <li>
                <span className="text-slate-400">Privacy: Zero tracking / No GPS stored</span>
              </li>
              <li>
                <span className="text-slate-400">Local Cache: 15-min TTL rate-limit protection</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p>
            CitySearch Discovery Platform. Built for open city transparency.
          </p>
          <div className="flex items-center gap-1">
            <span>Crafted with real geographic data</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
