import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Zap, Shield, TrendingUp, FileText, ArrowRight, CheckCircle, BarChart3, Globe, Sparkles, Cpu, Layers, MousePointer2, Upload, Sun, Moon } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import heroVideo from '../assets/JKLU_Video.mp4'

const features = [
  { icon: FileText, title: 'AI Invoice Extraction', desc: 'Enterprise-grade neural networks extract GST fields from raw data with 99.9% precision.', color: 'text-primary-400' },
  { icon: BarChart3, title: 'Compliance Engine', desc: 'Real-time validation against the latest GST amendments and HSN/SAC master data.', color: 'text-success-400' },
  { icon: TrendingUp, title: 'Predictive Liabilities', desc: 'Advanced Prophet forecasting engine visualizes future tax outflows and ITC windows.', color: 'text-purple-400' },
  { icon: Globe, title: 'Universal Connectivity', desc: 'Seamlessly connects with common business tools and native GST portals for data syncing.', color: 'text-cyan-400' },
  { icon: Sparkles, title: 'Auto- Reconciliation', desc: 'Intelligent matching between your purchase registry and automated platform extractions.', color: 'text-amber-400' },
  { icon: Shield, title: 'Audit Readiness', desc: 'Maintain a pristine digital audit trail with tamper-proof logs and document storage.', color: 'text-danger-400' },
]

const steps = [
  { icon: Upload, title: "01. Direct Ingestion", desc: "Drag and drop high-resolution PDF scans or direct API hooks." },
  { icon: Cpu, title: "02. Neural Parsing", desc: "Our proprietary LLM extracts HSN, GSTIN, and line-item details." },
  { icon: Layers, title: "03. Data Harmonization", desc: "Auto-mapping against your ERP master data for reconciliation." },
  { icon: CheckCircle, title: "04. Compliance Ready", desc: "GSTR-ready outputs validated for 100% filing accuracy." }
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

const pulseVariants = {
  initial: { scale: 1, opacity: 0.5 },
  animate: { scale: [1, 1.05, 1], opacity: [0.5, 0.8, 0.5], transition: { duration: 4, repeat: Infinity, ease: "easeInOut" } }
}

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme()

  return (
    <div
      className="min-h-screen text-white selection:bg-primary-500/30 selection:text-white overflow-x-hidden transition-all duration-500"
      style={{
        backgroundColor: theme === 'light' ? '#f1f5f9' : '#020617',
        color: theme === 'light' ? '#0f172a' : '#f1f5f9',
      }}
    >
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
        <div
          className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3 rounded-2xl backdrop-blur-xl shadow-2xl border transition-all duration-300"
          style={{
            backgroundColor: theme === 'light' ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.02)',
            borderColor: theme === 'light' ? 'rgba(226,232,240,0.8)' : 'rgba(255,255,255,0.05)',
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-glow-primary">
              <Zap size={20} className="text-white" fill="white" />
            </div>
            <span className="font-display font-black text-xl tracking-tight" style={{ color: theme === 'light' ? '#0f172a' : '#f1f5f9' }}>GST<span className="text-primary-400">Smart</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 px-8">
            <a href="#process" className="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-primary-500 transition-all">Process</a>
            <a href="#features" className="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-primary-500 transition-all">Engine</a>
            <a href="#compliance" className="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-primary-500 transition-all">Compliance</a>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center border transition-all duration-300 hover:scale-105 active:scale-95 shrink-0"
              style={{
                backgroundColor: theme === 'light' ? 'rgba(14,165,233,0.1)' : 'rgba(255,255,255,0.04)',
                borderColor: theme === 'light' ? 'rgba(14,165,233,0.25)' : 'rgba(255,255,255,0.08)',
              }}
            >
              {theme === 'dark'
                ? <Moon size={15} className="text-slate-400" />
                : <Sun size={15} className="text-amber-500" />
              }
            </button>
            {/* Sign In — hidden on very small screens */}
            <Link to="/login" className="hidden sm:inline text-sm font-bold text-slate-400 hover:text-primary-400 transition-colors">Sign In</Link>
            <Link to="/register" className="btn-primary text-[10px] sm:text-xs font-bold uppercase tracking-widest px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl whitespace-nowrap">
              <span className="sm:hidden">Join</span>
              <span className="hidden sm:inline">Get Started</span>
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
        className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-16 sm:pb-28 text-center relative z-10"
      >
        <motion.div variants={itemVariants} className="inline-flex items-center gap-2 bg-white/[0.03] border border-white/[0.05] text-primary-400 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] px-3 sm:px-5 py-2 rounded-full mb-6 sm:mb-8 backdrop-blur-md">
          <Sparkles size={12} className="animate-pulse shrink-0" />
          <span>The Future of Indian Business Compliance</span>
        </motion.div>
        
        <motion.h1 variants={itemVariants} className="font-display font-black text-[2rem] sm:text-5xl md:text-7xl lg:text-8xl leading-tight sm:leading-[1.1] mb-6 sm:mb-8 tracking-tight sm:tracking-[-0.03em] break-words">
          Automate GST.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-cyan-400 to-primary-500">Empower Growth.</span>
        </motion.h1>
        
        <motion.p variants={itemVariants} className="text-base sm:text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-8 sm:mb-12 leading-relaxed font-medium px-2">
          Leverage high-performance AI extraction and predictive forecasting to eliminate compliance bottlenecks. Designed for scale, built for speed.
        </motion.p>
        
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3 sm:gap-5 justify-center items-center mb-16 sm:mb-24 px-4">
          <Link to="/register" className="btn-primary w-full sm:w-auto flex items-center justify-center gap-3 px-6 sm:px-8 py-3.5 sm:py-4 text-xs sm:text-sm font-bold uppercase tracking-widest group shadow-[0_20px_50px_rgba(14,165,233,0.3)]">
            Explore the Platform <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform shrink-0" />
          </Link>
          <Link to="/login" className="w-full sm:w-auto text-center border border-white/10 px-6 sm:px-8 py-3.5 sm:py-4 text-xs sm:text-sm font-bold uppercase tracking-widest rounded-xl transition-all active:scale-95 text-slate-200 hover:border-white/20 hover:bg-white/5">
             Watch Demo
          </Link>
        </motion.div>

        {/* Hero Decorative Elements */}
        <motion.div 
          variants={itemVariants}
          className="relative max-w-5xl mx-auto"
        >
          <div className="absolute inset-0 bg-primary-500/20 blur-[100px] -z-10 animate-pulse-slow rounded-full opacity-50" />
          <div className="card-glass border border-white/10 rounded-[2rem] sm:rounded-[2.5rem] p-2 sm:p-4 shadow-2xl overflow-hidden aspect-video relative group bg-black/40">
             <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent z-10 pointer-events-none" />
             <video 
               autoPlay 
               loop 
               muted 
               playsInline 
               className="w-full h-full object-cover rounded-[1.5rem] sm:rounded-[1.8rem] opacity-80 group-hover:opacity-100 transition-opacity duration-700"
             >
               <source src={heroVideo} type="video/mp4" />
             </video>
          </div>
        </motion.div>
      </motion.section>

      {/* Process Section */}
      <section id="process" className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 relative z-10">
        <div className="text-center mb-12 sm:mb-20">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-500 mb-4 block">The Workflow</span>
          <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl tracking-tight">How GSTSmart Operates.</h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 relative">
           {/* Connecting Line */}
           <div className="hidden md:block absolute top-1/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent z-0" />
           
           {[
             { icon: MousePointer2, title: "01. Intake", desc: "Drag and drop PDF scans or connect your ERP directly." },
             { icon: Cpu, title: "02. Analysis", desc: "Our neural engine extracts HSN, GSTIN, and tax fields." },
             { icon: Layers, title: "03. Matching", desc: "Auto-mapping against master data for ITC reconciliation." },
             { icon: CheckCircle, title: "04. Output", desc: "GSTR-ready filings validated with 100% precision." }
           ].map((step, idx) => (
             <motion.div 
               key={step.title}
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: idx * 0.1 }}
               className="relative z-10 group"
             >
                <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center mb-8 mx-auto group-hover:border-primary-500/50 group-hover:shadow-glow-primary transition-all duration-500">
                   <step.icon size={24} className="text-slate-400 group-hover:text-primary-400" />
                </div>
                <div className="text-center">
                   <h3 className="text-sm font-black text-white uppercase tracking-widest mb-3">{step.title}</h3>
                   <p className="text-slate-500 text-xs leading-relaxed font-medium px-4">{step.desc}</p>
                </div>
             </motion.div>
           ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-white/[0.02] border-y border-white/[0.05] relative z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="text-center mb-10 sm:mb-16">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-500 mb-4 block">Core Engine</span>
            <h2 className="font-display font-black text-3xl sm:text-4xl mb-3 sm:mb-4 tracking-tight">Enterprise Infrastructure.</h2>
            <p className="text-slate-500 font-medium text-sm sm:text-base">Powering the next generation of digital-first Indian companies.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-8">
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
      <section id="compliance" className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center relative z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="card-glass p-7 sm:p-12 md:p-16 border border-white/10 rounded-[2rem] sm:rounded-[3rem] shadow-card relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 blur-3xl -mr-32 -mt-32 rounded-full" />
          <h2 className="font-display font-black text-2xl sm:text-3xl mb-8 sm:mb-12 tracking-tight">Standard Operating Procedures</h2>
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

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 relative z-10">
         <div className="card-glass bg-gradient-to-br from-primary-900/20 to-transparent p-8 sm:p-16 md:p-24 border border-white/10 rounded-[2.5rem] sm:rounded-[4rem] text-center relative overflow-hidden">
            <motion.div 
               variants={pulseVariants}
               initial="initial"
               animate="animate"
               className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary-600/10 blur-[150px] -z-10 rounded-full" 
            />
            <h2 className="font-display font-black text-4xl sm:text-5xl md:text-7xl mb-6 sm:mb-8 tracking-tighter">Ready to Scale?</h2>
            <p className="text-slate-400 text-base sm:text-lg mb-8 sm:mb-12 max-w-xl mx-auto font-medium">Join 500+ enterprises automating their GST compliance with military precision.</p>
            <Link to="/register" className="btn-primary inline-flex items-center gap-3 px-8 sm:px-12 py-4 sm:py-5 text-xs sm:text-sm font-bold uppercase tracking-widest group">
               Create Business Account <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform shrink-0" />
            </Link>
         </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.05] bg-black/20 relative z-10 px-4 sm:px-6 py-12 sm:py-20 text-center">
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
