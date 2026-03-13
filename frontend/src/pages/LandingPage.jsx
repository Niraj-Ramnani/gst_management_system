import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Zap, Shield, TrendingUp, FileText, ArrowRight, CheckCircle, BarChart3, Globe, Sparkles } from 'lucide-react'

const features = [
  { icon: FileText, title: 'AI Invoice Extraction', desc: 'Enterprise-grade neural networks extract GST fields from raw data with 99.9% precision.', color: 'text-primary-400' },
  { icon: BarChart3, title: 'Compliance Engine', desc: 'Real-time validation against the latest GST amendments and HSN/SAC master data.', color: 'text-success-400' },
  { icon: TrendingUp, title: 'Predictive Liabilities', desc: 'Advanced Prophet forecasting engine visualizes future tax outflows and ITC windows.', color: 'text-purple-400' },
  { icon: Globe, title: 'Universal Connectivity', desc: 'Seamlessly connects with common business tools and native GST portals for data syncing.', color: 'text-cyan-400' },
  { icon: Sparkles, title: 'Auto- Reconciliation', desc: 'Intelligent matching between your purchase registry and automated platform extractions.', color: 'text-amber-400' },
  { icon: Shield, title: 'Audit Readiness', desc: 'Maintain a pristine digital audit trail with tamper-proof logs and document storage.', color: 'text-danger-400' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 }
  }
}

const itemVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-primary-500/30 selection:text-white overflow-x-hidden">
      {/* Background Ornaments */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-900/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-900/10 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-purple-900/05 blur-[100px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
      </div>

      {/* Nav */}
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="sticky top-0 z-50 px-6 py-5"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3 rounded-2xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-xl shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-glow-primary">
              <Zap size={20} className="text-white" fill="white" />
            </div>
            <span className="font-display font-black text-xl tracking-tight">GST<span className="text-primary-400">Smart</span></span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/login" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">Sign In</Link>
            <Link to="/register" className="btn-primary text-xs font-bold uppercase tracking-widest px-6 py-3 rounded-xl">
              Get Started
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero */}
      <motion.section 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="max-w-7xl mx-auto px-6 pt-24 pb-32 text-center relative z-10"
      >
        <motion.div variants={itemVariants} className="inline-flex items-center gap-3 bg-white/[0.03] border border-white/[0.05] text-primary-400 text-[10px] font-black uppercase tracking-[0.2em] px-5 py-2 rounded-full mb-8 backdrop-blur-md">
          <Sparkles size={14} className="animate-pulse" />
          The Future of Indian Business Compliance
        </motion.div>
        
        <motion.h1 variants={itemVariants} className="font-display font-black text-6xl md:text-8xl text-white leading-[1.1] mb-8 tracking-[-0.03em]">
          Automate GST.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-cyan-400 to-primary-500 animate-gradient">Empower Growth.</span>
        </motion.h1>
        
        <motion.p variants={itemVariants} className="text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
          Leverage high-performance AI extraction and predictive forecasting to eliminate compliance bottlenecks. Designed for scale, built for speed.
        </motion.p>
        
        <motion.div variants={itemVariants} className="flex gap-5 justify-center flex-wrap">
          <Link to="/register" className="btn-primary flex items-center gap-3 px-8 py-4 text-sm font-bold uppercase tracking-widest group shadow-[0_20px_50px_rgba(14,165,233,0.3)]">
            Explore the Platform <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link to="/login" className="bg-white/05 hover:bg-white/10 border border-white/10 px-8 py-4 text-sm font-bold uppercase tracking-widest rounded-xl transition-all active:scale-95 text-slate-200">
             Watch Production Demo
          </Link>
        </motion.div>

        {/* Hero Decorative Elements */}
        <motion.div 
          variants={itemVariants}
          className="mt-24 relative max-w-5xl mx-auto"
        >
          <div className="absolute inset-0 bg-primary-500/20 blur-[100px] -z-10 animate-pulse-slow rounded-full opacity-50" />
          <div className="card-glass border border-white/10 rounded-[2.5rem] p-4 shadow-2xl overflow-hidden aspect-video relative group">
             <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent z-10" />
             <div className="w-full h-full bg-[#0b1120] rounded-[1.8rem] flex items-center justify-center text-slate-700 font-mono text-xs overflow-hidden">
                <div className="grid grid-cols-12 w-full h-full gap-4 p-8">
                   {[...Array(24)].map((_, i) => (
                      <div key={i} className="bg-white/[0.02] border border-white/[0.03] rounded-xl animate-pulse" style={{ animationDelay: `${i * 0.1}s`, height: `${Math.random() * 100 + 50}%` }} />
                   ))}
                </div>
                <div className="absolute inset-0 flex items-center justify-center z-20">
                    <div className="card-glass p-8 border-white/20 shadow-glow-primary scale-125">
                       <Zap size={48} className="text-white animate-float" fill="white" />
                    </div>
                </div>
             </div>
          </div>
        </motion.div>
      </motion.section>

      {/* Features */}
      <section className="bg-white/[0.02] border-y border-white/[0.05] relative z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-32">
          <div className="text-center mb-24">
            <h2 className="font-display font-black text-4xl text-white mb-4 tracking-tight">Enterprise Infrastructure.</h2>
            <p className="text-slate-500 font-medium">Powering the next generation of digital-first Indian companies.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map(({ icon: Icon, title, desc, color }) => (
              <motion.div 
                key={title} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="bg-white/[0.03] border border-white/[0.06] p-8 rounded-[2rem] hover:bg-white/[0.06] hover:border-white/[0.1] transition-all group cursor-default shadow-lg"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 bg-black/40 border border-white/5 group-hover:scale-110 transition-transform duration-500 shadow-inner`}>
                  <Icon size={24} className={color} strokeWidth={2.5} />
                </div>
                <h3 className="text-lg font-black text-white mb-4 tracking-tight">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed font-medium">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Checklist */}
      <section className="max-w-5xl mx-auto px-6 py-32 text-center relative z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="card-glass p-16 border border-white/10 rounded-[3rem] shadow-card relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 blur-3xl -mr-32 -mt-32 rounded-full" />
          <h2 className="font-display font-black text-3xl text-white mb-12 tracking-tight">Standard Operating Procedures</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {[
              'Universal Invoice Data Extraction',
              'HSN/SAC Validation Engine',
              'Real-time ITC Reconciliation',
              'Net Tax Liability Calculations',
              'Cross-Platform Document Audit',
              'GSTR-Ready Export Module',
              'Secure Cloud Document Vault',
            ].map(item => (
              <div key={item} className="flex items-center gap-4 text-sm font-bold text-slate-300 group/item">
                <div className="w-6 h-6 rounded-lg bg-primary-500/10 flex items-center justify-center border border-primary-500/20 group-hover/item:bg-primary-500 group-hover/item:text-white transition-all">
                   <CheckCircle size={14} strokeWidth={3} />
                </div>
                {item}
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.05] bg-black/20 relative z-10 px-6 py-20 text-center">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-8">
           <div className="flex items-center gap-3 opacity-50 grayscale hover:grayscale-0 transition-all cursor-default">
              <Zap size={24} className="text-primary-500" fill="currentColor" />
              <span className="font-display font-black text-2xl tracking-tighter">GSTSmart</span>
           </div>
           <p className="text-slate-600 text-[11px] font-black uppercase tracking-[0.3em] max-w-sm">
             Architected for Intelligence · Built for Scale · Designed for Accuracy
           </p>
           <div className="h-px w-24 bg-gradient-to-r from-transparent via-slate-800 to-transparent my-4" />
           <p className="text-slate-500 text-xs font-medium italic">
             © 2026 GSTSmart Intelligence Systems. All rights reserved.
           </p>
        </div>
      </footer>
    </div>
  )
}
