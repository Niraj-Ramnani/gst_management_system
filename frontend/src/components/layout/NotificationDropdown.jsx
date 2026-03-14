import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Bell, Trash2, Calendar, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import clsx from 'clsx';

export default function NotificationDropdown({ isOpen, onClose }) {
    const { notifications, markAsRead, markAllAsRead, clearAll } = useNotification();
    const navigate = useNavigate();

    const handleNotificationClick = (n) => {
        markAsRead(n.id);
        if (n.link) {
            navigate(n.link);
        }
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={onClose} />
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-4 w-96 bg-surface-900 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Notifications</h3>
                                {notifications.some(n => !n.read) && (
                                    <span className="bg-primary-500 text-[10px] font-bold text-white px-1.5 py-0.5 rounded-full">
                                        NEW
                                    </span>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={markAllAsRead} 
                                    className="text-[10px] text-slate-400 hover:text-primary-400 font-bold uppercase transition-colors"
                                    title="Mark all as read"
                                >
                                    <Check size={14} className="inline mr-1" /> Read All
                                </button>
                                <button 
                                    onClick={clearAll} 
                                    className="text-[10px] text-slate-400 hover:text-danger-400 font-bold uppercase transition-colors"
                                    title="Clear all"
                                >
                                    <Trash2 size={12} className="inline mr-1" /> Clear
                                </button>
                            </div>
                        </div>

                        {/* List */}
                        <div className="max-h-[32rem] overflow-y-auto custom-scrollbar">
                            {notifications.length > 0 ? (
                                <div className="divide-y divide-white/5">
                                    {notifications.map((n) => (
                                        <div
                                            key={n.id}
                                            onClick={() => handleNotificationClick(n)}
                                            className={clsx(
                                                "p-4 cursor-pointer transition-all hover:bg-white/[0.03] group relative",
                                                !n.read ? "bg-primary-500/5" : "opacity-80"
                                            )}
                                        >
                                            {!n.read && (
                                                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary-500" />
                                            )}
                                            <div className="flex gap-3">
                                                <div className={clsx(
                                                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-white/5",
                                                    !n.read ? "bg-primary-500/20 text-primary-400" : "bg-slate-800 text-slate-500"
                                                )}>
                                                    <Bell size={18} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start mb-0.5">
                                                        <p className={clsx(
                                                            "text-sm font-semibold truncate pr-2",
                                                            !n.read ? "text-white" : "text-slate-400"
                                                        )}>
                                                            {n.title}
                                                        </p>
                                                        <span className="text-[10px] text-slate-500 flex items-center gap-1 whitespace-nowrap mt-0.5">
                                                            <Calendar size={10} /> {formatDistanceToNow(new Date(n.timestamp), { addSuffix: true })}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                                        {n.message}
                                                    </p>
                                                    {n.link && (
                                                        <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-primary-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                                            View Details <ArrowRight size={10} />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-16 flex flex-col items-center justify-center text-center px-8">
                                    <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4 text-slate-600">
                                        <Bell size={32} />
                                    </div>
                                    <h4 className="text-white font-bold text-sm mb-1">All caught up!</h4>
                                    <p className="text-slate-500 text-xs max-w-[200px]">
                                        You don't have any notifications right now.
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
