import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Zap, Shield, TrendingUp, FileText, ArrowRight, CheckCircle, BarChart3, Globe, Sparkles, Cpu, Layers, MousePointer2, Upload, Sun, Moon, Star, Menu } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import heroBg from '../assets/hero-bg.png'

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
      className="min-h-screen selection:bg-cyan-500/30 selection:text-white overflow-x-hidden transition-all duration-500"
      style={{
        backgroundColor: theme === 'light' ? '#f8fbfc' : '#050a14',
        color: theme === 'light' ? '#0a0f1e' : '#f1f5f9',
        fontFamily: "'Inter', sans-serif"
      }}
    >
      {/* Nav */}
      <motion.nav 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md transition-all duration-300 border-b"
        style={{
          backgroundColor: theme === 'light' ? 'rgba(255,255,255,0.9)' : 'rgba(10,15,30,0.85)',
          borderColor: 'rgba(255,255,255,0.05)'
        }}
      >
        <div className="max-w-[1440px] mx-auto flex items-center justify-between px-10 py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
              <Zap size={20} style={{ color: '#00b4f5' }} fill="#00b4f5" />
            </div>
            <span className="font-display font-black text-[22px] tracking-tight" style={{ color: theme === 'light' ? '#0a0f1e' : '#ffffff' }}>
              GST<span style={{ color: '#00b4f5' }}>Smart</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-12">
            {['PROCESS', 'ENGINE', 'COMPLIANCE'].map((link) => (
              <a 
                key={link}
                href={`#${link.toLowerCase()}`} 
                className="text-[11px] font-black uppercase tracking-[0.2em] transition-colors hover:text-[#00b4f5]"
                style={{ color: '#94a3b8' }}
              >
                {link}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
               <button onClick={toggleTheme} className="transition-transform hover:scale-110 active:scale-95">
                 {theme === 'dark' ? <Moon size={20} className="text-slate-400" /> : <Sun size={20} className="text-amber-500" />}
               </button>
               <Link to="/login" className="hidden sm:block text-xs font-bold uppercase tracking-widest text-[#94a3b8] hover:text-[#00b4f5]">Sign In</Link>
            </div>
            <Link to="/register" className="hidden md:block bg-[#00b4f5] text-[#050a14] text-[11px] font-black uppercase tracking-[0.15em] px-8 py-3.5 rounded-lg hover:brightness-110 transition-all active:scale-95 shadow-[0_4px_20px_rgba(0,180,245,0.2)]">
              Get Started
            </Link>
            <button className="md:hidden text-slate-400">
               <Menu size={24} />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section 
        className="relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Overlay */}
        <div 
          className="absolute inset-0 z-0 transition-colors duration-500"
          style={{
            backgroundColor: theme === 'light' ? 'rgba(240,248,255,0.85)' : 'rgba(5,10,20,0.6)'
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto px-5 pt-20">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-8"
            style={{
              borderColor: 'rgba(0,180,245,0.3)',
              backgroundColor: 'rgba(0,180,245,0.05)'
            }}
          >
            <Star size={10} style={{ color: '#00b4f5' }} fill="#00b4f5" />
            <span className="text-[10px] font-black uppercase tracking-[0.25em]" style={{ color: '#00b4f5' }}>
              The Future of Indian Business Compliance
            </span>
          </motion.div>

          <motion.h1 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-display leading-[0.95] mb-8 tracking-[-0.03em]"
            style={{ fontFamily: "'Syne', sans-serif", fontWeight: 900 }}
          >
            <span className="block text-[52px] md:text-[96px]" style={{ color: theme === 'light' ? '#0a0f1e' : '#ffffff' }}>
              Automate GST
            </span>
            <span className="block text-[52px] md:text-[96px]" style={{ color: '#00b4f5' }}>
              Empower Growth
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-base sm:text-[18px] max-w-[600px] mx-auto mb-12 leading-relaxed font-medium"
            style={{ color: theme === 'light' ? '#475569' : '#94a3b8' }}
          >
            Leverage high-performance AI extraction and predictive forecasting to eliminate compliance bottlenecks. Designed for scale, built for speed.
          </motion.p>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link 
              to="/register" 
              className="w-full sm:w-auto bg-[#00b4f5] text-[#050a14] font-bold px-8 py-3.5 rounded-full hover:brightness-110 transition-all active:scale-95 shadow-lg shadow-cyan-900/40"
            >
              Start Free Trial
            </Link>
            <Link 
              to="/login" 
              className="w-full sm:w-auto border-[1.5px] border-[#00b4f5] text-[#00b4f5] font-bold px-8 py-3.5 rounded-full hover:bg-cyan-500/10 transition-all active:scale-95"
            >
              Watch Demo
            </Link>
          </motion.div>
        </div>
      </section>

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
