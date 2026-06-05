import { motion } from 'motion/react';
import { Link } from 'react-router';
import { Activity, Camera, ShieldCheck, Sun } from 'lucide-react';
import iconPng from '../../assets/icon.png';

export default function Landing() {
  return (
    <div className="flex flex-col items-center">
      <section className="w-full max-w-6xl mx-auto px-4 py-16 md:py-24 flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 space-y-6 text-center md:text-left">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-block px-4 py-2 bg-orange-100 text-orange-600 rounded-full font-bold text-sm mb-4 border border-orange-200">
            AI-Powered Sun Safety
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-5xl md:text-7xl font-black text-slate-800 leading-tight tracking-tight">
            Know Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500">Sun Risk</span> Instantly
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-lg md:text-xl text-slate-500 font-medium max-w-xl mx-auto md:mx-0">
            Real-time UV tracking combined with AI skin detection to give you personalized safe exposure times.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-col sm:flex-row items-center gap-4 pt-4 justify-center md:justify-start">
            <Link to="/app" className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-orange-400 to-pink-500 text-white rounded-2xl font-black text-lg shadow-xl shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-1 transition-all text-center">
              Start Checking Free
            </Link>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="flex-1 relative w-full max-w-md md:max-w-none">
          <div className="relative bg-white/80 backdrop-blur-xl border border-white p-6 rounded-[40px] shadow-2xl">
            <div className="bg-slate-50 rounded-[24px] overflow-hidden border border-slate-100 aspect-[4/5] flex flex-col items-center justify-center p-6 relative">
              <Sun className="absolute -top-10 -right-10 w-48 h-48 text-orange-500/10 pointer-events-none" />
              <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/40 mb-8 animate-pulse overflow-hidden">
                <img src={iconPng} className="w-14 h-14 object-contain" alt="SYNAR Logo" />
              </div>
              <h3 className="text-3xl font-black text-slate-800 mb-2">UV Index: 8</h3>
              <div className="px-4 py-1.5 bg-orange-100 text-orange-600 rounded-full font-bold uppercase tracking-widest text-sm mb-6">High</div>
              <div className="w-full bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                <div className="flex justify-between text-sm font-bold text-slate-500 mb-2">
                  <span>Safe Exposure</span>
                  <span className="text-slate-800">30 mins</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="w-[70%] h-full bg-orange-500 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="w-full bg-white/60 backdrop-blur-lg border-y border-white py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-800 mb-4">Protect Your Skin Smarter</h2>
            <p className="text-slate-500 font-medium">Advanced technology making sun safety simple and personalized.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <article className="bg-slate-50 rounded-[32px] p-8 border border-slate-100 hover:-translate-y-2 transition-transform">
              <div className="w-14 h-14 bg-blue-100 text-blue-500 rounded-2xl flex items-center justify-center mb-6">
                <Activity className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Real-Time UV</h3>
              <p className="text-slate-500">Live localized UV tracking based on exact coordinates and current weather conditions.</p>
            </article>

            <article className="bg-slate-50 rounded-[32px] p-8 border border-slate-100 hover:-translate-y-2 transition-transform">
              <div className="w-14 h-14 bg-orange-100 text-orange-500 rounded-2xl flex items-center justify-center mb-6">
                <Camera className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">AI Skin Detection</h3>
              <p className="text-slate-500">Determine your Fitzpatrick skin type accurately using our secure computer vision scanner.</p>
            </article>

            <article className="bg-slate-50 rounded-[32px] p-8 border border-slate-100 hover:-translate-y-2 transition-transform">
              <div className="w-14 h-14 bg-green-100 text-green-500 rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Personalized Safety</h3>
              <p className="text-slate-500">Get specific safe exposure times tailored to your exact skin type and local risk level.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="w-full max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-4xl font-black text-slate-800 mb-6">Ready to check your sun risk safely?</h2>
        <Link to="/register" className="inline-block px-10 py-4 bg-slate-800 text-white rounded-2xl font-black text-lg hover:bg-slate-900 transition-colors shadow-xl">
          Create Free Account
        </Link>
      </section>
    </div>
  );
}
