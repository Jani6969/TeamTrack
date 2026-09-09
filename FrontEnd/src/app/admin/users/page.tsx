'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { userService } from '@/services/userService';
import { User, UserRole } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { TableSkeleton } from '@/components/ui/LoadingSkeleton';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/context/ToastContext';
import { Users, Shield, Trash2, Search, CheckCircle2 } from 'lucide-react';

export default function UsersManagementPage() {
  const { user: currentUser } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Delete dialog state
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = async () => {
    try {
      const data = await userService.getUsers();
      setUsers(data || []);
    } catch (err) {
      console.error('Failed to load users:', err);
      toastError('Failed to load user directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: 'TEAM_MEMBER' | 'MANAGER') => {
    try {
      await userService.updateUserRole(userId, newRole);
      toastSuccess(`Role updated to ${newRole}`);
      fetchUsers();
    } catch (err: any) {
      toastError(err.message || 'Failed to update user role');
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setDeleting(true);
    try {
      await userService.deleteUser(userToDelete._id);
      toastSuccess('User account removed');
      setUserToDelete(null);
      fetchUsers();
    } catch (err: any) {
      toastError(err.message || 'Failed to delete user');
    } finally {
      setDeleting(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term);
  });

  return (
    <AppShell
      allowedRoles={['MANAGER', 'ADMIN']}
      title="User Directory & Access Control"
      subtitle="Manage employee accounts and adjust permission roles across the platform"
    >
      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleDeleteUser}
        title="Delete User Account"
        message={`Are you sure you want to permanently delete the account for "${userToDelete?.name}" (${userToDelete?.email})?`}
        confirmText="Yes, Delete User"
        isDestructive={true}
        isLoading={deleting}
      />

      {/* Top Search bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="relative max-w-sm w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search employee by name or email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        <div className="text-xs font-semibold text-slate-500">
          Total Users: <span className="text-slate-900 font-bold">{users.length}</span>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={6} cols={5} />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">No users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[650px]">
              <thead className="bg-slate-50 text-slate-500 text-[11px] font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-6">Employee</th>
                  <th className="py-3.5 px-6">Current Role</th>
                  <th className="py-3.5 px-6">Change Role</th>
                  <th className="py-3.5 px-6">Created Date</th>
                  <th className="py-3.5 px-6 text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredUsers.map((u) => {
                  const isSelf = currentUser?._id === u._id;

                  return (
                    <tr key={u._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                            {(u.name || 'User').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-2">
                              <span>{u.name}</span>
                              {isSelf && (
                                <span className="px-1.5 py-0.2 rounded text-[10px] bg-brand-50 text-brand-700 font-bold">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-400">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            u.role === 'MANAGER' || u.role === 'ADMIN'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-brand-50 text-brand-700 border border-brand-200'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <select
                          value={u.role}
                          disabled={isSelf}
                          onChange={(e) =>
                            handleRoleChange(u._id, e.target.value as 'TEAM_MEMBER' | 'MANAGER')
                          }
                          className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <option value="TEAM_MEMBER">Team Member</option>
                          <option value="MANAGER">Manager</option>
                        </select>
                      </td>

                      <td className="py-4 px-6 text-xs text-slate-400">
                        {formatDate(u.createdAt)}
                      </td>

                      <td className="py-3.5 px-6 text-right whitespace-nowrap">
                        {!isSelf && (
                          <button
                            type="button"
                            onClick={() => setUserToDelete(u)}
                            className="h-8 w-8 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 inline-flex items-center justify-center transition-all shadow-sm shrink-0"
                            title="Delete User"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
}
