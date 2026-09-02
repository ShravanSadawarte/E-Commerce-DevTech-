import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { User, Mail, Phone, Lock, Camera, CheckCircle2, Loader2 } from 'lucide-react';
import { updateUserState } from '../store/authSlice';
import api from '../services/api';

const AccountSettingsPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await api.put('/auth/profile', { name, phone, avatar });
      dispatch(updateUserState(res.data?.user));
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (e) {
      alert(e.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Profile Details Form */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 card-shadow space-y-6">
        <div className="pb-4 border-b border-slate-100">
          <h2 className="text-lg font-black uppercase tracking-tight text-slate-900">
            Account Details & Profile
          </h2>
          <p className="text-xs text-slate-500">
            Update your personal contact information and display avatar.
          </p>
        </div>

        {profileSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Profile information updated successfully!</span>
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-6">
          {/* Avatar Preview & URL */}
          <div className="flex flex-col sm:flex-row items-center gap-6">
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full bg-slate-100 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-500 cursor-not-allowed"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">Email address cannot be modified directly.</span>
          </div>

          <button
            type="submit"
            disabled={savingProfile}
            className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white text-xs font-bold px-6 py-3 rounded-xl uppercase tracking-wider shadow-xs transition"
          >
            {savingProfile ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AccountSettingsPage;
