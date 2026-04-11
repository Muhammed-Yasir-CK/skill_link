

import React, { useEffect, useState } from 'react';
import JobCard from '../../components/JobCard';

const SavedJobs = () => {
    const [savedJobs, setSavedJobs] = useState([]);

    useEffect(() => {
        const fetchSaved = async () => {
            const token = localStorage.getItem("access");

            const res = await fetch(
                "http://localhost:8000/api/saved-jobs/",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await res.json();
            console.log("Saved Jobs API Response:", data);
            setSavedJobs(data);
        };

        fetchSaved();
    }, []);

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">
                Saved Jobs ({savedJobs.length})
            </h2>

            <div className="grid gap-4">
             
                {savedJobs.map(item => {
                    const raw =
                    item.job_source === "company"
                    ? item.company_job
                    : item.user_job;

                    if (!raw) return null;

                    let formattedJob = {};

                    if (item.job_source === "company") {
                        formattedJob = {
                            id: raw.id,
                            title: raw.title || "Untitled Job",
                            company: raw.company_name || "Company",
                            company_logo: raw.company_logo,
                            company_website: raw.company_website,
                            location: raw.location || "Not specified",
                            workType: raw.employment_type || "Full-time",
                            salary: raw.salary_min && raw.salary_max
                                ? `${raw.salary_currency} ${raw.salary_min} - ${raw.salary_max} (${raw.salary_period})`
                                : "Salary not specified",
                            posted: raw.created_at
                                ? new Date(raw.created_at).toLocaleDateString()
                                : "Recently",
                            tags: raw.skills || [],
                            is_saved: true,
                            saved_id: item.id,
                            source: "company"
                        };
                    } else {
                        formattedJob = {
                            id: raw.id,
                            title: raw.title || "Untitled Work",
                            company: "Local Work",
                            location:
                                raw.city || raw.area
                                    ? `${raw.city || ""} ${raw.area || ""}`.trim()
                                    : "Not specified",
                            workType: raw.work_nature || "Work",
                            salary: raw.budget_min && raw.budget_max
                                ? `${raw.currency} ${raw.budget_min} - ${raw.budget_max}`
                                : "Budget not specified",
                            posted: raw.created_at
                                ? new Date(raw.created_at).toLocaleDateString()
                                : "Recently",
                            tags: raw.skills || [],
                            is_saved: true,
                            saved_id: item.id,
                            source: "local"
                        };
                    }

                    return <JobCard key={item.id} job={formattedJob} />;

                    })}
            </div>
        </div>
    );
};

export default SavedJobs;