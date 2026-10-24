import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { adminApi } from '../api/adminClient';
import type { ManagedUser } from '../types/admin';
import {
  Users,
  Search,
  Shield,
  ShieldCheck,
  Ban,
  UserCheck,
  UserX,
  Mail,
  Calendar,
  Ticket
} from 'lucide-react';

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'organizer' | 'customer'>('all');

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getUsers();
      setUsers(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleStatusChange = async (userId: string, status: 'active' | 'suspended' | 'banned') => {
    await adminApi.updateUserStatus(userId, status);
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status } : u))
    );
  };

  const filtered = users.filter((u) => {
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-5">
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <Users className="w-6 h-6 text-rose-500" />
              <span>Accounts & Organizer Directory</span>
            </h1>
            <p className="text-zinc-400 text-xs sm:text-sm font-medium">
              Manage permissions, investigate chargebacks, suspend suspicious accounts, and inspect organizer volume.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-zinc-900/50 p-3 rounded-2xl border border-zinc-800">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search user by name or email..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-rose-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {(['all', 'organizer', 'customer'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                  roleFilter === r
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {r === 'all' ? 'All Roles' : `${r}s`}
              </button>
            ))}
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-zinc-900/50 rounded-3xl border border-zinc-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950/60 border-b border-zinc-800 text-zinc-400 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Account / Identity</th>
                  <th className="px-5 py-3.5">Account Type</th>
                  <th className="px-5 py-3.5">Activity Volume</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Administrative Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850">
                {filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-zinc-850/40 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-zinc-800 text-rose-300 border border-zinc-700 font-black text-xs flex items-center justify-center flex-shrink-0">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-white text-sm">{user.name}</span>
                            {user.isVerified && (
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                            )}
                          </div>
                          <span className="text-zinc-400 font-mono text-[11px] block">{user.email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-zinc-800 text-zinc-300">
                        {user.role}
                      </span>
                    </td>

                    <td className="px-5 py-4 font-mono text-zinc-300">
                      {user.role === 'organizer' ? (
                        <span>{user.eventsCount} Events • {user.ticketsCount.toLocaleString()} Tickets</span>
                      ) : (
                        <span>{user.ticketsCount} Passes Purchased</span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          user.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : user.status === 'suspended'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        {user.status !== 'active' && (
                          <button
                            onClick={() => handleStatusChange(user.id, 'active')}
                            className="px-2.5 py-1 bg-zinc-800 hover:bg-emerald-600 hover:text-white text-zinc-300 rounded-lg text-[11px] font-bold cursor-pointer transition-colors"
                          >
                            Activate
                          </button>
                        )}
                        {user.status !== 'suspended' && (
                          <button
                            onClick={() => handleStatusChange(user.id, 'suspended')}
                            className="px-2.5 py-1 bg-zinc-800 hover:bg-amber-600 hover:text-white text-zinc-300 rounded-lg text-[11px] font-bold cursor-pointer transition-colors"
                          >
                            Suspend
                          </button>
                        )}
                        {user.status !== 'banned' && (
                          <button
                            onClick={() => handleStatusChange(user.id, 'banned')}
                            className="px-2.5 py-1 bg-zinc-800 hover:bg-rose-600 hover:text-white text-rose-400 rounded-lg text-[11px] font-bold cursor-pointer transition-colors"
                          >
                            Ban
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
