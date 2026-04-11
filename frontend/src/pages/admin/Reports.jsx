import React, { useState } from 'react';
import { ShieldAlert, Trash2, Ban } from 'lucide-react';

const Reports = () => {
    // Mock Data
    const [reports, setReports] = useState([
        { id: 1, type: 'Job', subject: 'Easy Money Home Work', reporter: 'john.doe@email.com', reason: 'Scam / Phishing', status: 'Pending' },
        { id: 2, type: 'Company', subject: 'Fake Corp Ltd', reporter: 'sarah.smith@email.com', reason: 'Fake company data', status: 'Pending' },
        { id: 3, type: 'Job', subject: 'Data Entry', reporter: 'mike.check@email.com', reason: 'Asking for payment', status: 'Resolved' },
    ]);

    const handleAction = (id, action) => {
        // In real app, this would delete item or suspend user
        if (confirm(`Are you sure you want to ${action} this reported item?`)) {
            setReports(reports.map(report =>
                report.id === id ? { ...report, status: 'Resolved' } : report
            ));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-brand-navy">Reports & Complaints</h1>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-slate-600">Type</th>
                            <th className="px-6 py-4 font-semibold text-slate-600">Subject</th>
                            <th className="px-6 py-4 font-semibold text-slate-600">Reported By</th>
                            <th className="px-6 py-4 font-semibold text-slate-600">Reason</th>
                            <th className="px-6 py-4 font-semibold text-slate-600">Status</th>
                            <th className="px-6 py-4 font-semibold text-slate-600 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {reports.map((report) => (
                            <tr key={report.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-medium">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${report.type === 'Job' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                                        }`}>
                                        {report.type}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-brand-navy font-medium">{report.subject}</td>
                                <td className="px-6 py-4 text-slate-500">{report.reporter}</td>
                                <td className="px-6 py-4 text-red-500">{report.reason}</td>
                                <td className="px-6 py-4">
                                    <span className={`text-sm ${report.status === 'Resolved' ? 'text-green-600' : 'text-orange-500'}`}>
                                        {report.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {report.status !== 'Resolved' && (
                                        <div className="flex justify-end gap-2">
                                            {report.type === 'Job' ? (
                                                <button
                                                    onClick={() => handleAction(report.id, 'remove')}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" /> Remove Job
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleAction(report.id, 'suspend')}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-600 rounded-lg text-sm font-medium hover:bg-orange-100 transition-colors"
                                                >
                                                    <Ban className="w-4 h-4" /> Suspend Company
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Reports;
