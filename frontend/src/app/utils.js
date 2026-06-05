export const skinTypes = [
  { id: 1, label: 'I', color: 'bg-[#ffeedb]', border: 'border-[#e6d6c5]', desc: 'Always burns' },
  { id: 2, label: 'II', color: 'bg-[#faddce]', border: 'border-[#e1c7ba]', desc: 'Usually burns' },
  { id: 3, label: 'III', color: 'bg-[#e4b590]', border: 'border-[#cda382]', desc: 'Sometimes burns' },
  { id: 4, label: 'IV', color: 'bg-[#cb8e5c]', border: 'border-[#b78053]', desc: 'Rarely burns' },
  { id: 5, label: 'V', color: 'bg-[#895533]', border: 'border-[#7b4c2e]', desc: 'Very rarely burns' },
  { id: 6, label: 'VI', color: 'bg-[#402011]', border: 'border-[#3a1d0f]', desc: 'Never burns' },
];

export const getUVData = (index) => {
  if (index <= 2) return { index, risk: 'Low', safeTime: '60+ mins', color: 'text-green-500', gradient: 'from-green-400 to-emerald-500' };
  if (index <= 5) return { index, risk: 'Moderate', safeTime: '45 mins', color: 'text-yellow-500', gradient: 'from-yellow-400 to-amber-500' };
  if (index <= 7) return { index, risk: 'High', safeTime: '30 mins', color: 'text-orange-500', gradient: 'from-orange-400 to-orange-500' };
  if (index <= 10) return { index, risk: 'Extreme', safeTime: '15 mins', color: 'text-red-500', gradient: 'from-red-400 to-rose-500' };
  return { index, risk: 'Extreme', safeTime: '< 10 mins', color: 'text-purple-600', gradient: 'from-purple-500 to-pink-600' };
};
