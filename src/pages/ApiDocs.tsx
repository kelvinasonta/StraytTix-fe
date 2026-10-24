import React, { useState } from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import {
  Code2,
  Terminal,
  Copy,
  Check,
  Webhook,
  KeyRound,
  Layers,
  ArrowRight,
  Sparkles,
  Search,
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
    startDate: '2026-11-20',
    status: 'draft'
  })
});
const newEvent = await response.json();`,
      python: `import requests

payload = {
    "title": "Cloud Native Summit 2026",
    "venueName": "Convention Centre, Victoria Island",
    "startDate": "2026-11-20",
    "status": "draft"
}
res = requests.post(
    '${apiBaseUrl}/organizers/{organizerUuid}/events',
    headers={'Authorization': 'Bearer YOUR_API_TOKEN'},
    json=payload
)
print(res.json())`
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Navigation Sidebar */}
          <div className="lg:col-span-3">
            <div className="sticky top-24 space-y-6 bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-50 text-[#E31B23] text-[11px] font-black uppercase tracking-wider">
                  <Terminal className="w-3.5 h-3.5" />
                  REST API v1
                </div>
                <h3 className="text-sm font-bold text-zinc-900 pt-1">Developer Reference</h3>
              </div>

              <nav className="space-y-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveSection(item.id);
                      document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      activeSection === item.id
                        ? 'bg-zinc-950 text-white shadow-xs'
                        : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>

              <div className="pt-4 border-t border-zinc-100 space-y-2">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between text-xs font-bold text-zinc-600 hover:text-[#E31B23]"
                >
                  <span>OpenAPI 3.1 Spec</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <a
                  href="https://postman.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between text-xs font-bold text-zinc-600 hover:text-[#E31B23]"
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
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 text-white text-xs font-bold">
                <Code2 className="w-3.5 h-3.5 text-[#E31B23]" />
                eventsOs Developer Platform
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-zinc-950 tracking-tight">
                REST API Documentation
              </h1>
              <p className="text-zinc-600 text-sm leading-relaxed max-w-3xl font-medium">
                Integrate programmatic event discovery, automate ticket tier management, register attendee webhooks, and deploy custom checkout drawers directly into your own applications.
              </p>
            </div>

            {/* Language Switcher Bar */}
            <div className="flex items-center justify-between bg-white border border-zinc-200 rounded-2xl p-2 px-4 shadow-xs">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Example Language:</span>
              <div className="flex items-center gap-1.5">
                {(['curl', 'js', 'python'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setSelectedLang(lang)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedLang === lang
                        ? 'bg-[#E31B23] text-white shadow-xs'
                        : 'text-zinc-600 hover:bg-zinc-100'
                    }`}
                  >
                    {lang === 'curl' ? 'cURL' : lang === 'js' ? 'Node.js / Fetch' : 'Python'}
                  </button>
                ))}
              </div>
            </div>

            {/* Section 1: Overview */}
            <section id="overview" className="space-y-4 pt-2">
              <h2 className="text-2xl font-bold text-zinc-950 tracking-tight">Overview & Base URL</h2>
              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-medium">
                The eventsOs API is organized around REST. All requests communicate over HTTPS and respond with standard JSON bodies and HTTP status codes.
              </p>

              <div className="bg-zinc-950 rounded-2xl p-4 text-white flex items-center justify-between font-mono text-xs">
                <div>
                  <span className="text-zinc-500">BASE URL: </span>
                  <span className="text-emerald-400 font-bold">{apiBaseUrl}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(apiBaseUrl, 'base_url')}
                  className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white cursor-pointer"
                  title="Copy Base URL"
                >
                  {copiedIndex === 'base_url' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </section>

            {/* Section 2: Authentication */}
            <section id="auth" className="space-y-4 pt-4 border-t border-zinc-200">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-[#E31B23]" />
                <h2 className="text-2xl font-bold text-zinc-950 tracking-tight">Authentication</h2>
              </div>
              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-medium">
                Authenticated endpoints require an API Bearer Token passed in the HTTP Authorization header. You can generate API tokens inside your Organizer Settings dashboard under <strong>API Keys</strong>.
              </p>

              <div className="bg-zinc-950 rounded-2xl p-4 font-mono text-xs text-white">
                <span className="text-zinc-500">Authorization: </span>
                <span className="text-amber-400">Bearer eos_live_9f83829ad01b489aef</span>
              </div>
            </section>

            {/* Section 3: Explore Events API */}
            <section id="explore-events" className="space-y-4 pt-4 border-t border-zinc-200">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-mono font-black">GET</span>
                    <span className="font-mono text-xs sm:text-sm font-bold text-zinc-900">/v1/explore/events</span>
                  </div>
                  <p className="text-xs text-zinc-500 font-medium">List public published events with pagination and filters.</p>
                </div>
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Public</span>
              </div>

              {/* Code display */}
              <div className="relative bg-zinc-950 rounded-2xl overflow-hidden shadow-sm">
                <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 text-xs text-zinc-400 font-mono">
                  <span>Example Request ({selectedLang})</span>
                  <button
                    onClick={() => copyToClipboard(codeSnippets.exploreEvents[selectedLang], 'explore')}
                    className="flex items-center gap-1 hover:text-white cursor-pointer"
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
                <span className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Response: 200 OK</span>
                <pre className="bg-zinc-900 text-zinc-300 p-4 rounded-2xl font-mono text-xs overflow-x-auto border border-zinc-800">
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
            <section id="event-details" className="space-y-4 pt-4 border-t border-zinc-200">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-mono font-black">GET</span>
                  <span className="font-mono text-xs sm:text-sm font-bold text-zinc-900">/v1/explore/events/{'{slug}'}</span>
                </div>
                <p className="text-xs text-zinc-500 font-medium">Retrieve rich event profile including active ticket tiers and organizer badges.</p>
              </div>

              <div className="bg-zinc-950 rounded-2xl p-4 font-mono text-xs text-white">
                <span className="text-zinc-500">curl -X GET </span>
                <span className="text-emerald-400">https://api.eventsos.live/v1/explore/events/lagos-tech-fest-2026</span>
              </div>
            </section>

            {/* Section 5: Organizer Events */}
            <section id="organizer-events" className="space-y-4 pt-4 border-t border-zinc-200">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-mono font-black">GET</span>
                    <span className="font-mono text-xs sm:text-sm font-bold text-zinc-900">/v1/organizers/{'{organizerUuid}'}/events</span>
                  </div>
                  <p className="text-xs text-zinc-500 font-medium">List all events managed by this organizer team, including drafts and sales statistics.</p>
                </div>
                <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 uppercase tracking-wider">
                  Bearer Auth
                </span>
              </div>

              <div className="relative bg-zinc-950 rounded-2xl overflow-hidden shadow-sm">
                <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 text-xs text-zinc-400 font-mono">
                  <span>Example Request ({selectedLang})</span>
                  <button
                    onClick={() => copyToClipboard(codeSnippets.organizerEvents[selectedLang], 'org_events')}
                    className="flex items-center gap-1 hover:text-white cursor-pointer"
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
            <section id="create-event" className="space-y-4 pt-4 border-t border-zinc-200">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 text-xs font-mono font-black">POST</span>
                    <span className="font-mono text-xs sm:text-sm font-bold text-zinc-900">/v1/organizers/{'{organizerUuid}'}/events</span>
                  </div>
                  <p className="text-xs text-zinc-500 font-medium">Create a new event record with multi-tier ticket definitions.</p>
                </div>
                <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 uppercase tracking-wider">
                  Bearer Auth
                </span>
              </div>

              <div className="relative bg-zinc-950 rounded-2xl overflow-hidden shadow-sm">
                <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 text-xs text-zinc-400 font-mono">
                  <span>Example Request ({selectedLang})</span>
                  <button
                    onClick={() => copyToClipboard(codeSnippets.createEvent[selectedLang], 'create_event')}
                    className="flex items-center gap-1 hover:text-white cursor-pointer"
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
            <section id="webhooks" className="space-y-4 pt-4 border-t border-zinc-200">
              <div className="flex items-center gap-2">
                <Webhook className="w-5 h-5 text-[#E31B23]" />
                <h2 className="text-2xl font-bold text-zinc-950 tracking-tight">Real-Time Webhooks</h2>
              </div>
              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-medium">
                Subscribe to real-time HTTPS callbacks whenever transactions occur. Every webhook payload is signed with a secret HMAC SHA-256 header (<code className="text-[#E31B23]">X-EventsOs-Signature</code>) for tamper verification.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white border border-zinc-200 p-4 rounded-xl space-y-1">
                  <code className="text-xs font-bold text-emerald-600">order.completed</code>
                  <p className="text-[11px] text-zinc-500">Triggered immediately when customer payment clears.</p>
                </div>
                <div className="bg-white border border-zinc-200 p-4 rounded-xl space-y-1">
                  <code className="text-xs font-bold text-indigo-600">ticket.scanned</code>
                  <p className="text-[11px] text-zinc-500">Triggered at the venue gate when attendee QR code is validated.</p>
                </div>
                <div className="bg-white border border-zinc-200 p-4 rounded-xl space-y-1">
                  <code className="text-xs font-bold text-amber-600">event.published</code>
                  <p className="text-[11px] text-zinc-500">Triggered when an organizer transitions an event to live.</p>
                </div>
              </div>
            </section>

            {/* Section 8: Rate Limits & Errors */}
            <section id="rate-limits" className="space-y-4 pt-4 border-t border-zinc-200">
              <h2 className="text-2xl font-bold text-zinc-950 tracking-tight">Rate Limits & Errors</h2>
              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-medium">
                The standard API tier permits <strong>60 requests per minute</strong>. Enterprise tiers support up to <strong>100,000 requests per minute</strong> with dedicated IP peering.
              </p>

              <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-700 font-bold">
                    <tr>
                      <th className="p-3">HTTP Code</th>
                      <th className="p-3">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 text-zinc-600 font-medium">
                    <tr>
                      <td className="p-3 font-mono font-bold text-emerald-600">200 OK</td>
                      <td className="p-3">Request processed successfully.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-bold text-amber-600">401 Unauthorized</td>
                      <td className="p-3">Invalid or missing API Bearer token.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-bold text-amber-600">403 Forbidden</td>
                      <td className="p-3">Your organizer role does not have permission for this action.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-bold text-red-600">429 Rate Limited</td>
                      <td className="p-3">Exceeded request threshold. Inspect the Retry-After header.</td>
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
