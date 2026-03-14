import React, { createContext, useContext, useState, useEffect } from 'react';
import { invoiceService } from '../services/api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const { token } = useAuth();
    const [notifications, setNotifications] = useState(() => {
        const saved = localStorage.getItem('notifications');
        return saved ? JSON.parse(saved) : [];
    });
    const [pendingUploads, setPendingUploads] = useState(() => {
        const saved = localStorage.getItem('pendingUploads');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('notifications', JSON.stringify(notifications));
    }, [notifications]);

    useEffect(() => {
        localStorage.setItem('pendingUploads', JSON.stringify(pendingUploads));
    }, [pendingUploads]);

    // Polling for pending uploads
    useEffect(() => {
        if (!token || pendingUploads.length === 0) return;

        const poll = async () => {
            const updatedPending = [...pendingUploads];
            let changed = false;

            for (let i = 0; i < updatedPending.length; i++) {
                const upload = updatedPending[i];
                try {
                    const { data } = await invoiceService.get(upload.id);
                    if (data.status !== 'uploaded') {
                        // Parsing finished (success or failure)
                        addNotification({
                            title: data.status === 'parsed' ? 'Invoice Parsed' : 'Parsing Failed',
                            message: data.status === 'parsed' 
                                ? `Successfully extracted data from ${upload.filename}`
                                : `Could not extract data from ${upload.filename}`,
                            link: `/invoices/${data.id}`
                        });
                        updatedPending.splice(i, 1);
                        i--;
                        changed = true;
                    }
                } catch (err) {
                    if (err.response?.status === 404) {
                        // Invoice doesn't exist anymore, remove from polling
                        updatedPending.splice(i, 1);
                        i--;
                        changed = true;
                    }
                    console.error('Polling error:', err);
                }
            }

            if (changed) {
                setPendingUploads(updatedPending);
            }
        };

        const interval = setInterval(poll, 5000);
        return () => clearInterval(interval);
    }, [pendingUploads, token]);

    const addNotification = (notification) => {
        const newNotification = {
            id: Date.now(),
            read: false,
            timestamp: new Date().toISOString(),
            ...notification
        };
        setNotifications(prev => [newNotification, ...prev]);
    };

    const addPendingUpload = (id, filename) => {
        setPendingUploads(prev => [...prev, { id, filename }]);
    };

    const markAsRead = (id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const clearAll = () => {
        setNotifications([]);
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <NotificationContext.Provider value={{
            notifications,
            addNotification,
            addPendingUpload,
            markAsRead,
            markAllAsRead,
            clearAll,
            unreadCount
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};
