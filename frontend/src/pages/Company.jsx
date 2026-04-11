import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Search, MapPin, Briefcase, ExternalLink, Building2, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const COMPANIES_DATA = [
    {
        id: 1,
        name: "TechFlow Systems",
        logo: "https://images.unsplash.com/photo-1549923746-c502d488b3ea?auto=format&fit=crop&w=100&h=100&q=80",
        industry: "SaaS / Enterprise",
        location: "San Francisco, CA",
        description: "Building the next generation of workflow automation tools for enterprise teams.",
        openJobs: 12,
        tags: ["React", "Node.js", "AI"]
    },
    {
        id: 2,
        name: "Creative Pulse",
        logo: "https://images.unsplash.com/photo-1572044162444-ad6021194360?auto=format&fit=crop&w=100&h=100&q=80",
        industry: "Design Agency",
        location: "London, UK (Remote)",
        description: "Award-winning digital agency crafting immersive brand experiences.",
        openJobs: 4,
        tags: ["UI/UX", "Figma", "Branding"]
    },
    {
        id: 3,
        name: "GreenLeaf Energy",
        logo: "https://images.unsplash.com/photo-1516876437184-593fda40c7ce?auto=format&fit=crop&w=100&h=100&q=80",
        industry: "CleanTech",
        location: "Berlin, Germany",
        description: "Innovating sustainable energy solutions for a greener planet.",
        openJobs: 8,
        tags: ["Engineering", "IoT", "Solar"]
    },
    {
        id: 4,
        name: "FinSecure",
        logo: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=100&h=100&q=80",
        industry: "Fintech",
        location: "New York, NY",
        description: "Secure and seamless payment infrastructure for modern businesses.",
        openJobs: 15,
        tags: ["Cybersecurity", "Blockchain", "Python"]
    },
    {
        id: 5,
        name: "EduSphere",
        logo: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=100&h=100&q=80",
        industry: "EdTech",
        location: "Toronto, Canada",
        description: "Democratizing education through accessible online learning platforms.",
        openJobs: 6,
        tags: ["Education", "Video", "Community"]
    },
    {
        id: 6,
        name: "HealthConnect",
        logo: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=100&h=100&q=80",
        industry: "Healthcare",
        location: "Austin, TX",
        description: "Connecting patients with specialists through telemedicine.",
        openJobs: 9,
        tags: ["Mobile App", "React Native", "Health"]
    }
];

const Company = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredCompanies = COMPANIES_DATA.filter(company =>
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.industry.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
            <Header />

            <main className="flex-grow">
                {/* Hero Section */}
                <div className="bg-brand-navy pt-16 pb-24 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-3xl md:text-5xl font-bold text-white mb-6">
                            Discover Top Companies
                        </h1>
                        <p className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto mb-10">
                            Explore the best workplaces, from fast-growing startups to industry leaders. Find your next dream team.
                        </p>

                        {/* Search Bar */}
                        <div className="relative max-w-2xl mx-auto">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-11 pr-4 py-4 rounded-xl border-none ring-1 ring-white/20 bg-white/10 text-white placeholder-slate-400 focus:ring-2 focus:ring-brand-accent focus:bg-white/20 transition-all text-lg backdrop-blur-sm"
                                placeholder="Search by company name or industry..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 pb-20 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCompanies.length > 0 ? (
                            filteredCompanies.map(company => (
                                <div key={company.id} className="bg-white rounded-xl shadow-lg border border-slate-100 hover:shadow-xl transition-all duration-300 group flex flex-col">
                                    <div className="p-6 flex-grow">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200">
                                                <img src={company.logo} alt={company.name} className="w-full h-full object-cover" />
                                            </div>
                                            <span className="bg-brand-accent/10 text-brand-navy px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                                {company.openJobs} Open Jobs
                                            </span>
                                        </div>

                                        <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-brand-accent transition-colors">
                                            {company.name}
                                        </h3>
                                        <p className="text-sm font-medium text-slate-500 mb-4 flex items-center gap-1">
                                            <Building2 className="w-4 h-4" /> {company.industry}
                                        </p>

                                        <p className="text-slate-600 text-sm mb-6 line-clamp-3">
                                            {company.description}
                                        </p>

                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {company.tags.map(tag => (
                                                <span key={tag} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-md">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 rounded-b-xl flex items-center justify-between">
                                        <div className="flex items-center gap-1 text-slate-500 text-sm font-medium">
                                            <MapPin className="w-4 h-4" />
                                            {company.location.split(',')[0]}
                                        </div>
                                        <Link
                                            to={`/companies/${company.id}`} // Assuming future route
                                            className="text-brand-navy font-bold text-sm flex items-center gap-1 hover:text-brand-accent transition-colors"
                                            onClick={(e) => e.preventDefault()} // Prevent nav for now as route doesn't exist
                                        >
                                            View Opportunities <ExternalLink className="w-4 h-4" />
                                        </Link>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-20 bg-white rounded-xl shadow-sm border border-slate-200">
                                <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-slate-900 mb-2">No companies found</h3>
                                <p className="text-slate-500">Try adjusting your search terms to find what you're looking for.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Company;
