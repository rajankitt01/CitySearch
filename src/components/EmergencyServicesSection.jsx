import React from 'react';
import { 
  PhoneCall, 
  ShieldAlert, 
  Stethoscope, 
  Flame, 
  AlertTriangle, 
  HeartPulse,
  Users
} from 'lucide-react';

const EMERGENCY_NUMBERS = [
  {
    number: '112',
    name: 'National Emergency Support (ERSS)',
    desc: 'Unified all-in-one 24x7 emergency response for Police, Fire, and Ambulance',
    icon: PhoneCall,
    color: 'rose',
    badge: 'Primary 24/7'
  },
  {
    number: '100',
    name: 'Police Control Room',
    desc: 'Immediate law enforcement and police emergency assistance',
    icon: ShieldAlert,
    color: 'amber',
    badge: 'Police'
  },
  {
    number: '101',
    name: 'Fire Service',
    desc: 'Fire rescue, containment, and disaster response dispatch',
    icon: Flame,
    color: 'orange',
    badge: 'Fire'
  },
  {
    number: '108',
    name: 'Emergency Medical & Ambulance',
    desc: '24x7 Emergency medical response and patient transport',
    icon: HeartPulse,
    color: 'emerald',
    badge: 'Ambulance'
  },
  {
    number: '1091',
    name: 'Women Helpline',
    desc: '24-hour emergency counseling and distress assistance for women',
    icon: Users,
    color: 'purple',
    badge: 'Women Safety'
  },
  {
    number: '1098',
    name: 'Childline Helpline',
    desc: 'Emergency child protection, care and rescue helpline',
    icon: Users,
    color: 'blue',
    badge: 'Child Helpline'
  }
];

export function EmergencyServicesSection({ onSelectCategory }) {
  return (
    <div id="emergency-section" className="w-full rounded-3xl bg-gradient-to-br from-rose-500/10 via-slate-50 to-amber-500/10 dark:from-rose-950/30 dark:via-slate-900 dark:to-amber-950/20 border border-rose-200/80 dark:border-rose-900/60 p-6 sm:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-rose-200/60 dark:border-rose-900/40">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-600 text-white flex items-center gap-1.5">
              <PhoneCall className="w-3.5 h-3.5 animate-pulse" />
              Emergency Services
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              National Verified Helplines
            </span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Quick Emergency Contacts & Facilities
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Instant dial official emergency dispatchers or locate verified nearby emergency facilities on the map.
          </p>
        </div>

        {/* Quick jump to map facilities */}
        {onSelectCategory && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onSelectCategory('healthcare')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 hover:bg-rose-50 shadow-sm transition-all"
            >
              <Stethoscope className="w-4 h-4 text-rose-600" />
              <span>Map Hospitals</span>
            </button>
            <button
              onClick={() => onSelectCategory('public_safety')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900 hover:bg-amber-50 shadow-sm transition-all"
            >
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>Map Police Stations</span>
            </button>
          </div>
        )}
      </div>

      {/* Emergency Phone Helplines Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {EMERGENCY_NUMBERS.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.number}
              className="relative rounded-2xl bg-white dark:bg-slate-900 p-4 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center gap-1">
                    <Icon className="w-3 h-3 text-rose-500" />
                    {item.badge}
                  </span>
                  <a
                    href={`tel:${item.number}`}
                    className="flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline"
                  >
                    <span>Tap to Call</span>
                  </a>
                </div>

                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 font-extrabold text-lg">
                    {item.number}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                      {item.name}
                    </h4>
                  </div>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {item.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] font-mono font-semibold text-slate-400">
                  Toll-Free Dial: {item.number}
                </span>
                <a
                  href={`tel:${item.number}`}
                  className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors"
                >
                  Call Now
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mandatory Disclaimer & Verified Source Attribution */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">
            Important Informational Notice & Disclaimer:
          </p>
          <p className="mt-0.5 opacity-90 leading-relaxed">
            Emergency contact numbers and mapped facility data are compiled for general public reference and awareness. This platform is not a replacement for official state emergency dispatch systems. In any life-threatening situation or active crime, immediately dial <strong>112</strong> or your local jurisdiction's emergency line.
          </p>
          <p className="mt-1 text-[11px] opacity-75">
            Verified Source: Emergency Response Support System (ERSS), Ministry of Home Affairs, Government of India (112.gov.in).
          </p>
        </div>
      </div>
    </div>
  );
}
