import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { LogOut, Shield, Users, Trash2, Activity } from 'lucide-react';
import { InteractiveBackground } from '../components/InteractiveBackground';

interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

export default function Dashboard() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role === 'admin') {
      fetchUsers();
    }
  }, [user, navigate]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Failed to fetch users', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setUsers(users.filter(u => u.id !== id));
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Failed to delete user', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen p-6 md:p-12 lg:p-24">
      <InteractiveBackground />
      <div className="mx-auto max-w-5xl space-y-12">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-white/10 pb-8 relative">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-white/10 to-white/5 border border-white/20 text-xl font-light shadow-[0_0_15px_rgba(255,255,255,0.1)]">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-light tracking-tight">Dashboard</h1>
              <p className="text-sm text-white/50">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {user.role === 'admin' && (
              <div className="hidden sm:flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs text-orange-500">
                <Shield className="h-3 w-3" />
                ADMINISTRATOR
              </div>
            )}
            <Button variant="ghost" onClick={handleLogout} className="px-4">
              <LogOut className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </header>

        {/* Content */}
        {user.role === 'admin' ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-light tracking-tight flex items-center gap-3">
                <Users className="h-5 w-5 text-white/50" /> 
                User Management
              </h2>
              <p className="text-sm text-white/50 font-mono">{users.length} total users</p>
            </div>

            <div className="glass-panel overflow-hidden rounded-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-white/70">
                  <thead className="bg-white/5 text-xs uppercase tracking-wider text-white/50 border-b border-white/10">
                    <tr>
                      <th className="px-6 py-4 font-medium">Name</th>
                      <th className="px-6 py-4 font-medium">Email</th>
                      <th className="px-6 py-4 font-medium">Role</th>
                      <th className="px-6 py-4 font-medium">Joined</th>
                      <th className="px-6 py-4 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {isLoading ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-white/30">
                          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        </td>
                      </tr>
                    ) : users.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-white/30">
                          No users found
                        </td>
                      </tr>
                    ) : (
                      users.map((u) => (
                        <tr key={u.id} className="transition-colors hover:bg-white/[0.02]">
                          <td className="whitespace-nowrap px-6 py-4 font-medium text-white">
                            {u.name}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            {u.email}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            <span className={`inline-flex rounded-full px-2 py-1 text-[10px] uppercase font-bold tracking-widest ${
                              u.role === 'admin' 
                                ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' 
                                : 'bg-white/5 text-white/50 border border-white/10'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 font-mono text-xs text-white/40">
                            {new Date(u.created_at).toLocaleDateString()}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-right">
                            {u.id !== user.id && (
                              <Button
                                variant="danger"
                                className="px-3"
                                onClick={() => handleDeleteUser(u.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-8"
          >
            <div className="text-center py-8">
              <h2 className="text-4xl md:text-5xl font-light mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-white/90 to-white/50 tracking-widest uppercase">
                Welcome back, {user.name}
              </h2>
              <p className="text-white/40 font-light tracking-wide text-sm max-w-lg mx-auto">
                Here is an overview of your account status and recent activity.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="col-span-1 md:col-span-2 glass-panel rounded-3xl p-8 md:p-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>
                <h3 className="text-xl font-light mb-6 text-white/80 tracking-tight">Account Overview</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="group relative overflow-hidden bg-white/[0.02] border border-white/5 rounded-2xl p-6 transition-all duration-300 hover:bg-white/[0.04] hover:border-white/20 hover:-translate-y-1 hover:shadow-xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] mb-3">Account Type</p>
                    <p className="font-light text-xl tracking-tight text-white/90">Standard User</p>
                  </div>
                  <div className="group relative overflow-hidden bg-white/[0.02] border border-white/5 rounded-2xl p-6 transition-all duration-300 hover:bg-white/[0.04] hover:border-white/20 hover:-translate-y-1 hover:shadow-xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] mb-3">Status</p>
                    <p className="font-light text-xl flex items-center gap-3 text-white/90">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]"></span>
                      </span>
                      Active
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-span-1 glass-panel rounded-3xl p-8 flex flex-col items-center justify-center text-center relative overflow-hidden group hover:border-white/20 transition-colors duration-300">
                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-blue-500/10 to-transparent opacity-50 pointer-events-none"></div>
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-white/10 to-transparent border border-white/10 mb-6 shadow-[0_0_30px_rgba(255,255,255,0.05)] group-hover:scale-110 group-hover:border-white/30 transition-all duration-500">
                  <Shield className="h-8 w-8 text-white/70 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]" />
                </div>
                <h3 className="font-light mb-2 text-xl tracking-tight">Secure Session</h3>
                <p className="text-xs text-white/40 uppercase tracking-widest">Authenticated via JWT</p>
              </div>
            </div>
            
            <div className="glass-panel rounded-3xl p-8 md:p-10 relative overflow-hidden">
              <div className="absolute -left-32 -bottom-32 w-64 h-64 rounded-full bg-purple-500/10 blur-3xl pointer-events-none"></div>
              <h3 className="text-xl font-light mb-8 flex items-center gap-3 tracking-tight">
                <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                  <Activity className="h-4 w-4 text-white/70" />
                </div>
                Recent Activity
              </h3>
              <div className="space-y-2">
                <div className="group flex items-center justify-between p-4 rounded-2xl hover:bg-white/[0.03] transition-colors duration-300 border border-transparent hover:border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="h-2 w-2 rounded-full bg-white/20 group-hover:bg-white/60 transition-colors"></div>
                    <div>
                      <p className="font-light text-white/90">Logged In</p>
                      <p className="text-xs text-white/40 mt-1 font-mono tracking-wide">Successfully authenticated account</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-white/40 font-mono tracking-widest uppercase bg-white/5 px-3 py-1.5 rounded-full border border-white/5">Just now</p>
                </div>
                
                <div className="group flex items-center justify-between p-4 rounded-2xl hover:bg-white/[0.03] transition-colors duration-300 border border-transparent hover:border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="h-2 w-2 rounded-full bg-white/20 group-hover:bg-white/60 transition-colors"></div>
                    <div>
                      <p className="font-light text-white/90">Account Created</p>
                      <p className="text-xs text-white/40 mt-1 font-mono tracking-wide">Registered standard user account</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-white/40 font-mono tracking-widest uppercase bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                    {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
