import React from 'react';
import { Search, MapPin, Filter } from 'lucide-react';

const SearchBar = ({ onSearch, filters, setFilters, categories }) => {
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 mb-8 transition-all hover:shadow-2xl hover:shadow-slate-200/60">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-5 relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-blue transition-colors">
                        <Search className="w-5 h-5" />
                    </div>
                    <input
                        type="text"
                        name="query"
                        placeholder="Job title, keywords, or company"
                        className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all font-medium text-slate-700 placeholder-slate-400"
                        value={filters.query}
                        onChange={handleChange}
                    />
                </div>

                <div className="md:col-span-3 relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-blue transition-colors">
                        <MapPin className="w-5 h-5" />
                    </div>
                    <input
                        type="text"
                        name="location"
                        placeholder="City, state, or zip"
                        className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all font-medium text-slate-700 placeholder-slate-400"
                        value={filters.location}
                        onChange={handleChange}
                    />
                </div>

                <div className="md:col-span-2 relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-blue transition-colors">
                        <Filter className="w-5 h-5" />
                    </div>
                    <select
                        name="category"
                        className="w-full pl-12 pr-8 py-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all appearance-none font-medium text-slate-700"
                        value={filters.category}
                        onChange={handleChange}
                    >
                        <option value="">Category</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                <div className="md:col-span-2">
                    <button
                        onClick={onSearch}
                        className="w-full h-full bg-brand-navy hover:bg-brand-primary text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-brand-navy/20 hover:shadow-brand-navy/30 hover:-translate-y-0.5"
                    >
                        Find Jobs
                    </button>
                </div>
            </div>

            {/* Advanced Filters */}
            <div className="flex flex-wrap gap-3 mt-5 pt-5 border-t border-slate-100">
                <span className="text-sm font-medium text-slate-400 py-2">Filters:</span>
                <select
                    name="type"
                    className="px-4 py-2 text-sm rounded-full border border-slate-200 text-slate-600 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue bg-white hover:border-slate-300 transition-colors cursor-pointer"
                    value={filters.type}
                    onChange={handleChange}
                >
                    <option value="">Job Type (All)</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                </select>

                <select
                    name="workType"
                    className="px-4 py-2 text-sm rounded-full border border-slate-200 text-slate-600 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue bg-white hover:border-slate-300 transition-colors cursor-pointer"
                    value={filters.workType}
                    onChange={handleChange}
                >
                    <option value="">Work Style (All)</option>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Onsite">Onsite</option>
                </select>

                <select
                    name="experience"
                    className="px-4 py-2 text-sm rounded-full border border-slate-200 text-slate-600 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue bg-white hover:border-slate-300 transition-colors cursor-pointer"
                    value={filters.experience}
                    onChange={handleChange}
                >
                    <option value="">Experience (All)</option>
                    <option value="Junior">Junior</option>
                    <option value="Mid">Mid</option>
                    <option value="Senior">Senior</option>
                </select>
            </div>
        </div>
    );
};

export default SearchBar;
