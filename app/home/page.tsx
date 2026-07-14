"use client";

import React, { useMemo } from 'react';
import { motion, Variants } from 'framer-motion';
import { ArrowRight, Leaf, Sprout, Coins, Database, PieChart, TrendingUp, LineChart, MapPin, Shield, Zap, BarChart2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function LandingPageKedelaiVibrant() {
  const router = useRouter();

  // Optimasi 1: Gunakan useMemo untuk mencegah re-evaluasi objek animasi pada setiap render
  const floatingAnimation = useMemo(() => (delay: number) => ({
    initial: { y: 0, rotate: 0 },
    animate: {
      y: [0, -15, 0],
      rotate: [0, 3, -3, 0],
      transition: {
        duration: 6,
        repeat: Infinity,
        delay: delay,
        ease: "easeInOut" as const
      }
    }
  }), []);

  // Animasi masuk untuk scroll (Dibuat lebih ringan)
  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans overflow-x-hidden selection:bg-emerald-500/30 relative">

      {/* ─── DYNAMIC COLORFUL & GRID BACKGROUND ─── */}
      <div className="fixed inset-0 z-0 pointer-events-none">

        <div className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e1_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e1_1px,transparent_1px)] bg-[size:40px_40px] opacity-30 [mask-image:linear-gradient(to_bottom,white_30%,transparent_90%)]" />

        <div className="absolute -top-20 -left-20 w-[500px] h-[500px] bg-emerald-100/50 rounded-full blur-[80px]" />
        <div className="absolute top-1/4 -right-20 w-[400px] h-[400px] bg-amber-100/50 rounded-full blur-[80px]" />
        <div className="absolute bottom-10 left-1/3 w-[400px] h-[400px] bg-rose-50/40 rounded-full blur-[80px]" />
      </div>

      {/* ─── NAVBAR ─── */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-sm border-b border-slate-100 bg-white/80 transform-gpu">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="relative h-12 w-56">
            <Image
              src="/LOGO VER SATU DATA.png"
              alt="Logo Satu Data Pertanian Jatim"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-contain"
              priority
            />
          </div>
          <div className="hidden md:flex items-center gap-6">
            <div className="flex flex-col items-end">
              <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold">Official Platform</span>
              <span className="text-sm font-semibold text-emerald-700">Provinsi Jawa Timur</span>
            </div>
          </div>
        </div>
      </nav>

      {/* ─── MAIN HERO ─── */}
      <section className="pt-40 pb-16 px-6 max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12">

          <div className="flex-1 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="will-change-transform"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-600 text-white text-xs font-bold tracking-widest uppercase mb-6 shadow-md">
                <Database className="w-3.5 h-3.5" />
                Agri-Data Intelligence
              </span>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 leading-[1.1]">
                Modernisasi <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-amber-500">
                  Data Kedelai
                </span>
              </h1>
              <p className="mt-8 text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed">
                Visualisasi data pertanian terpadu Jawa Timur. Pantau produksi,
                stok, dan harga kedelai dalam satu dashboard interaktif yang futuristik.
              </p>

              <div className="mt-10">
                <button
                  onClick={() => router.push('/dashboard/produktivitas-jatim')}
                  className="group relative inline-flex items-center justify-center gap-4 bg-emerald-600 text-white px-10 py-5 rounded-2xl text-lg font-bold shadow-xl shadow-emerald-200/50 hover:bg-emerald-700 hover:shadow-emerald-300/60 transition-all duration-200"
                >
                  Go to Dashboard
                  <div className="p-1 bg-white/20 rounded-lg group-hover:translate-x-1 transition-transform">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </button>
              </div>
            </motion.div>
          </div>

          <div className="flex-1 relative w-full max-w-lg aspect-square mt-10 lg:mt-0">
            <motion.div
              {...floatingAnimation(0)}
              className="absolute inset-0 flex items-center justify-center z-20 will-change-transform"
            >
              <div className="relative w-64 h-64 md:w-80 md:h-80 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-[3rem] shadow-[0_20px_40px_-15px_rgba(16,185,129,0.4)] flex items-center justify-center border-4 border-white">
                <Sprout className="w-32 h-32 md:w-44 md:h-44 text-white" />

              <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 4 }}
                  className="absolute -top-6 -right-6 w-20 h-20 bg-amber-400 rounded-2xl shadow-lg flex items-center justify-center border-4 border-white rotate-12 will-change-transform"
                >
                  {/* Ikon tumpukan koin dimasukkan ke sini */}
                  <Coins className="w-10 h-10 text-white" strokeWidth={2} />
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              {...floatingAnimation(1)}
              className="absolute top-15 left-15 p-4 bg-white rounded-3xl shadow-lg border border-slate-100 z-30 will-change-transform"
            >
              <TrendingUp className="w-10 h-10 text-emerald-500" />
            </motion.div>

            <motion.div
              {...floatingAnimation(1.5)}
              className="absolute bottom-10 right-10 p-3 bg-white rounded-2xl shadow-lg border z-30 will-change-transform flex items-center justify-center"
            >
              <Image
                src="/LOGO ONLY SATU DATA.png"
                alt="Logo Satu Data Pertanian Jatim"
                width={160}
                height={160}
                className="w-25 h-25 object-contain"
                priority
              />
            </motion.div>

            <div className="absolute inset-0 border-[5px] border-dashed border-slate-200 rounded-full animate-spin" style={{ animationDuration: '30s' }} />
          </div>
        </div>
      </section>

      {/* ─── STATS / HIGHLIGHTS ─── */}
      <section className="py-12 px-6 max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "DATA REAL-TIME", color: "bg-emerald-50 text-emerald-700" },
            { label: "38 KOTA DI JAWA TIMUR", color: "bg-amber-50 text-amber-700" },
            { label: "AKURASI TINGGI", color: "bg-blue-50 text-blue-700" },
            { label: "INTEGRASI API", color: "bg-rose-50 text-rose-700" }
          ].map((item, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl ${item.color} text-center font-bold text-sm shadow-sm border border-black/5 cursor-default hover:-translate-y-1 transition-transform duration-200`}
            >
              {item.label}
            </div>
          ))}
        </div>
      </section>

      {/* ─── SCROLLABLE FEATURES SECTION ─── */}
      <section className="py-24 px-6 max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">Infrastruktur Data Terpadu</h2>
          <p className="text-slate-500 max-w-2xl mx-auto">Dirancang menggunakan pendekatan arsitektur modern untuk memastikan akurasi dan kecepatan penyampaian informasi strategis.</p>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "0px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {/* Card 1 */}
          <motion.div variants={fadeInUp} className="group p-8 rounded-3xl bg-white/90 backdrop-blur-sm border border-slate-100 shadow-lg shadow-slate-200/40 hover:-translate-y-2 transition-transform duration-200 will-change-transform">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center text-emerald-600 mb-6 border border-emerald-100">
              <LineChart className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">Fluktuasi Harga</h3>
            <p className="text-slate-500 font-medium leading-relaxed">
              Pantau pergerakan harga kedelai di tingkat petani hingga konsumen secara harian dengan grafik interaktif.
            </p>
          </motion.div>

          {/* Card 2 */}
          <motion.div variants={fadeInUp} className="group p-8 rounded-3xl bg-white/90 backdrop-blur-sm border border-slate-100 shadow-lg shadow-slate-200/40 hover:-translate-y-2 transition-transform duration-200 will-change-transform">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center text-amber-600 mb-6 border border-amber-100">
              <MapPin className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">Pemetaan Spasial</h3>
            <p className="text-slate-500 font-medium leading-relaxed">
              Identifikasi daerah surplus dan defisit kedelai di Jawa Timur menggunakan peta sebaran komprehensif.
            </p>
          </motion.div>

          {/* Card 3 */}
          <motion.div variants={fadeInUp} className="group p-8 rounded-3xl bg-white/90 backdrop-blur-sm border border-slate-100 shadow-lg shadow-slate-200/40 hover:-translate-y-2 transition-transform duration-200 will-change-transform">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center text-emerald-600 mb-6 border border-emerald-100">
              <Leaf className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">Ketahanan Pangan</h3>
            <p className="text-slate-500 font-medium leading-relaxed">
              Analisis data pasokan untuk mendukung pengambilan keputusan dan kebijakan pertanian daerah.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* ─── INFORMASI SECTION ─── */}
      <section className="py-20 px-6 max-w-7xl mx-auto relative z-10">
        <div className="rounded-3xl bg-white border border-slate-100 shadow-md overflow-hidden transform-gpu">
          <div className="flex flex-col lg:flex-row">
            {/* Left Panel */}
            <div className="flex-1 p-10 lg:p-14 border-b lg:border-b-0 lg:border-r border-slate-100">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700 mb-4">Mengapa Platform Ini</p>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-6 leading-tight">
                Satu Sumber Data, <br /> Banyak Keputusan Tepat
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed mb-8">
                Platform ini hadir sebagai jawaban atas kebutuhan data pertanian yang terfragmentasi. Dengan mengintegrasikan data dari berbagai sumber resmi, kami memastikan setiap stakeholder—dari petani hingga pengambil kebijakan—mendapatkan gambaran yang akurat dan terkini.
              </p>
              <div className="space-y-4">
                {[
                  { icon: <Shield className="w-4 h-4" />, text: "Data bersumber dari instansi pemerintah resmi & BPS" },
                  { icon: <Zap className="w-4 h-4" />, text: "Pembaruan data berkala secara otomatis & terstruktur" },
                  { icon: <BarChart2 className="w-4 h-4" />, text: "Visualisasi analitik yang mudah dipahami semua kalangan" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-0.5 w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center shrink-0">
                      {item.icon}
                    </div>
                    <p className="text-slate-600 text-sm font-medium pt-1.5">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Panel */}
            <div className="flex-1 p-10 lg:p-14 bg-slate-50/60">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-8">Cakupan Data</p>
              <div className="space-y-5">
                {[
                  { label: "Produksi Kedelai Tahunan", value: "~400.000 Ton", pct: 75, color: "bg-emerald-500" },
                  { label: "Luas Panen", value: "~290.000 Ha", pct: 60, color: "bg-amber-400" },
                  { label: "Harga Petani (Rata-rata)", value: "Rp 9.500/kg", pct: 50, color: "bg-blue-500" },
                  { label: "Kabupaten Sentra Kedelai", value: "12 Kabupaten", pct: 32, color: "bg-rose-400" },
                ].map((stat, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-sm font-semibold text-slate-700">{stat.label}</span>
                      <span className="text-sm font-bold text-slate-900">{stat.value}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden transform-gpu">
                      <div className={`h-full ${stat.color} rounded-full`} style={{ width: `${stat.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 pt-8 border-t border-slate-200 grid grid-cols-2 gap-4">
                {[
                  { label: "Tahun Data Tersedia", value: "2015–2024" },
                  { label: "Frekuensi Update", value: "Bulanan" },
                  { label: "Sumber Data", value: "BPS & Dinas" },
                  { label: "Format Ekspor", value: "CSV / Excel" },
                ].map((info, i) => (
                  <div key={i} className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
                    <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-widest mb-1">{info.label}</p>
                    <p className="text-sm font-bold text-slate-800">{info.value}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── CTA BOTTOM ─── */}
      <section className="py-16 px-6 max-w-7xl mx-auto relative z-10">
        <div className="rounded-3xl bg-emerald-700 text-white text-center px-8 py-16 relative overflow-hidden transform-gpu">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:32px_32px]" />

          <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-500/30 rounded-full blur-[60px]" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-amber-400/20 rounded-full blur-[60px]" />

          <div className="relative z-10">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300 mb-4">Mulai Sekarang</p>
            <h2 className="text-3xl md:text-4xl font-black mb-4">Siap Mengakses Data?</h2>
            <p className="text-emerald-100 max-w-xl mx-auto text-base leading-relaxed mb-10">
              Buka dashboard interaktif dan temukan wawasan mendalam tentang komoditas kedelai Jawa Timur secara gratis.
            </p>
            <button
              onClick={() => router.push('/dashboard/produktivitas-jatim')}
              className="group inline-flex items-center gap-3 bg-white text-emerald-800 px-8 py-4 rounded-xl text-base font-bold hover:bg-emerald-50 transition-colors duration-200 shadow-lg"
            >
              Buka Dashboard
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
            </button>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="relative z-10 border-t border-slate-200 bg-white py-8 px-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Leaf className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Satu Data Pertanian Jatim</span>
        </div>
        <p className="text-[11px] text-slate-400 font-medium">
          © {new Date().getFullYear()} PEMPROV JAWA TIMUR. ALL RIGHTS RESERVED.
        </p>
      </footer>
    </div>
  );
}