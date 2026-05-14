import React, { useState, useEffect } from 'react';
import { Bell, Briefcase, FileText, CreditCard, CheckCircle, Info } from 'lucide-react';
import api from '../../api/axios';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const { fetchUnreadCount } = useNotifications();

    const fetchNotifications = async () => {
        try {
            const response = await api.get('accounts/notifications/');
            setNotifications(response.data.notifications);
            fetchUnreadCount(); // Sync count
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markAsRead = async (id) => {
        try {
            await api.patch(`accounts/notifications/${id}/`);
            setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
            fetchUnreadCount(); // Update sidebar instantly
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.post('accounts/notifications/');
            setNotifications(notifications.map(n => ({ ...n, is_read: true })));
            fetchUnreadCount(); // Update sidebar instantly
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'application': return <Briefcase className="w-5 h-5" />;
            case 'agreement': return <FileText className="w-5 h-5" />;
            case 'payment': return <CreditCard className="w-5 h-5" />;
            case 'match': return <CheckCircle className="w-5 h-5" />;
            default: return <Info className="w-5 h-5" />;
        }
    };

    const getColorClass = (type) => {
        switch (type) {
            case 'application': return 'bg-blue-100 text-blue-600';
            case 'agreement': return 'bg-purple-100 text-purple-600';
            case 'payment': return 'bg-green-100 text-green-600';
            case 'match': return 'bg-amber-100 text-amber-600';
            default: return 'bg-slate-100 text-slate-600';
        }
    };

    if (loading) return <div className="p-12 text-center text-slate-500">Loading notifications...</div>;

    return (
        <div className="animate-fade-in max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Notifications</h2>
                {notifications.some(n => !n.is_read) && (
                    <button 
                        onClick={markAllAsRead}
                        className="text-sm font-medium text-brand-blue hover:underline"
                    >
                        Mark all as read
                    </button>
                )}
            </div>

            {notifications.length > 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden divide-y divide-slate-100">
                    {notifications.map((n) => (
                        <div 
                            key={n.id} 
                            onClick={() => !n.is_read && markAsRead(n.id)}
                            className={`p-5 hover:bg-slate-50/80 transition-all flex gap-4 cursor-pointer ${!n.is_read ? 'bg-blue-50/30' : ''}`}
                        >
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${getColorClass(n.type)}`}>
                                {getIcon(n.type)}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <p className={`text-[15px] ${!n.is_read ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                                        {n.title}
                                    </p>
                                    {!n.is_read && <div className="w-2 h-2 rounded-full bg-brand-blue mt-2" />}
                                </div>
                                <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                                    {n.message}
                                </p>
                                <div className="flex items-center gap-4 mt-3">
                                    <p className="text-xs font-medium text-slate-400">
                                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                                    </p>
                                    {n.link && (
                                        <Link 
                                            to={n.link}
                                            className="text-xs font-bold text-brand-blue hover:text-brand-navy transition-colors"
                                        >
                                            View Details →
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-200 border-dashed p-16 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Bell className="w-8 h-8 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">No notifications yet</h3>
                    <p className="text-slate-500">We'll notify you when you get updates on your applications or jobs.</p>
                </div>
            )}
        </div>
    );
};

export default Notifications;
