import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import JobCard from '../components/JobCard';
import SearchBar from '../components/SearchBar';
import { jobsData, categories } from '../data/jobs';

const Home = () => {
    const [jobs, setJobs] = useState(jobsData);
    const [filteredJobs, setFilteredJobs] = useState(jobsData);
    const [filters, setFilters] = useState({
        query: '',
        location: '',
        category: '',
        type: '',
        workType: '',
        experience: ''
    });

    useEffect(() => {
        const data = jobs.filter(job => {
            // Search Query
            const matchesQuery = job.title.toLowerCase().includes(filters.query.toLowerCase()) ||
                job.company.toLowerCase().includes(filters.query.toLowerCase()) ||
                job.tags.some(tag => tag.toLowerCase().includes(filters.query.toLowerCase()));

            // Location
            const matchesLocation = job.location.toLowerCase().includes(filters.location.toLowerCase());

            // Dropdowns
            const matchesCategory = filters.category === '' || job.tags.includes(filters.category); // Simplified category matching via tags for now
            const matchesType = filters.type === '' || job.type === filters.type;
            const matchesWorkType = filters.workType === '' || job.workType === filters.workType;
            const matchesExperience = filters.experience === '' || job.experience === filters.experience;

            return matchesQuery && matchesLocation && matchesCategory && matchesType && matchesWorkType && matchesExperience;
        });
        setFilteredJobs(data);
    }, [filters, jobs]);

    return (
        <div className="min-h-screen bg-brand-light flex flex-col font-sans">
            <Header />

            <main className="flex-grow min-h-[95vh]">
                {/* Hero Section */}
                <div className="bg-brand-navy pt-16 pb-32 px-4 relative overflow-hidden">
                    {/* Abstract background shapes */}
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                        <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-blue/10 rounded-full blur-3xl"></div>
                        <div className="absolute top-1/2 -left-24 w-72 h-72 bg-brand-accent/5 rounded-full blur-3xl"></div>
                    </div>

                    <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
                        <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight leading-tight">
                            Find your next <span className="text-brand-accent">chapter</span>.
                        </h1>
                        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto font-light">
                            Connect with top-tier companies and startups that align with your career goals.
                        </p>
                    </div>
                </div>

                {/* Content Section - Overlapping the hero */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20">
                    <SearchBar
                        onSearch={() => { }}
                        filters={filters}
                        setFilters={setFilters}
                        categories={categories}
                    />

                    <div className="mt-12 mb-20 animate-fade-in">
                        <div className="flex justify-between items-end mb-8">
                            <div>
                                <h2 className="text-2xl font-bold text-brand-primary">Latest Opportunities</h2>
                                <p className="text-slate-500 mt-1">Explore the newest listings tailored for you.</p>
                            </div>
                            <span className="bg-brand-light px-3 py-1 rounded-full text-sm font-medium text-slate-500 border border-slate-200">
                                {filteredJobs.length} results
                            </span>
                        </div>

                        {filteredJobs.length > 0 ? (
                            <div className="grid grid-cols-1 gap-4">
                                {filteredJobs.map(job => (
                                    <JobCard key={job.id} job={job} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white rounded-xl border border-slate-200 shadow-sm">
                                <p className="text-slate-500 text-lg">No jobs found matching your criteria.</p>
                                <button
                                    onClick={() => setFilters({
                                        query: '',
                                        location: '',
                                        category: '',
                                        type: '',
                                        workType: '',
                                        experience: ''
                                    })}
                                    className="mt-4 text-brand-blue font-medium hover:underline"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Home;
