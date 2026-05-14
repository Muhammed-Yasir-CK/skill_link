import React from 'react';
import { Briefcase } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-slate-900 text-slate-300 py-2 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-1">
                        <div className="flex items-center gap-2 mb-2">
                            <img src="/logo.png" alt="SkillLink Logo" className="h-14 w-auto object-contain" />
                            <span className="text-xl font-bold text-white">SkillLink</span>
                        </div>
                        <p className="text-sm text-slate-400">
                            Connecting the world's best talent with the world's best companies.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-white font-semibold mb-2">For Candidates</h3>
                        <ul className="space-y-1 text-sm">
                            <li><a href="#" className="hover:text-white transition-colors">Browse Jobs</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Browse Companies</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-white font-semibold mb-2">For Employers</h3>
                        <ul className="space-y-1 text-sm">
                            <li><a href="#" className="hover:text-white transition-colors">Post a Job</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Hiring Advice</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-white font-semibold mb-2">Company</h3>
                        <ul className="space-y-1 text-sm">
                            <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-slate-800 mt-2 pt-2 text-right text-sm text-slate-500">
                    © {new Date().getFullYear()} SkillLink. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
