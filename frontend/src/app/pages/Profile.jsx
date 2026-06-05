import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Camera, CheckCircle2, LogOut, Mail, Save, Shield, Trash2, User, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { skinTypes } from '../utils';
import { useNavigate } from 'react-router';
import { deleteAccount, fetchProfile, getStoredUser, logoutUser, updateProfile } from '../services/authService';

export default function Profile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [profile, setProfile] = useState(getStoredUser());
  const [name, setName] = useState(getStoredUser()?.name || '');
  const [skinType, setSkinType] = useState(getStoredUser()?.skinType || 3);
  const [photoUrl, setPhotoUrl] = useState(getStoredUser()?.photoUrl || null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    fetchProfile()
      .then((user) => {
        setProfile(user);
        setName(user.name || '');
        setSkinType(user.skinType || 3);
        setPhotoUrl(user.photoUrl || null);
      })
      .catch((error) => setError(error instanceof Error ? error.message : 'Gagal memuat profile'))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setPhotoUrl(String(reader.result));
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setMessage('');

    try {
      const updated = await updateProfile({ name, skinType, photoUrl });
      setProfile(updated);
      setMessage('Profile updated');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Gagal menyimpan profile');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    setError('');
    setMessage('');

    try {
      await deleteAccount();
      setDeleteDialogOpen(false);
      navigate('/register');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Gagal menghapus akun');
      setDeleting(false);
    }
  };

  const initial = (name || profile?.email || 'U').charAt(0).toUpperCase();

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-black text-slate-800">My Profile</h2>
        <p className="text-slate-500 font-bold">Manage your details and preferences</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/80 backdrop-blur-xl p-8 rounded-[32px] border border-white shadow-xl shadow-slate-200/50 space-y-8">
        {loading && <p className="text-sm font-bold text-slate-500">Loading profile...</p>}
        {error && <p className="text-sm font-bold text-red-500">{error}</p>}
        {message && <p className="text-sm font-bold text-green-600">{message}</p>}

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-3xl font-black text-white shadow-lg overflow-hidden">
              {photoUrl ? <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" /> : initial}
            </div>
            <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full border-2 border-slate-100 flex items-center justify-center text-slate-600 hover:text-orange-500 shadow-sm transition-colors" aria-label="Change profile photo">
              <Camera className="w-4 h-4" />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
          </div>

          <div className="text-center sm:text-left flex-1 space-y-4 w-full">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 mt-1">
                <User className="w-5 h-5 text-slate-400" />
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="bg-transparent font-bold text-slate-800 w-full focus:outline-none" />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Email Address</label>
              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 mt-1">
                <Mail className="w-5 h-5 text-slate-400" />
                <input type="email" value={profile?.email || ''} disabled className="bg-transparent font-medium text-slate-500 w-full focus:outline-none" />
              </div>
            </div>
          </div>
        </div>

        <div className="h-px w-full bg-slate-100" />

        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <Shield className="w-5 h-5 text-orange-500" /> My Skin Type
              </h3>
              <p className="text-sm font-medium text-slate-500 mt-1">Used to calculate your personalized safe exposure times.</p>
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {skinTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSkinType(type.id)}
                className={`relative aspect-square rounded-2xl transition-all duration-300 border-2 ${type.color} ${type.border} ${skinType === type.id ? 'ring-4 ring-orange-400 ring-offset-2 scale-110 shadow-lg z-10' : 'hover:scale-105 opacity-90 hover:opacity-100'}`}
              >
                <span className={`absolute inset-0 flex items-center justify-center font-black text-xl ${[5, 6].includes(type.id) ? 'text-white/90' : 'text-slate-800/70'}`}>{type.label}</span>
                {skinType === type.id && (
                  <div className="absolute -top-2 -right-2 bg-white rounded-full">
                    <CheckCircle2 className="w-5 h-5 text-orange-500" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row gap-3">
          <button onClick={handleSave} disabled={saving || !name.trim()} className="w-full sm:w-auto px-6 py-4 bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-60 font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
            <Save className="w-5 h-5" />
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
          <button onClick={handleLogout} className="w-full sm:w-auto px-6 py-4 bg-red-50 text-red-600 hover:bg-red-100 font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
            <LogOut className="w-5 h-5" />
            Log Out Securely
          </button>
        </div>

        <div className="rounded-2xl border border-red-100 bg-red-50/70 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-black text-red-700">Delete Account</h3>
              <p className="mt-1 text-sm font-medium text-red-600">
                Remove this account and all saved history records.
              </p>
            </div>
            <button
              onClick={() => setDeleteDialogOpen(true)}
              disabled={deleting || saving}
              className="w-full sm:w-auto px-5 py-3 bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 className="w-5 h-5" />
              Delete Account
            </button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {deleteDialogOpen && (
          <motion.div
            className="fixed inset-0 z-[1400] flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-account-title"
              aria-describedby="delete-account-description"
              className="w-full max-w-md rounded-3xl border border-red-100 bg-white p-6 shadow-2xl"
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 id="delete-account-title" className="text-xl font-black text-slate-900">
                      Delete Account?
                    </h2>
                    <p id="delete-account-description" className="mt-1 text-sm font-medium text-slate-500">
                      This will permanently remove your account and saved history records.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDeleteDialogOpen(false)}
                  disabled={deleting}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 disabled:opacity-50"
                  aria-label="Close delete account dialog"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">
                You will need to register again if you want to use this email after deletion.
              </div>

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setDeleteDialogOpen(false)}
                  disabled={deleting}
                  className="w-full rounded-xl bg-slate-100 px-5 py-3 font-bold text-slate-700 transition-colors hover:bg-slate-200 disabled:opacity-50 sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="w-full rounded-xl bg-red-600 px-5 py-3 font-bold text-white transition-colors hover:bg-red-700 disabled:opacity-60 sm:w-auto"
                >
                  {deleting ? 'Deleting...' : 'Delete Account'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
