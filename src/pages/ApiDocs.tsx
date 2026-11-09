import React, { useState } from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import {
  Code2,
  Copy,
  Check,
  Webhook,
  KeyRound,
  ExternalLink
} from 'lucide-react';

export const ApiDocs: React.FC = () => {
  const [selectedLang, setSelectedLang] = useState<'curl' | 'js' | 'python'>('curl');
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('overview');

  const rawBase = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const apiBaseUrl = rawBase.endsWith('/api/v1') ? rawBase : `${rawBase.replace(/\/+$/, '')}/api/v1`;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const navItems = [
    { id: 'overview', label: 'Overview & Base URL' },
    { id: 'auth', label: 'Authentication' },
    { id: 'explore-events', label: 'Explore Events API' },
    { id: 'event-details', label: 'Event Details by Slug' },
    { id: 'organizer-events', label: 'Organizer Event Management' },
    { id: 'create-event', label: 'Create & Publish Event' },
    { id: 'webhooks', label: 'Webhooks & Events' },
    { id: 'rate-limits', label: 'Rate Limits & Errors' }
  ];

  const codeSnippets = {
    exploreEvents: {
      curl: `curl -X GET "${apiBaseUrl}/explore/events?page=1&per_page=12" \\
  -H "Accept: application/json"`,
      js: `const response = await fetch('${apiBaseUrl}/explore/events?page=1', {
  headers: {
    'Accept': 'application/json'
  }
});
const data = await response.json();
console.log(data.data);`,
      python: `import requests

res = requests.get('${apiBaseUrl}/explore/events', params={'page': 1})
events = res.json()['data']
print(f"Retrieved {len(events)} events")`
    },
    organizerEvents: {
      curl: `curl -X GET "${apiBaseUrl}/organizers/{organizerUuid}/events" \\
  -H "Authorization: Bearer YOUR_API_TOKEN" \\
  -H "Accept: application/json"`,
      js: `const response = await fetch('${apiBaseUrl}/organizers/{organizerUuid}/events', {
  headers: {
    'Authorization': 'Bearer YOUR_API_TOKEN',
    'Accept': 'application/json'
  }
});
const events = await response.json();`,
      python: `import requests

headers = {'Authorization': 'Bearer YOUR_API_TOKEN'}
res = requests.get('${apiBaseUrl}/organizers/{organizerUuid}/events', headers=headers)
print(res.json())`
    },
    createEvent: {
      curl: `curl -X POST "${apiBaseUrl}/organizers/{organizerUuid}/events" \\
  -H "Authorization: Bearer YOUR_API_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Cloud Native Summit 2026",
    "description": "Annual dev infrastructure conference.",
    "venueName": "Convention Centre, Victoria Island",
    "city": "Lagos",
    "startDate": "2026-11-20",
    "startTime": "09:00",
    "endDate": "2026-11-21",
    "endTime": "18:00",
    "status": "draft"
  }'`,
      js: `const response = await fetch('${apiBaseUrl}/organizers/{organizerUuid}/events', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'Cloud Native Summit 2026',
    venueName: 'Convention Centre, Victoria Island',
    city: 'Lagos',
    startDate: '2026-11-20',
    startTime: '09:00',
    status: 'draft'
  })
});
const newEvent = await response.json();`,
      python: `import requests

headers = {
    'Authorization': 'Bearer YOUR_API_TOKEN',
    'Content-Type': 'application/json'
}
payload = {
    'title': 'Cloud Native Summit 2026',
    'venueName': 'Convention Centre, Victoria Island',
    'city': 'Lagos',
    'startDate': '2026-11-20',
    'startTime': '09:00',
    'status': 'draft'
}
res = requests.post('${apiBaseUrl}/organizers/{organizerUuid}/events', json=payload, headers=headers)
print(res.json())`
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070709] text-zinc-900 dark:text-white flex flex-col justify-between selection:bg-[#E31B23] selection:text-white transition-colors duration-300">
      <Navbar />

      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-12 xl:px-16 2xl:px-20 max-w-[1600px] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Sidebar Nav */}
          <div className="lg:col-span-3">
            <div className="sticky top-28 space-y-6 bg-white dark:bg-zinc-950/70 border border-zinc-200 dark:border-white/10 rounded-3xl p-6 shadow-sm dark:shadow-none backdrop-blur-md">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-bold">API Navigation</span>
                <h3 className="text-base font-bold text-zinc-950 dark:text-white">Documentation</h3>
              </div>

              <nav className="space-y-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveSection(item.id);
                      document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeSection === item.id
                        ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-md font-black'
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/[0.05] hover:text-zinc-950 dark:hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>

              <div className="pt-4 border-t border-zinc-200 dark:border-white/10 space-y-2.5">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-[#E31B23] transition-colors"
                >
                  <span>OpenAPI 3.1 Spec</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <a
                  href="https://postman.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-[#E31B23] transition-colors"
                >
                  <span>Postman Collection</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-9 space-y-14">
            {/* Header */}
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-200/80 dark:bg-white/5 border border-zinc-300 dark:border-white/10 text-zinc-900 dark:text-white text-xs font-bold">
                <Code2 className="w-3.5 h-3.5 text-[#E31B23]" />
                StraytTix Developer Platform
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-950 dark:text-white tracking-tight">
                REST API Documentation
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base leading-relaxed max-w-3xl font-normal">
                Integrate programmatic event discovery, automate ticket tier management, register attendee webhooks, and deploy custom checkout drawers directly into your own applications.
              </p>
            </div>

            {/* Language Switcher Bar */}
            <div className="flex items-center justify-between bg-white dark:bg-zinc-950/70 border border-zinc-200 dark:border-white/10 rounded-2xl p-2 px-4 shadow-sm dark:shadow-lg backdrop-blur-sm">
              <span className="text-xs font-mono font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">Example Language:</span>
              <div className="flex items-center gap-1.5">
                {(['curl', 'js', 'python'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setSelectedLang(lang)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedLang === lang
                        ? 'bg-[#E31B23] text-white shadow-md shadow-[#E31B23]/30'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/[0.05]'
                    }`}
                  >
                    {lang === 'curl' ? 'cURL' : lang === 'js' ? 'Node.js / Fetch' : 'Python'}
                  </button>
                ))}
              </div>
            </div>

            {/* Section 1: Overview */}
            <section id="overview" className="space-y-4 pt-2">
              <h2 className="text-2xl font-bold text-zinc-950 dark:text-white tracking-tight">Overview & Base URL</h2>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
                The StraytTix API is organized around REST. All requests communicate over HTTPS and respond with standard JSON bodies and HTTP status codes.
              </p>

              <div className="bg-zinc-950 border border-zinc-800 dark:border-white/10 rounded-2xl p-4 text-white flex items-center justify-between font-mono text-xs shadow-md">
                <div>
                  <span className="text-zinc-500">BASE URL: </span>
                  <span className="text-emerald-400 font-bold">{apiBaseUrl}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(apiBaseUrl, 'base_url')}
                  className="p-1.5 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white cursor-pointer transition-colors"
                  title="Copy Base URL"
                >
                  {copiedIndex === 'base_url' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </section>

            {/* Section 2: Authentication */}
            <section id="auth" className="space-y-4 pt-8 border-t border-zinc-200 dark:border-white/10">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-[#E31B23]" />
                <h2 className="text-2xl font-bold text-zinc-950 dark:text-white tracking-tight">Authentication</h2>
              </div>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
                Authenticated endpoints require an API Bearer Token passed in the HTTP Authorization header. You can generate API tokens inside your Organizer Settings dashboard under <strong>API Keys</strong>.
              </p>

              <div className="bg-zinc-950 border border-zinc-800 dark:border-white/10 rounded-2xl p-4 font-mono text-xs text-white">
                <span className="text-zinc-500">Authorization: </span>
                <span className="text-amber-400">Bearer eos_live_9f83829ad01b489aef</span>
              </div>
            </section>

            {/* Section 3: Explore Events API */}
            <section id="explore-events" className="space-y-4 pt-8 border-t border-zinc-200 dark:border-white/10">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-black">GET</span>
                    <span className="font-mono text-xs sm:text-sm font-bold text-zinc-950 dark:text-white">/v1/explore/events</span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 font-normal">List public published events with pagination and filters.</p>
                </div>
                <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Public</span>
              </div>

              {/* Code display */}
              <div className="relative bg-zinc-950 border border-white/10 rounded-2xl overflow-hidden shadow-lg">
                <div className="flex items-center justify-between px-4 py-2.5 bg-white/[0.03] border-b border-white/10 text-xs text-zinc-400 font-mono">
                  <span>Example Request ({selectedLang})</span>
                  <button
                    onClick={() => copyToClipboard(codeSnippets.exploreEvents[selectedLang], 'explore')}
                    className="flex items-center gap-1 hover:text-white cursor-pointer transition-colors"
                  >
                    {copiedIndex === 'explore' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedIndex === 'explore' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-4 text-xs font-mono text-zinc-300 overflow-x-auto leading-relaxed">
                  {codeSnippets.exploreEvents[selectedLang]}
                </pre>
              </div>

              {/* Sample Response */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider font-mono">Response: 200 OK</span>
                <pre className="bg-zinc-950/80 text-zinc-300 p-4 rounded-2xl font-mono text-xs overflow-x-auto border border-white/10">
{`{
  "events": [
    {
      "id": 1,
      "uuid": "evt_98319f02a",
      "slug": "lagos-tech-fest-2026",
      "title": "Lagos Tech Fest 2026",
      "location": "Landmark Centre, VI",
      "price": 0,
      "category": "Technology",
      "status": "published",
      "cover_image": "https://images.unsplash.com/photo-1540575467063...",
      "organizer": {
        "name": "Acme Live",
        "slug": "acme-live",
        "is_verified": true
      }
    }
  ],
  "pagination": {
    "total": 48,
    "current_page": 1,
    "per_page": 12
  }
}`}
                </pre>
              </div>
            </section>

            {/* Section 4: Event Details by Slug */}
            <section id="event-details" className="space-y-4 pt-8 border-t border-zinc-200 dark:border-white/10">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-black">GET</span>
                  <span className="font-mono text-xs sm:text-sm font-bold text-zinc-950 dark:text-white">/v1/explore/events/{'{slug}'}</span>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 font-normal">Retrieve rich event profile including active ticket tiers and organizer badges.</p>
              </div>

              <div className="bg-zinc-950 border border-zinc-800 dark:border-white/10 rounded-2xl p-4 font-mono text-xs text-white">
                <span className="text-zinc-500">curl -X GET </span>
                <span className="text-emerald-400">https://api.strayttix.live/v1/explore/events/lagos-tech-fest-2026</span>
              </div>
            </section>

            {/* Section 5: Organizer Events */}
            <section id="organizer-events" className="space-y-4 pt-8 border-t border-zinc-200 dark:border-white/10">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md bg-indigo-500/15 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 text-xs font-mono font-black">GET</span>
                    <span className="font-mono text-xs sm:text-sm font-bold text-zinc-950 dark:text-white">/v1/organizers/{'{organizerUuid}'}/events</span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 font-normal">List all events managed by this organizer team, including drafts and sales statistics.</p>
                </div>
                <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/30 uppercase tracking-wider font-mono">
                  Bearer Auth
                </span>
              </div>

              <div className="relative bg-zinc-950 border border-zinc-800 dark:border-white/10 rounded-2xl overflow-hidden shadow-lg">
                <div className="flex items-center justify-between px-4 py-2.5 bg-white/[0.03] border-b border-white/10 text-xs text-zinc-400 font-mono">
                  <span>Example Request ({selectedLang})</span>
                  <button
                    onClick={() => copyToClipboard(codeSnippets.organizerEvents[selectedLang], 'org_events')}
                    className="flex items-center gap-1 hover:text-white cursor-pointer transition-colors"
                  >
                    {copiedIndex === 'org_events' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedIndex === 'org_events' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-4 text-xs font-mono text-zinc-300 overflow-x-auto leading-relaxed">
                  {codeSnippets.organizerEvents[selectedLang]}
                </pre>
              </div>
            </section>

            {/* Section 6: Create Event */}
            <section id="create-event" className="space-y-4 pt-8 border-t border-zinc-200 dark:border-white/10">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-mono font-black">POST</span>
                    <span className="font-mono text-xs sm:text-sm font-bold text-zinc-950 dark:text-white">/v1/organizers/{'{organizerUuid}'}/events</span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 font-normal">Create a new event record with multi-tier ticket definitions.</p>
                </div>
                <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/30 uppercase tracking-wider font-mono">
                  Bearer Auth
                </span>
              </div>

              <div className="relative bg-zinc-950 border border-zinc-800 dark:border-white/10 rounded-2xl overflow-hidden shadow-lg">
                <div className="flex items-center justify-between px-4 py-2.5 bg-white/[0.03] border-b border-white/10 text-xs text-zinc-400 font-mono">
                  <span>Example Request ({selectedLang})</span>
                  <button
                    onClick={() => copyToClipboard(codeSnippets.createEvent[selectedLang], 'create_event')}
                    className="flex items-center gap-1 hover:text-white cursor-pointer transition-colors"
                  >
                    {copiedIndex === 'create_event' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedIndex === 'create_event' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-4 text-xs font-mono text-zinc-300 overflow-x-auto leading-relaxed">
                  {codeSnippets.createEvent[selectedLang]}
                </pre>
              </div>
            </section>

            {/* Section 7: Webhooks */}
            <section id="webhooks" className="space-y-4 pt-8 border-t border-zinc-200 dark:border-white/10">
              <div className="flex items-center gap-2">
                <Webhook className="w-5 h-5 text-[#E31B23]" />
                <h2 className="text-2xl font-bold text-zinc-950 dark:text-white tracking-tight">Real-Time Webhooks</h2>
              </div>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
                Subscribe to real-time HTTPS callbacks whenever transactions occur. Every webhook payload is signed with a secret HMAC SHA-256 header (<code className="text-[#E31B23]">X-StraytTix-Signature</code>) for tamper verification.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-zinc-950/70 border border-zinc-200 dark:border-white/10 p-5 rounded-2xl space-y-1.5 shadow-xs dark:shadow-none backdrop-blur-sm">
                  <code className="text-xs font-bold text-emerald-600 dark:text-emerald-400">order.completed</code>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400 font-normal">Triggered immediately when customer payment clears.</p>
                </div>
                <div className="bg-white dark:bg-zinc-950/70 border border-zinc-200 dark:border-white/10 p-5 rounded-2xl space-y-1.5 shadow-xs dark:shadow-none backdrop-blur-sm">
                  <code className="text-xs font-bold text-indigo-600 dark:text-indigo-400">ticket.scanned</code>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400 font-normal">Triggered at the venue gate when attendee QR code is validated.</p>
                </div>
                <div className="bg-white dark:bg-zinc-950/70 border border-zinc-200 dark:border-white/10 p-5 rounded-2xl space-y-1.5 shadow-xs dark:shadow-none backdrop-blur-sm">
                  <code className="text-xs font-bold text-amber-600 dark:text-amber-400">event.published</code>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400 font-normal">Triggered when an organizer transitions an event to live.</p>
                </div>
              </div>
            </section>

            {/* Section 8: Rate Limits & Errors */}
            <section id="rate-limits" className="space-y-4 pt-8 border-t border-zinc-200 dark:border-white/10">
              <h2 className="text-2xl font-bold text-zinc-950 dark:text-white tracking-tight">Rate Limits & Errors</h2>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
                The standard API tier permits <strong>60 requests per minute</strong>. Enterprise tiers support up to <strong>100,000 requests per minute</strong> with dedicated IP peering.
              </p>

              <div className="bg-white dark:bg-zinc-950/80 border border-zinc-200 dark:border-white/10 rounded-2xl overflow-hidden text-xs shadow-sm dark:shadow-xl">
                <table className="w-full text-left">
                  <thead className="bg-zinc-100 dark:bg-white/[0.04] border-b border-zinc-200 dark:border-white/10 text-zinc-950 dark:text-white font-bold">
                    <tr>
                      <th className="p-3.5">HTTP Code</th>
                      <th className="p-3.5">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-white/5 text-zinc-700 dark:text-zinc-300 font-normal">
                    <tr>
                      <td className="p-3.5 font-mono font-bold text-emerald-600 dark:text-emerald-400">200 OK</td>
                      <td className="p-3.5">Request processed successfully.</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 font-mono font-bold text-amber-600 dark:text-amber-400">401 Unauthorized</td>
                      <td className="p-3.5">Invalid or missing API Bearer token.</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 font-mono font-bold text-amber-600 dark:text-amber-400">403 Forbidden</td>
                      <td className="p-3.5">Your organizer role does not have permission for this action.</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 font-mono font-bold text-[#E31B23]">429 Rate Limited</td>
                      <td className="p-3.5">Exceeded request threshold. Inspect the Retry-After header.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ApiDocs;
