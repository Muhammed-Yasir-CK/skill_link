import React from 'react';
import { Bell } from 'lucide-react';

const Notifications = () => {
    return (
        <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Notifications</h2>
            <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
                {[1, 2, 3].map(i => (
                    <div key={i} className="p-6 hover:bg-slate-50 transition-colors flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                            <Bell className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-slate-800 font-medium">New job alert: Senior React Developer at TechCorp</p>
                            <p className="text-sm text-slate-500 mt-1">2 hours ago</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Notifications;
