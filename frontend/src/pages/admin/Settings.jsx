import React, { useState } from 'react';
import { Megaphone, Power, Lock, Loader2 } from 'lucide-react';
import Notification from '../../components/Notification';
import api from '../../api/axios';

const Settings = () => {
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [announcement, setAnnouncement] = useState('');
    const [notification, setNotification] = useState({
        isVisible: false,
        type: 'success',
        message: ''
    });

    const [passwords, setPasswords] = useState({
        old: '',
        new: '',
        confirm: ''
    });
    const [updatingPassword, setUpdatingPassword] = useState(false);

    const hideNotification = () => setNotification(prev => ({ ...prev, isVisible: false }));

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            setNotification({ isVisible: true, type: 'error', message: "Passwords don't match" });
            return;
        }

        setUpdatingPassword(true);
        try {
            await api.post('accounts/change-password/', {
                old_password: passwords.old,
                new_password: passwords.new
            });
            setNotification({ isVisible: true, type: 'success', message: "Password updated successfully" });
            setPasswords({ old: '', new: '', confirm: '' });
        } catch (err) {
            setNotification({
                isVisible: true,
                type: 'error',
                message: err.response?.data?.old_password?.[0] || err.response?.data?.new_password?.[0] || "Failed to update password"
            });
        } finally {
            setUpdatingPassword(false);
        }
    };

    const handlePostAnnouncement = (e) => {
        e.preventDefault();
        setNotification({
            isVisible: true,
            type: 'success',
            message: `Announcement Posted: ${announcement}`
        });
        setAnnouncement('');
    };

    return (
        <div className="space-y-8 max-w-4xl">
            <Notification 
                {...notification}
                onClose={hideNotification}
            />
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-brand-navy">Platform Settings</h1>
            </div>

            {/* Admin Profile */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                <div className="flex items-center gap-2 mb-6 text-lg font-semibold text-brand-navy">
                    <Lock className="w-5 h-5 text-brand-accent" />
                    <h2>Change Password</h2>
                </div>

                <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Old Password</label>
                        <input
                            type="password"
                            value={passwords.old}
                            onChange={(e) => setPasswords({ ...passwords, old: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent/50"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                        <input
                            type="password"
                            value={passwords.new}
                            onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent/50"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
                        <input
                            type="password"
                            value={passwords.confirm}
                            onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent/50"
                            required
                        />
                    </div>
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={updatingPassword}
                            className="bg-brand-navy text-white px-6 py-2 rounded-lg hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 min-w-[140px] bg-blue-900"
                        >
                            {updatingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update Password"}
                        </button>
                    </div>
                </form>
            </div>

            {/* Maintenance Mode */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${maintenanceMode ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-500'}`}>
                        <Power className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-brand-navy">Maintenance Mode</h2>
                        <p className="text-sm text-slate-500">Disable access to the platform for all users</p>
                    </div>
                </div>

                <button
                    onClick={() => setMaintenanceMode(!maintenanceMode)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${maintenanceMode ? 'bg-brand-accent' : 'bg-slate-200'
                        }`}
                >
                    <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                            }`}
                    />
                </button>
            </div>

            {/* Announcements */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                <div className="flex items-center gap-2 mb-4 text-lg font-semibold text-brand-navy">
                    <Megaphone className="w-5 h-5 text-brand-accent" />
                    <h2>System Announcement</h2>
                </div>

                <form onSubmit={handlePostAnnouncement}>
                    <textarea
                        value={announcement}
                        onChange={(e) => setAnnouncement(e.target.value)}
                        placeholder="Write an announcement visible to all users..."
                        rows="3"
                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent/50 mb-4 resize-none"
                    />
                    <div className="flex justify-end">
                        <button type="submit" className="bg-brand-navy text-white px-6 py-2.5 rounded-lg hover:bg-slate-800 transition-colors font-medium">
                            Post Announcement
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Settings;
