import { useEffect, useMemo, useState } from 'react';
import { Clock, MapPin, Search, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { getStoredUser } from '../services/authService';
import { deleteHistory, fetchHistory } from '../services/synarService';
import { getUVData } from '../utils';

const formatDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export default function History() {
  const [records, setRecords] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState('');

  const filteredRecords = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return records;

    return records.filter((item) => {
      return [
        item.location,
        item.risk_level,
        item.recommendation,
        formatDate(item.createdAt),
      ].some((value) => String(value || '').toLowerCase().includes(normalized));
    });
  }, [records, query]);

  useEffect(() => {
    const user = getStoredUser();
    if (!user?.userId) {
      setError('User tidak ditemukan. Silakan login ulang.');
      setLoading(false);
      return;
    }

    fetchHistory(user.userId)
      .then(setRecords)
      .catch((error) => setError(error instanceof Error ? error.message : 'Gagal memuat history'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (historyId) => {
    setDeletingId(historyId);
    setError('');

    try {
      await deleteHistory(historyId);
      setRecords((current) => current.filter((item) => item.historyId !== historyId));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Gagal menghapus history');
    } finally {
      setDeletingId('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800">Check History</h2>
          <p className="text-slate-500 font-bold">Your past UV exposure checks</p>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} type="text" placeholder="Search history..." className="pl-9 pr-4 py-2 bg-white/80 backdrop-blur-md border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-400/50 w-full sm:w-64" />
        </div>
      </div>

      {error && <p className="text-sm font-bold text-red-500">{error}</p>}

      {loading ? (
        <div className="py-16 text-center font-bold text-slate-500">Loading history...</div>
      ) : filteredRecords.length > 0 ? (
        <div className="space-y-4">
          {filteredRecords.map((item, index) => {
            const uv = getUVData(Math.round(item.uv_index));
            return (
              <motion.div
                key={item.historyId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/80 backdrop-blur-xl p-5 rounded-2xl border border-white shadow-lg shadow-slate-200/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center ${uv.gradient.includes('green') ? 'bg-green-500' : uv.gradient.includes('yellow') ? 'bg-yellow-500' : uv.gradient.includes('orange') ? 'bg-orange-500' : 'bg-red-500'} text-white shadow-inner`}>
                    <span className="text-xs font-bold uppercase opacity-80 leading-none">UV</span>
                    <span className="text-2xl font-black leading-none">{uv.index}</span>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-800 text-lg flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-slate-400" /> {item.location || 'Unknown location'}
                    </h4>
                    <p className="text-slate-500 text-sm font-medium flex items-center gap-1 mt-0.5">
                      <Clock className="w-3.5 h-3.5" /> {formatDate(item.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className={`px-4 py-1.5 rounded-full font-bold text-sm tracking-wider uppercase bg-white ${uv.color} border border-current/20`}>
                    {item.risk_level || uv.risk}
                  </div>
                  <button onClick={() => handleDelete(item.historyId)} disabled={deletingId === item.historyId} className="w-10 h-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 disabled:opacity-50 flex items-center justify-center transition-colors" aria-label="Delete history">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-white/50 backdrop-blur-md rounded-3xl border border-dashed border-slate-300">
          <Clock className="w-16 h-16 mx-auto text-slate-300 mb-4" />
          <p className="text-lg font-bold text-slate-500">No history found</p>
          <p className="text-sm text-slate-400 mt-1">Check your UV risk to see it here.</p>
        </div>
      )}
    </div>
  );
}
