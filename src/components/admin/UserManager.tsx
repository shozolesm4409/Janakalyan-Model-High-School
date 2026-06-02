import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, onSnapshot, query, doc, updateDoc } from 'firebase/firestore';
import { User, UserRole } from '../../types';
import { 
  Search, 
  User as UserIcon, 
  Mail, 
  Phone, 
  Shield, 
  MoreVertical,
  Filter,
  ArrowUpDown,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Swal from 'sweetalert2';

export const UserManager: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as User[];
      setUsers(usersData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleUpdateRole = async (uid: string, newRole: UserRole) => {
    try {
      await updateDoc(doc(db, 'users', uid), { role: newRole });
      Swal.fire({
        icon: 'success',
        title: 'রোল আপডেট সফল!',
        text: `ইউজার রোল '${newRole}' এ পরিবর্তন করা হয়েছে।`,
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'ত্রুটি!',
        text: 'পারমিশন আপডেট করতে ব্যর্থ হয়েছে।',
      });
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phoneNumber?.includes(searchQuery);
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  return (
    <div className="p-1 space-y-6 animate-fade-in font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="text-left">
          <h2 className="text-xl font-black text-gray-900">ইউজার ম্যানেজমেন্ট</h2>
          <p className="text-gray-500 text-xs">সিস্টেমের সকল নিবন্ধিত সদস্যদের ডাটাবেজ ও পারমিশন কন্ট্রোল</p>
        </div>
        
        <div className="flex items-center gap-2">
            <span className="text-[10px] font-black bg-gray-100 px-3 py-1.5 rounded-lg border text-gray-500">
                TOTAL: {users.length}
            </span>
            <span className="text-[10px] font-black bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 text-blue-600">
                ADMINS: {users.filter(u => u.role === 'admin').length}
            </span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-150 shadow-sm overflow-hidden p-4">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="নাম, ইমেইল বা ফোন নম্বর দিয়ে খুঁজুন..."
              className="w-full pl-10 pr-4 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              className="px-4 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white cursor-pointer"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
            >
              <option value="all">সব রোল (All Roles)</option>
              <option value="user">ইউজার (User)</option>
              <option value="admin">এডমিন (Admin)</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-4 py-4 font-black uppercase tracking-wider text-gray-500 text-[10px]">সদস্য (Member)</th>
                <th className="px-4 py-4 font-black uppercase tracking-wider text-gray-500 text-[10px]">ব্যাচ ও পেশা</th>
                <th className="px-4 py-4 font-black uppercase tracking-wider text-gray-500 text-[10px]">যোগাযোগ</th>
                <th className="px-4 py-4 font-black uppercase tracking-wider text-gray-500 text-[10px]">রোল ও দায়িত্ব</th>
                <th className="px-4 py-4 font-black uppercase tracking-wider text-gray-500 text-[10px] text-right">ম্যানেজ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-gray-400">লোড হচ্ছে...</td>
                </tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.uid} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100 text-blue-600 font-bold overflow-hidden">
                          {user.photoURL ? (
                            <img src={user.photoURL} alt="" className="h-full w-full object-cover" />
                          ) : (
                            user.name?.charAt(0).toUpperCase() || '?'
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{user.name}</div>
                          <div className="text-[10px] text-gray-400 font-mono">UID: {user.uid.slice(-6).toUpperCase()}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="space-y-1">
                        <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded">
                          Batch: {user.batch || 'N/A'}
                        </span>
                        <div className="text-gray-500 truncate max-w-[150px]">{user.profession || 'N/A'}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <Mail className="h-3 w-3 opacity-40" />
                          <span>{user.email || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <Phone className="h-3 w-3 opacity-40" />
                          <span>{user.phoneNumber || 'N/A'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-black uppercase text-[10px] ${
                        user.role === 'admin' 
                        ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                        : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      }`}>
                        <Shield className="h-3 w-3" />
                        {user.role || 'user'}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <select
                          className="text-[10px] font-bold border rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary/40 bg-white"
                          value={user.role || 'user'}
                          onChange={(e) => handleUpdateRole(user.uid, e.target.value as UserRole)}
                        >
                          <option value="user">Set User</option>
                          <option value="admin">Set Admin</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-gray-400">কোন ইউজার পাওয়া যায়নি।</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
