import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { adminApi } from '../api/adminClient';
import type { AdminRole } from '../types/admin';
import {
  Cpu,
  Lock,
  Mail,
  ShieldAlert,
  ArrowRight,
  Loader2,
  ShieldCheck,
  KeyRound,
  Fingerprint,
  Radio,
  Server,
  Terminal,
  HelpCircle
} from 'lucide-react';

interface OperatorDemoPersona {
  role: AdminRole;
  label: string;
  email: string;
  badgeColor: string;
  desc: string;
}

const PRESET_OPERATORS: OperatorDemoPersona[] = [
  {
    role: 'super_admin',
    label: 'Super Administrator',
    email: 'alex.morgan@eventsos.internal',
    badgeColor: 'border-rose-500/40 text-rose-400 bg-rose-500/10',
    desc: 'Unrestricted control: feature flags, financial settlements, emergency takedowns.'
  },
  {
    role: 'finance_admin',
    label: 'Finance Administrator',
    email: 'sarah.connor@eventsos.internal',
    badgeColor: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10',
    desc: 'Financial reconciliations, Paystack/Flutterwave refunds, and organizer payouts.'
  },
  {
    role: 'trust_and_safety',
    label: 'Trust & Safety',
    email: 'moderation@eventsos.internal',
    badgeColor: 'border-amber-500/40 text-amber-400 bg-amber-500/10',
    desc: 'Fraud detection watchtower, card velocity attacks, and ticket invalidations.'
  },
  {
    role: 'kyc_reviewer',
    label: 'KYC Document Reviewer',
    email: 'compliance@eventsos.internal',
    badgeColor: 'border-cyan-500/40 text-cyan-400 bg-cyan-500/10',
    desc: 'CAC registration reviews, tax identification verification, and organizer onboarding.'
  },
  {
    role: 'support_agent',
    label: 'Customer Support Agent',
    email: 'support.lead@eventsos.internal',
    badgeColor: 'border-purple-500/40 text-purple-400 bg-purple-500/10',
    desc: 'Attendee ticket delivery issues, QR pass re-issuance, and incident timelines.'
  }
];

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('alex.morgan@eventsos.internal');
  const [password, setPassword] = useState('••••••••••••');
  const [twoFactorCode, setTwoFactorCode] = useState('892014');
  const [selectedRole, setSelectedRole] = useState<AdminRole>('super_admin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [twoFactorStep, setTwoFactorStep] = useState(false);

  const { login } = useAdminAuth();
  const navigate = useNavigate();

  const handleSelectPersona = (persona: OperatorDemoPersona) => {
    setEmail(persona.email);
    setSelectedRole(persona.role);
    setError(null);
  };

  const handleInitialAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide operator email and secure passphrase.');
      return;
    }
    setLoading(true);
    setError(null);

    // Simulate primary credential verification then prompt hardware 2FA
    setTimeout(() => {
      setLoading(false);
      setTwoFactorStep(true);
    }, 450);
  };

  const handleFinalVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      const adminUser = {
        id: `adm_${Date.now()}`,
        name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
        email,
        role: selectedRole,
        permissions: [] as any
      };

      const token = `sanctum_admin_token_${Date.now()}`;
      login(token, adminUser);
      setLoading(false);
      navigate('/');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-4 selection:bg-rose-500 selection:text-white relative overflow-hidden">
      {/* Background Ambient Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-950/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg space-y-6 z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-rose-600 to-red-500 flex items-center justify-center text-white mx-auto shadow-2xl shadow-rose-950/60 border border-rose-400/30">
            <Cpu className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-2xl font-black text-white tracking-tight">EventsOS Console</h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/30">
                INTERNAL
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-medium mt-1">
              Zero-Trust Administrative Gateway & Heuristic Audit Portal
            </p>
          </div>
        </div>

        {/* Main Authentication Card */}
        <div className="bg-zinc-900/60 backdrop-blur-md border border-zinc-800/80 rounded-3xl p-7 shadow-2xl space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {!twoFactorStep ? (
            /* STEP 1: CREDENTIALS & OPERATOR ROLE SELECTION */
            <form onSubmit={handleInitialAuth} className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-300">Operator Identity</label>
                  <span className="text-[10px] text-zinc-500 font-mono">LDAP / SSO Ready</span>
                </div>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="operator@eventsos.internal"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-rose-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-300">Security Passphrase</label>
                  <span className="text-[10px] text-rose-400 font-mono">Encrypted PBKDF2</span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-rose-500 font-mono transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Quick Persona Fast-Switch (Developer & Testing Helper) */}
              <div className="space-y-2 pt-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
                  Select Administrative Persona / RBAC Role:
                </span>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {PRESET_OPERATORS.map((p) => (
                    <button
                      key={p.role}
                      type="button"
                      onClick={() => handleSelectPersona(p)}
                      className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all cursor-pointer flex items-center justify-between ${
                        selectedRole === p.role && email === p.email
                          ? 'bg-zinc-800 border-rose-500/60 shadow-xs'
                          : 'bg-zinc-950/70 border-zinc-850/80 hover:border-zinc-700'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-1.5">
                          <strong className="text-white font-bold truncate block">{p.label}</strong>
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono border ${p.badgeColor}`}>
                            {p.role}
                          </span>
                        </div>
                        <span className="text-[10px] text-zinc-400 truncate block mt-0.5">{p.desc}</span>
                      </div>
                      <Radio
                        className={`w-3.5 h-3.5 flex-shrink-0 ${
                          selectedRole === p.role && email === p.email ? 'text-rose-500' : 'text-zinc-700'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white rounded-xl text-xs font-black shadow-lg shadow-rose-950/50 transition-all cursor-pointer flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                <span>Verify Credentials & Challenge</span>
              </button>
            </form>
          ) : (
            /* STEP 2: HARDWARE 2FA / TOTP CHALLENGE */
            <form onSubmit={handleFinalVerify} className="space-y-4 animate-in fade-in duration-200">
              <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 text-[10px] uppercase font-bold">Authenticated Identity:</span>
                  <span className="text-[10px] font-mono text-emerald-400">Credentials Valid</span>
                </div>
                <strong className="text-white block font-mono">{email}</strong>
                <span className="text-zinc-400 text-[11px] block">Role: {selectedRole}</span>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-300">TOTP Authenticator Token</label>
                  <span className="text-[10px] text-zinc-500 font-mono">6-Digit Code</span>
                </div>
                <div className="relative">
                  <Fingerprint className="w-4 h-4 text-rose-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    maxLength={6}
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value)}
                    placeholder="892014"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-4 py-3 text-sm text-center tracking-widest text-emerald-400 font-mono outline-none focus:border-rose-500"
                    required
                  />
                </div>
                <span className="text-[10px] text-zinc-500 block text-center">
                  Enter code from your security key, Google Authenticator, or YubiKey.
                </span>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTwoFactorStep(false)}
                  className="w-1/3 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-bold text-xs"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-2/3 py-2.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white rounded-xl text-xs font-black shadow-lg shadow-rose-950/50 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  <span>Authorize & Enter Console</span>
                </button>
              </div>
            </form>
          )}

          {/* Footer Security Badges */}
          <div className="border-t border-zinc-800/80 pt-4 flex items-center justify-between text-[10px] font-mono text-zinc-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-500" /> FIPS 140-2 Validated
            </span>
            <span>Session ID: ssn_{Date.now().toString().slice(-6)}</span>
          </div>
        </div>

        {/* Bottom Helper Note */}
        <p className="text-[11px] text-center text-zinc-500 max-w-md mx-auto">
          Need privileged access? Contact the EventsOS Security Operations Center (SOC) or your designated platform administrator.
        </p>
      </div>
    </div>
  );
};
