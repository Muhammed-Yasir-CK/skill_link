import React, { useState } from 'react';
import { Search, Check, X, Trash2 } from 'lucide-react';

const JobModeration = () => {
    const [searchTerm, setSearchTerm] = useState('');

    // Mock Data
    const [jobs, setJobs] = useState([
        { id: 1, title: 'Senior Frontend Developer', company: 'Tech Innovations', postedDate: '2024-03-20', status: 'Pending' },
        { id: 2, title: 'Marketing Manager', company: 'Creative Studio', postedDate: '2024-03-19', status: 'Approved' },
        { id: 3, title: 'Data Entry Clerk', company: 'Fast Cash Ltd', postedDate: '2024-03-21', status: 'Pending' },
        { id: 4, title: 'Backend Engineer', company: 'Global Logistics', postedDate: '2024-03-18', status: 'Rejected' },
    ]);

    const handleAction = (id, action) => {
        // In a real app, this would call an API
        if (action === 'Remove') {
            if (window.confirm('Are you sure you want to remove this job post as Scam?')) {
                setJobs(jobs.filter(job => job.id !== id));
            }
            return;
        }

        setJobs(jobs.map(job =>
            job.id === id ? { ...job, status: action } : job
        ));
    };

    const filteredJobs = jobs.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-brand-navy">Job Post Moderation</h1>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search jobs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent/50 w-64"
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-slate-600">Job Title</th>
                            <th className="px-6 py-4 font-semibold text-slate-600">Company</th>
                            <th className="px-6 py-4 font-semibold text-slate-600">Posted Date</th>
                            <th className="px-6 py-4 font-semibold text-slate-600">Status</th>
                            <th className="px-6 py-4 font-semibold text-slate-600 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredJobs.map((job) => (
                            <tr key={job.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-brand-navy">{job.title}</td>
                                <td className="px-6 py-4 text-slate-500">{job.company}</td>
                                <td className="px-6 py-4 text-slate-500">{job.postedDate}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${job.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                            job.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-red-100 text-red-700'
                                        }`}>
                                        {job.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        {job.status === 'Pending' && (
                                            <>
                                                <button
                                                    onClick={() => handleAction(job.id, 'Approved')}
                                                    className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                                                    title="Approve"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleAction(job.id, 'Rejected')}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                    title="Reject"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </>
                                        )}

                                        <button
                                            onClick={() => handleAction(job.id, 'Remove')}
                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                            title="Remove as Scam"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default JobModeration;
