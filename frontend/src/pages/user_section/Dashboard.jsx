import React, { useState, useEffect } from 'react';
import JobCard from '../../components/JobCard';
import SearchBar from '../../components/SearchBar';

const Dashboard = () => {
    const [jobs, setJobs] = useState([]);
    const [filteredJobs, setFilteredJobs] = useState([]);
    
    const [filters, setFilters] = useState({
        query: '',
        location: '',
        category: '',
        type: '',
        workType: '',
        experience: ''
    });

    const [user, setUser] = useState(null);



    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch("http://localhost:8000/api/accounts/me/", {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("access")}`
                    }
                });

                if (!res.ok) return;

                const data = await res.json();
                setUser(data);

            } catch (error) {
                console.error("Failed to fetch user:", error);
            }
        };

        fetchUser();
    }, []);

    
    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const res = await fetch("http://localhost:8000/api/recommendations/jobs/", {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("access")}`
                    }
                });
                
                if (!res.ok) {
                    console.error("Failed to fetch recommendations. Status:", res.status);
                    return;
                }

                const data = await res.json();
                
                // The recommendations API already returns a ranked list with score
                // We just need to format the date for display
                const formattedJobs = data.results.map(job => ({
                    ...job,
                    posted: job.posted 
                        ? new Date(job.posted).toLocaleDateString()
                        : "Recently"
                }));

                setJobs(formattedJobs);
                setFilteredJobs(formattedJobs);

            } catch (error) {
                console.error("Failed to fetch jobs:", error);
            }
        };

        fetchJobs();
    }, []);

    // Filtering Logic

    useEffect(() => {
        const data = jobs.filter(job => {
            const title = job.title?.toLowerCase() || "";
            const description = job.description?.toLowerCase() || "";

            const matchesQuery =
                title.includes(filters.query.toLowerCase()) ||
                description.includes(filters.query.toLowerCase());

            return matchesQuery;
        });

        setFilteredJobs(data);
    }, [filters.query, jobs]);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Dashboard Hero */}
            <div className="bg-gradient-to-r from-brand-navy to-slate-900 rounded-3xl p-8 md:p-10 relative overflow-hidden border border-white/5 shadow-2xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-brand-blue/10 rounded-full blur-[100px] -translate-y-1/2 -translate-x-1/2" />
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {user?.full_name || "User"}! 👋</h1>
                    <p className="text-slate-400 max-w-xl">
                        You have <span className="text-brand-blue font-semibold">{jobs.length} job recommendations</span> today based on your profile preferences.
                    </p>
                </div>
            </div>

            {/* Search & Listings */}
            <div>
                <SearchBar
                    onSearch={() => { }}
                    filters={filters}
                    setFilters={setFilters}
                    categories={[]}
                />

                <div className="mt-8 mb-12">
                    <div className="flex justify-between items-end mb-6">
                        <h2 className="text-xl font-bold text-brand-primary">Recommended for You</h2>
                        <span className="text-sm text-slate-500">{filteredJobs.length} jobs found</span>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {filteredJobs.length > 0 ? (
                            filteredJobs.map(job => (
                                <JobCard key={job.id} job={job} />
                                
                            ))
                        ) : (
                            <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
                                <p className="text-slate-500">No jobs found matching your criteria.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
