import { Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useTheme } from '../../context/ThemeContext'
import Sidebar from './Sidebar'
import TopNav from './TopNav'
import ChatAssistant from '../ui/ChatAssistant'

export default function AppLayout() {
  const location = useLocation()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { theme } = useTheme()

  // Close sidebar when route changes on mobile
  useEffect(() => {
    setIsSidebarOpen(false)
  }, [location.pathname])

  return (
    <div 
      className="flex h-screen overflow-hidden transition-colors duration-300"
      style={{ backgroundColor: theme === 'light' ? '#f8fafc' : '#050a14' }}
    >
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <div className="flex flex-col flex-1 overflow-hidden relative">
        <TopNav onMenuClick={() => setIsSidebarOpen(true)} />
        
        <main className="flex-1 overflow-y-auto scroll-smooth">
          <div className="max-w-[1600px] mx-auto p-8 pb-24">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
        
        <ChatAssistant />
      </div>
    </div>
  )
}
