import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Zap, Shield, TrendingUp, FileText, ArrowRight, CheckCircle, BarChart3, Globe, Sparkles, Cpu, Layers, MousePointer2, Upload, Sun, Moon, Star, Menu } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import heroBg from '../assets/hero-bg.png'
import promoVideo from '../assets/JKLU_Video.mp4'

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
              Start 15 Days Free Trial
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 1. Stats Bar */}
      <section 
        className="w-full relative z-10 py-10 px-8 sm:px-20 transition-colors duration-500 border-b border-white/[0.05]"
        style={{ backgroundColor: theme === 'light' ? '#ffffff' : '#080d1a' }}
      >
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-center gap-12 md:gap-0">
          {[
            { value: "3X Faster", label: "THAN MANUAL GST FILING" },
            { value: "99.8%", label: "Extraction Accuracy" },
            { value: "10s", label: "Average Filing Time" }
          ].map((stat, idx) => (
            <div key={idx} className="flex-1 flex text-center justify-center items-center group w-full relative">
              <div className="flex flex-col items-center">
                <span className="font-display font-black text-4xl sm:text-5xl text-[#00b4f5] tracking-tight mb-2 group-hover:scale-110 transition-transform duration-300">
                  {stat.value}
                </span>
                <span 
                  className="text-xs sm:text-sm font-bold uppercase tracking-widest"
                  style={{ color: theme === 'light' ? '#64748b' : '#94a3b8' }}
                >
                  {stat.label}
                </span>
              </div>
              {/* Divider */}
              {idx < 2 && (
                <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 h-16 w-px bg-white/10" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 2. Workflow Section */}
      <section 
        id="workflow" 
        className="max-w-[1440px] mx-auto px-4 sm:px-6 py-16 sm:py-24 relative z-10 transition-colors duration-500 rounded-3xl my-12"
        style={{ 
          backgroundColor: theme === 'light' ? '#f8fafc' : '#080d1a',
          color: theme === 'light' ? '#0f172a' : '#ffffff' 
        }}
      >
        <div className="text-center mb-16 sm:mb-24">
          <span className="text-[11px] font-black uppercase tracking-[0.3em] text-[#00b4f5] mb-4 block">The Workflow</span>
          <h2 className="font-display font-black text-4xl sm:text-5xl md:text-6xl tracking-tight text-inherit">How GSTSmart Operates.</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-0 relative">
           {/* Horizontal Connecting Line */}
           <div 
             className="hidden md:block absolute top-[44px] left-24 right-24 h-px z-0" 
             style={{ backgroundColor: theme === 'light' ? 'rgba(15, 23, 42, 0.1)' : 'rgba(255,255,255,0.1)' }}
           />
           
           {[
             { num: "01.", title: "INTAKE", icon: Upload, desc: "Upload PDFs or connect via API" },
             { num: "02.", title: "ANALYSIS", icon: Cpu, desc: "DocTR OCR reads your invoice and automatically extracts GSTIN, amount, date and tax rate fields." },
             { num: "03.", title: "MATCHING", icon: Layers, desc: "Seller and buyer state codes are compared to automatically split tax into CGST plus SGST or IGST." },
             { num: "04.", title: "OUTPUT", icon: CheckCircle, desc: "Generate flawless return files" }
           ].map((step, idx) => (
             <motion.div 
               key={step.title}
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: idx * 0.1 }}
               className="relative z-10 flex flex-col items-center text-center group"
             >
                <div 
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:-translate-y-2 border border-transparent group-hover:border-[#00b4f5]/30 group-hover:shadow-[0_8px_30px_rgba(0,180,245,0.2)]"
                  style={{ backgroundColor: theme === 'light' ? '#ffffff' : '#0f1729', boxShadow: theme === 'light' ? '0 4px 20px rgba(0,0,0,0.05)' : 'none' }}
                >
                   <step.icon size={28} className="text-slate-500 group-hover:text-[#00b4f5] transition-colors" />
                </div>
                <div className="flex flex-col items-center">
                   <h3 className="text-[11px] font-black text-[#00b4f5] uppercase tracking-widest mb-1">{step.num} {step.title}</h3>
                   <h4 className="text-lg font-black tracking-tight mb-2 text-inherit">{step.title} Process</h4>
                   <p className="text-sm font-medium leading-relaxed max-w-[200px]" style={{ color: theme === 'light' ? '#64748b' : '#94a3b8' }}>
                     {step.desc}
                   </p>
                </div>
             </motion.div>
           ))}
        </div>
      </section>

      {/* 3. Features Section */}
      <section 
        id="features" 
        className="w-full py-16 sm:py-24 transition-colors duration-500"
        style={{ backgroundColor: theme === 'light' ? '#ffffff' : '#0a0f1e' }}
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
          <div className="text-center mb-16 sm:mb-20">
            <span className="text-[11px] font-black uppercase tracking-[0.3em] text-[#00b4f5] mb-4 block">WHY GSTSMART</span>
            <h2 
              className="font-display font-black text-4xl sm:text-5xl md:text-6xl tracking-tight"
              style={{ color: theme === 'light' ? '#0f172a' : '#ffffff' }}
            >
              Built for Indian Businesses
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              { 
                icon: Zap, 
                badge: "AI POWERED",
                title: "AI Invoice Parsing", 
                desc: "Instantly digitize and validate thousands of unstructured invoices with 99.8% precision.",
                highlights: ["Upload PDF CSV or Manual", "Auto GSTIN extraction", "99.8% accuracy"]
              },
              { 
                icon: Shield, 
                badge: "ML DETECTION",
                title: "Fraud Detection", 
                desc: "Identify ghost invoices, duplicate claims, and suspicious GSTINs before they enter your ledger.",
                highlights: ["Duplicate invoice detection", "Abnormal amount flagging", "Pre-filing fraud alerts"]
              },
              { 
                icon: TrendingUp, 
                badge: "PREDICTIVE",
                title: "GST Forecasting", 
                desc: "Predict cash flow impacts and optimize working capital with our predictive tax liability models.",
                highlights: ["12 month trend analysis", "Next 3 months prediction", "Cash flow planning"]
              }
            ].map(({ icon: Icon, badge, title, desc, highlights }) => (
              <motion.div 
                key={title} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="group relative p-12 rounded-[16px] transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col items-start min-h-[320px]"
                style={{ 
                  backgroundColor: theme === 'light' ? '#ffffff' : '#0d1424', 
                  border: theme === 'light' ? '1px solid rgba(0,180,245,0.2)' : '1px solid rgba(0,180,245,0.25)',
                  boxShadow: '0 -2px 20px rgba(0,180,245,0.08) inset'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(0,180,245,0.6)';
                  e.currentTarget.style.filter = 'brightness(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = theme === 'light' ? 'rgba(0,180,245,0.2)' : 'rgba(0,180,245,0.25)';
                  e.currentTarget.style.filter = 'brightness(1)';
                }}
              >
                {/* Top Accent Line */}
                <div className="absolute top-0 left-0 w-full h-[3px] bg-[#00b4f5] opacity-30 transition-opacity duration-300 group-hover:opacity-100" />
                
                {/* Feature Badge */}
                <div className="mb-6 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider"
                  style={{
                    backgroundColor: theme === 'light' ? 'rgba(0,180,245,0.06)' : 'rgba(0,180,245,0.1)',
                    borderColor: 'rgba(0,180,245,0.3)',
                    color: '#00b4f5'
                  }}
                >
                  {badge}
                </div>

                {/* Icon Container */}
                <div className="w-[64px] h-[64px] rounded-lg bg-[rgba(0,180,245,0.12)] border border-[rgba(0,180,245,0.08)] flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110">
                  <Icon size={28} className="text-[#00b4f5]" />
                </div>

                {/* Divider */}
                <div className="w-8 h-px bg-[#00b4f5] opacity-20 mb-6" />

                <h3 
                  className="text-xl font-black mb-4 tracking-tight"
                  style={{ color: theme === 'light' ? '#0a0f1e' : '#ffffff' }}
                >
                  {title}
                </h3>
                
                <p className="text-sm leading-relaxed font-medium mb-6" style={{ color: theme === 'light' ? '#64748b' : '#c0ccda' }}>
                  {desc}
                </p>

                {/* Feature Highlights */}
                <div className="flex flex-col gap-3 mb-auto">
                  {highlights.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#00b4f5]" />
                      <span className="text-[13px] font-medium" style={{ color: theme === 'light' ? '#475569' : '#94a3b8' }}>
                        {item}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Learn More Row */}
                <div className="w-full pt-8 flex items-center justify-end">
                   <Link to="/features" className="group/link flex items-center gap-2 text-sm font-bold text-[#00b4f5] hover:brightness-110 transition-all">
                      Learn More <ArrowRight size={16} className="transition-transform group-hover/link:translate-x-1" />
                   </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. CTA Section */}
      <section 
        className="w-full py-20 sm:py-32 relative z-10 transition-colors duration-500 overflow-hidden"
        style={{ backgroundColor: theme === 'light' ? '#f8fbfc' : '#050a14' }}
      >
         <div className="max-w-[1440px] mx-auto px-4 sm:px-8 relative z-10 flex flex-col md:flex-row items-center gap-[60px]">
            {/* Left Column: Video Player */}
            <div className="w-full md:w-1/2">
               <div className="relative rounded-[16px] overflow-hidden border border-[rgba(0,180,245,0.3)] shadow-[0_0_30px_rgba(0,180,245,0.15)]">
                  <video 
                    src={promoVideo} 
                    autoPlay 
                    muted 
                    loop 
                    playsInline 
                    className="w-full h-full object-cover rounded-[16px]"
                  />
               </div>
            </div>

            {/* Right Column: Content */}
            <div className="w-full md:w-1/2 flex flex-col justify-center text-center md:text-left">
               <motion.h2 
                 initial={{ y: 20, opacity: 0 }}
                 whileInView={{ y: 0, opacity: 1 }}
                 viewport={{ once: true }}
                 className="font-display font-black text-4xl sm:text-5xl md:text-7xl mb-6 tracking-tighter"
                 style={{ color: theme === 'light' ? '#0f172a' : '#ffffff' }}
               >
                 Ready to Automate Your GST?
               </motion.h2>
               
               <motion.p 
                 initial={{ y: 20, opacity: 0 }}
                 whileInView={{ y: 0, opacity: 1 }}
                 viewport={{ once: true }}
                 transition={{ delay: 0.1 }}
                 className="text-base sm:text-lg md:text-xl mb-12 font-medium"
                 style={{ color: theme === 'light' ? '#475569' : '#94a3b8' }}
               >
                 Zero setup fees. Immediate ROI. Welcome to the new standard of Indian tax compliance.
               </motion.p>
               
               <motion.div 
                 initial={{ y: 20, opacity: 0 }}
                 whileInView={{ y: 0, opacity: 1 }}
                 viewport={{ once: true }}
                 transition={{ delay: 0.2 }}
                 className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start items-center"
               >
                 <Link 
                   to="/register" 
                   className="w-full sm:w-auto bg-[#00b4f5] text-[#050a14] font-bold px-10 py-4 rounded-full hover:brightness-110 transition-all active:scale-95 shadow-[0_8px_30px_rgba(0,180,245,0.3)] text-lg text-center"
                 >
                   Start 15 Days Free Trial
                 </Link>
               </motion.div>
            </div>
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
