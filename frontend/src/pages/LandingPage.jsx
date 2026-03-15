import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Zap, Shield, TrendingUp, FileText, ArrowRight, CheckCircle, BarChart3, Globe, Sparkles, Cpu, Layers, MousePointer2, Upload, Sun, Moon, Star, Menu, Check, Crown, IndianRupee } from 'lucide-react'
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
          backgroundColor: theme === 'light' ? '#ffffff' : 'rgba(10,15,30,0.85)',
          borderColor: theme === 'light' ? '#e2e8f0' : 'rgba(255,255,255,0.05)',
          boxShadow: theme === 'light' ? '0 1px 20px rgba(0,0,0,0.08)' : 'none'
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
            {[
              { label: 'PROCESS', id: 'workflow' },
              { label: 'ENGINE', id: 'features' },
              { label: 'PRICING', id: 'pricing' },
              { label: 'COMPLIANCE', id: 'cta' }
            ].map(({ label, id }) => (
              <a 
                key={label}
                href={`#${id}`} 
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`text-[12px] font-black uppercase tracking-[0.25em] transition-colors ${
                  theme === 'light' ? 'text-[#374151] hover:text-[#2563eb]' : 'text-[#94a3b8] hover:text-[#00b4f5]'
                }`}
              >
                {label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
               <button onClick={toggleTheme} className="transition-transform hover:scale-110 active:scale-95">
                 {theme === 'dark' ? <Moon size={20} className="text-slate-400" /> : <Sun size={20} className="text-amber-500" />}
               </button>
               <Link 
                 to="/login" 
                 className={`hidden sm:block text-[13px] font-bold uppercase tracking-widest transition-colors ${
                   theme === 'light' ? 'text-[#374151] hover:text-[#2563eb]' : 'text-[#94a3b8] hover:text-[#00b4f5]'
                 }`}
               >
                 Sign In
               </Link>
            </div>
            <Link 
              to="/register" 
              className="hidden md:block text-[12px] font-black uppercase tracking-[0.15em] px-8 py-3.5 rounded-lg hover:brightness-110 transition-all active:scale-95"
              style={{
                backgroundColor: theme === 'light' ? '#2563eb' : '#00b4f5',
                color: theme === 'light' ? '#ffffff' : '#050a14',
                boxShadow: theme === 'light' ? '0 4px 20px rgba(37,99,235,0.3)' : '0 4px 20px rgba(0,180,245,0.2)'
              }}
            >
              Get Started
            </Link>
            <button className="md:hidden" style={{ color: theme === 'light' ? '#374151' : '#94a3b8' }}>
               <Menu size={24} />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section 
        className="relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden transition-all duration-500"
        style={{
          backgroundImage: theme === 'light' 
            ? 'radial-gradient(circle at center, rgba(255,255,255,0.8) 0%, transparent 60%), linear-gradient(135deg, #e8f0fe 0%, #dbeafe 30%, #d1fae5 70%, #ffffff 100%)'
            : `url(${heroBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Overlay */}
        {/* Geometric Overlay */}
        <div 
          className="absolute inset-0 z-0 transition-all duration-500"
          style={{
            backgroundColor: theme === 'light' ? 'transparent' : 'rgba(5,10,20,0.6)',
            backgroundImage: theme === 'light' ? 'radial-gradient(rgba(99,102,241,0.06) 1px, transparent 1px)' : 'none',
            backgroundSize: theme === 'light' ? '24px 24px' : 'auto'
          }}
        />

        {/* Bottom Blending Gradient */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-24 md:h-32 z-[5] pointer-events-none transition-all duration-500"
          style={{
            background: `linear-gradient(to bottom, transparent 0%, ${theme === 'light' ? '#ffffff' : '#080d1a'} 100%)`,
            border: 'none'
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto px-5 pt-32 pb-24">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center justify-center gap-2 px-6 py-2 rounded-full border mb-8 transition-colors duration-300 max-w-full text-center"
            style={{
              borderColor: theme === 'light' ? '#bfdbfe' : 'rgba(0,180,245,0.3)',
              backgroundColor: theme === 'light' ? '#eff6ff' : 'rgba(0,180,245,0.05)'
            }}
          >
            <Star size={12} className="shrink-0" style={{ color: theme === 'light' ? '#2563eb' : '#00b4f5' }} fill={theme === 'light' ? '#2563eb' : "#00b4f5"} />
            <span className="text-[11px] sm:text-[13px] font-black uppercase tracking-widest sm:tracking-[0.25em]" style={{ color: theme === 'light' ? '#2563eb' : '#00b4f5' }}>
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
            <span className="block text-[12vw] sm:text-[52px] md:text-[96px] transition-colors duration-300" style={{ color: theme === 'light' ? '#0f172a' : '#ffffff' }}>
              Automate GST
            </span>
            <span className="block text-[12vw] sm:text-[52px] md:text-[96px] transition-colors duration-300" style={{ color: theme === 'light' ? '#2563eb' : '#00b4f5' }}>
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
              className="w-full sm:w-auto font-bold px-8 py-3.5 rounded-full hover:brightness-110 transition-all active:scale-95"
              style={{
                backgroundColor: theme === 'light' ? '#2563eb' : '#00b4f5',
                color: theme === 'light' ? '#ffffff' : '#050a14',
                boxShadow: theme === 'light' ? '0 4px 24px rgba(37,99,235,0.3)' : '0 4px 20px rgba(0,180,245,0.4)'
              }}
            >
              Start 15 Days Free Trial
            </Link>
          </motion.div>
        </div>
      </section>

      <section 
        className="w-full relative z-10 py-12 md:py-16 px-8 sm:px-20 transition-all duration-500 border-b"
        style={{ 
          backgroundColor: theme === 'light' ? '#ffffff' : '#080d1a',
          boxShadow: theme === 'light' ? '0 4px 24px rgba(0,0,0,0.06)' : 'none',
          borderColor: theme === 'light' ? '#e2e8f0' : 'rgba(255,255,255,0.05)'
        }}
      >
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-center gap-12 md:gap-0">
          {[
            { value: "3X Faster", label: "THAN MANUAL GST FILING" },
            { value: "99.8%", label: "Extraction Accuracy" },
            { value: "10s", label: "Average Filing Time" }
          ].map((stat, idx) => (
            <div key={idx} className="flex-1 flex text-center justify-center items-center group w-full relative">
              <div className="flex flex-col items-center">
                <span 
                  className="font-display font-black text-4xl sm:text-5xl tracking-tight mb-2 group-hover:scale-110 transition-all duration-300"
                  style={{ color: theme === 'light' ? '#2563eb' : '#00b4f5' }}
                >
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
                <div 
                  className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 h-16 w-px transition-colors duration-300" 
                  style={{ backgroundColor: theme === 'light' ? '#e2e8f0' : 'rgba(255,255,255,0.1)' }}
                />
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
          <span className="text-[13px] font-black uppercase tracking-[0.3em] mb-4 block transition-colors duration-300" style={{ color: theme === 'light' ? '#2563eb' : '#00b4f5' }}>The Workflow</span>
          <h2 className="font-display font-black text-4xl sm:text-5xl md:text-6xl tracking-tight transition-colors duration-300" style={{ color: theme === 'light' ? '#0f172a' : '#ffffff' }}>How GSTSmart Operates.</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-0 relative">
           <div 
             className="hidden md:block absolute top-[44px] left-24 right-24 h-px z-0 transition-colors duration-300" 
             style={{ backgroundColor: theme === 'light' ? '#e2e8f0' : 'rgba(255,255,255,0.1)' }}
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
               whileHover={{ y: -5 }}
               viewport={{ once: true }}
               transition={{ delay: idx * 0.1 }}
               className="relative z-10 flex flex-col items-center text-center group"
             >
                <motion.div 
                  whileHover={{ 
                    scale: 1.1, 
                    rotate: 5,
                    boxShadow: theme === 'light' ? '0 15px 30px rgba(37,99,235,0.15)' : '0 15px 30px rgba(0,180,245,0.25)' 
                  }}
                  className="w-24 h-24 rounded-3xl flex items-center justify-center mb-6 transition-all duration-500 border relative overflow-hidden"
                  style={{ 
                    backgroundColor: theme === 'light' ? '#ffffff' : '#0f1729', 
                    boxShadow: theme === 'light' ? '0 4px 20px rgba(0,0,0,0.05)' : 'none',
                    borderColor: theme === 'light' ? '#e2e8f0' : 'rgba(255,255,255,0.05)'
                  }}
                >
                   {/* Background Glow */}
                   <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-blue-500/10 to-transparent" />
                   
                   <step.icon size={32} className="relative z-10 text-slate-500 group-hover:text-[#00b4f5] transition-all duration-300 transform group-hover:scale-110" style={{ color: theme === 'light' ? '#2563eb' : undefined }} />
                </motion.div>
                <div className="flex flex-col items-center">
                   <h3 className="text-[13px] font-black uppercase tracking-[0.2em] mb-2 transition-colors duration-300" style={{ color: theme === 'light' ? '#2563eb' : '#00b4f5' }}>{step.num} {step.title}</h3>
                   <h4 className="text-xl font-black tracking-tight mb-3 transition-colors duration-300" style={{ color: theme === 'light' ? '#1e293b' : '#ffffff' }}>{step.title} Process</h4>
                   <p className="text-[15px] font-medium leading-relaxed max-w-[220px] transition-colors duration-300 opacity-80" style={{ color: theme === 'light' ? '#64748b' : '#94a3b8' }}>
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
            <span className="text-[13px] font-black uppercase tracking-[0.3em] mb-4 block transition-colors duration-300" style={{ color: theme === 'light' ? '#2563eb' : '#00b4f5' }}>WHY GSTSMART</span>
            <h2 
              className="font-display font-black text-4xl sm:text-5xl md:text-6xl tracking-tight transition-colors duration-300"
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
                whileHover={{ 
                  y: -10,
                  rotateX: 5,
                  rotateY: -5,
                  transition: { duration: 0.4, ease: "easeOut" }
                }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="group relative p-12 rounded-[24px] transition-all duration-500 overflow-hidden flex flex-col items-start min-h-[460px] perspective-1000"
                style={{ 
                  backgroundColor: theme === 'light' ? '#ffffff' : '#0d1424', 
                  border: theme === 'light' ? '1px solid #e2e8f0' : '1px solid rgba(0,180,245,0.15)',
                  boxShadow: theme === 'light' ? '0 10px 30px rgba(0,0,0,0.04)' : '0 10px 40px rgba(0,0,0,0.2)',
                  transformStyle: 'preserve-3d'
                }}
              >
                {/* Glow Effect Overlay */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                  style={{
                    background: theme === 'light' 
                      ? 'radial-gradient(circle at center, rgba(37,99,235,0.05) 0%, transparent 70%)'
                      : 'radial-gradient(circle at center, rgba(0,180,245,0.15) 0%, transparent 70%)'
                  }}
                />

                {/* Top Accent Line */}
                <motion.div 
                  className="absolute top-0 left-0 h-[4px] bg-gradient-to-r from-transparent via-blue-500 to-transparent w-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ backgroundColor: theme === 'light' ? '#2563eb' : '#00b4f5' }}
                />
                
                {/* Feature Badge */}
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="mb-8 px-4 py-1.5 rounded-full border text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 z-10"
                  style={{
                    backgroundColor: theme === 'light' ? '#eff6ff' : 'rgba(0,180,245,0.08)',
                    borderColor: theme === 'light' ? '#bfdbfe' : 'rgba(0,180,245,0.2)',
                    color: theme === 'light' ? '#2563eb' : '#00b4f5',
                    transform: 'translateZ(20px)'
                  }}
                >
                  {badge}
                </motion.div>

                {/* Icon Container */}
                <motion.div 
                  whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                  className="w-[72px] h-[72px] rounded-2xl border flex items-center justify-center mb-8 transition-all duration-500 relative z-10"
                  style={{
                    backgroundColor: theme === 'light' ? '#ffffff' : 'rgba(255,255,255,0.03)',
                    borderColor: theme === 'light' ? '#e2e8f0' : 'rgba(255,255,255,0.08)',
                    boxShadow: theme === 'light' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                    transform: 'translateZ(40px)'
                  }}
                >
                  <Icon size={32} className="transition-colors duration-300" style={{ color: theme === 'light' ? '#2563eb' : '#00b4f5' }} />
                </motion.div>

                <h3 
                  className="text-2xl font-black mb-4 tracking-tight transition-colors duration-300 relative z-10"
                  style={{ 
                    color: theme === 'light' ? '#0f172a' : '#ffffff',
                    transform: 'translateZ(30px)'
                  }}
                >
                  {title}
                </h3>
                
                <p 
                  className="text-[15px] leading-relaxed font-medium mb-8 transition-colors duration-300 relative z-10" 
                  style={{ 
                    color: theme === 'light' ? '#475569' : '#94a3b8',
                    transform: 'translateZ(20px)'
                  }}
                >
                  {desc}
                </p>

                {/* Feature Highlights */}
                <div className="flex flex-col gap-4 mb-auto relative z-10" style={{ transform: 'translateZ(10px)' }}>
                  {highlights.map((item, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ x: -10, opacity: 0 }}
                      whileInView={{ x: 0, opacity: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-3 group/item"
                    >
                      <div className="w-1.5 h-1.5 rounded-full transition-all duration-300 group-hover/item:scale-150" style={{ backgroundColor: theme === 'light' ? '#2563eb' : '#00b4f5' }} />
                      <span className="text-sm font-semibold transition-colors duration-300" style={{ color: theme === 'light' ? '#64748b' : '#cbd5e1' }}>
                        {item}
                      </span>
                    </motion.div>
                  ))}
                </div>

                {/* Learn More Row */}
                <div className="w-full pt-10 flex items-center justify-end relative z-10" style={{ transform: 'translateZ(20px)' }}>
                   <Link to="/features" className="group/link flex items-center gap-2 text-sm font-black uppercase tracking-widest hover:brightness-110 transition-all" style={{ color: theme === 'light' ? '#2563eb' : '#00b4f5' }}>
                      Learn More <ArrowRight size={18} className="transition-transform group-hover/link:translate-x-2" />
                   </Link>
                </div>

                {/* Corner Accent */}
                <div 
                  className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full blur-3xl opacity-0 group-hover:opacity-40 transition-opacity duration-700" 
                  style={{ backgroundColor: theme === 'light' ? '#3b82f6' : '#00b4f5' }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section 
        id="pricing"
        className="w-full py-16 sm:py-24 transition-colors duration-500 relative z-10 border-b"
        style={{ 
          backgroundColor: theme === 'light' ? '#f8fbfc' : '#050a14',
          borderColor: theme === 'light' ? '#e2e8f0' : 'rgba(255,255,255,0.05)'
        }}
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="text-center mb-16">
            <span className="text-[11px] font-black uppercase tracking-[0.3em] mb-4 block transition-colors duration-300" style={{ color: theme === 'light' ? '#2563eb' : '#00b4f5' }}>
              PRICING
            </span>
            <h2 
              className="font-display font-black text-4xl sm:text-5xl md:text-6xl tracking-tight mb-4 transition-colors duration-300"
              style={{ color: theme === 'light' ? '#0f172a' : '#ffffff' }}
            >
              Simple Transparent Pricing
            </h2>
            <p className="text-base sm:text-lg font-medium transition-colors duration-300" style={{ color: theme === 'light' ? '#475569' : '#94a3b8' }}>
              No hidden fees. No surprises. Cancel anytime.
            </p>
          </div>

          {/* Cards Container */}
          <div className="max-w-[900px] mx-auto flex flex-col md:flex-row gap-8 justify-center">
            
            {/* Pay Per Invoice Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex-1 rounded-[24px] p-8 flex flex-col relative overflow-hidden transition-all duration-300"
              style={{
                backgroundColor: theme === 'light' ? '#ffffff' : '#0d1424',
                border: theme === 'light' ? '1px solid #e2e8f0' : '1px solid rgba(0,180,245,0.2)',
                boxShadow: theme === 'light' ? '0 4px 24px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              {/* Badge */}
              <div 
                className="self-start mb-6 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-colors duration-300 border"
                style={{
                  backgroundColor: theme === 'light' ? '#eff6ff' : 'rgba(37,99,235,0.1)',
                  borderColor: theme === 'light' ? '#bfdbfe' : 'rgba(37,99,235,0.3)',
                  color: theme === 'light' ? '#2563eb' : '#3b82f6'
                }}
              >
                FLEXIBLE
              </div>

              {/* Icon & Price */}
              <div className="mb-8">
                <IndianRupee size={24} className="mb-4 transition-colors duration-300" style={{ color: theme === 'light' ? '#2563eb' : '#00b4f5' }} />
                <div className="flex items-baseline gap-2">
                  <span className="font-display font-black text-5xl transition-colors duration-300" style={{ color: theme === 'light' ? '#2563eb' : '#00b4f5' }}>₹150</span>
                </div>
                <span className="text-sm font-medium mt-1 block transition-colors duration-300" style={{ color: theme === 'light' ? '#64748b' : '#94a3b8' }}>per invoice</span>
              </div>

              <div className="w-full h-px mb-8 transition-colors duration-300" style={{ backgroundColor: theme === 'light' ? '#e2e8f0' : 'rgba(255,255,255,0.1)' }} />

              {/* Features List */}
              <div className="flex flex-col gap-4 mb-10 grow">
                {[
                  "Upload single or bulk invoices",
                  "AI data extraction included",
                  "GST calculation included",
                  "Download GSTR reports",
                  "No monthly commitment"
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Check size={18} className="shrink-0 mt-0.5 transition-colors duration-300" style={{ color: theme === 'light' ? '#2563eb' : '#3b82f6' }} />
                    <span className="text-sm font-medium transition-colors duration-300" style={{ color: theme === 'light' ? '#475569' : '#cbd5e1' }}>{item}</span>
                  </div>
                ))}
              </div>

              <button 
                className="w-full py-4 rounded-xl font-bold text-sm transition-all duration-300 border-[1.5px] hover:bg-opacity-10"
                style={{
                  borderColor: theme === 'light' ? '#2563eb' : '#00b4f5',
                  color: theme === 'light' ? '#2563eb' : '#00b4f5',
                  backgroundColor: 'transparent'
                }}
              >
                Get Started
              </button>
            </motion.div>

            {/* Monthly Subscription Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="flex-1 rounded-[24px] p-8 flex flex-col relative overflow-hidden transition-all duration-300 transform md:-translate-y-4"
              style={{
                backgroundColor: theme === 'light' ? '#ffffff' : '#0d1424',
                border: theme === 'light' ? '2px solid #93c5fd' : '2px solid rgba(0,180,245,0.5)',
                boxShadow: theme === 'light' ? '0 10px 40px rgba(147,197,253,0.3)' : '0 10px 40px rgba(0,180,245,0.15)'
              }}
            >
              {/* Popular Badge */}
              <div 
                className="self-start mb-6 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-colors duration-300"
                style={{
                  backgroundColor: theme === 'light' ? '#2563eb' : '#00b4f5',
                  color: theme === 'light' ? '#ffffff' : '#050a14'
                }}
              >
                MOST POPULAR
              </div>

              {/* Icon & Price */}
              <div className="mb-8">
                <Crown size={28} className="mb-4 transition-colors duration-300" style={{ color: theme === 'light' ? '#2563eb' : '#00b4f5' }} />
                <div className="flex items-baseline gap-2">
                  <span className="font-display font-black text-5xl transition-colors duration-300" style={{ color: theme === 'light' ? '#2563eb' : '#00b4f5' }}>₹999</span>
                </div>
                <div className="flex flex-col mt-1">
                  <span className="text-sm font-medium transition-colors duration-300" style={{ color: theme === 'light' ? '#64748b' : '#94a3b8' }}>per month</span>
                  <span className="text-xs font-bold line-through mt-1 transition-colors duration-300" style={{ color: theme === 'light' ? '#16a34a' : '#10b981' }}>Save vs per invoice pricing</span>
                </div>
              </div>

              <div className="w-full h-px mb-8 transition-colors duration-300" style={{ backgroundColor: theme === 'light' ? '#e2e8f0' : 'rgba(255,255,255,0.1)' }} />

              {/* Features List */}
              <div className="flex flex-col gap-4 mb-10 grow">
                {[
                  "Unlimited invoice uploads",
                  "AI OCR extraction unlimited",
                  "All GST calculations included",
                  "GSTR-1 and GSTR-3B reports",
                  "Fraud detection on all invoices",
                  "GST liability forecasting",
                  "Priority support"
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Check size={18} className="shrink-0 mt-0.5 transition-colors duration-300" style={{ color: theme === 'light' ? '#2563eb' : '#00b4f5' }} />
                    <span className="text-sm font-bold transition-colors duration-300" style={{ color: theme === 'light' ? '#0f172a' : '#ffffff' }}>{item}</span>
                  </div>
                ))}
              </div>

              <Link 
                to="/register"
                className="w-full py-4 rounded-xl font-black text-sm text-center transition-all duration-300 hover:brightness-110 active:scale-[0.98]"
                style={{
                  backgroundColor: theme === 'light' ? '#2563eb' : '#00b4f5',
                  color: theme === 'light' ? '#ffffff' : '#050a14',
                  boxShadow: theme === 'light' ? '0 4px 20px rgba(37,99,235,0.4)' : '0 4px 20px rgba(0,180,245,0.3)'
                }}
              >
                Start Free Trial
              </Link>
            </motion.div>
          </div>

          {/* Reassurance text */}
          <div className="mt-12 flex justify-center items-center gap-2 text-sm font-medium transition-colors duration-300" style={{ color: theme === 'light' ? '#64748b' : '#94a3b8' }}>
            <Shield size={16} /> All plans include bank-grade security and GST portal compliance.
          </div>
        </div>
      </section>

      {/* 4. CTA Section */}
      <section 
        id="cta"
        className="w-full py-20 sm:py-32 relative z-10 transition-colors duration-500 overflow-hidden"
        style={{ 
          background: theme === 'light' 
            ? 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' 
            : '#050a14' 
        }}
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
            <div 
              className="w-full md:w-1/2 flex flex-col justify-center text-center md:text-left transition-all duration-300"
              style={theme === 'light' ? {
                backgroundColor: '#ffffff',
                padding: '48px',
                borderRadius: '24px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.04)'
              } : {}}
            >
               <motion.h2 
                 initial={{ y: 20, opacity: 0 }}
                 whileInView={{ y: 0, opacity: 1 }}
                 viewport={{ once: true }}
                 className="font-display font-black text-4xl sm:text-5xl md:text-7xl mb-6 tracking-tighter transition-colors duration-300"
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
                   className="w-full sm:w-auto font-bold px-10 py-4 rounded-full hover:brightness-110 transition-all active:scale-95 text-lg text-center"
                   style={{
                     backgroundColor: theme === 'light' ? '#2563eb' : '#00b4f5',
                     color: theme === 'light' ? '#ffffff' : '#050a14',
                     boxShadow: theme === 'light' ? '0 8px 30px rgba(37,99,235,0.3)' : '0 8px 30px rgba(0,180,245,0.3)'
                   }}
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
