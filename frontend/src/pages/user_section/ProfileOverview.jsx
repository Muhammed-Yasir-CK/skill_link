


import React, { useEffect, useState } from 'react';
import { MapPin, Briefcase } from 'lucide-react';
import axios from '../../api/axios'; // use your axios instance
import { useNavigate } from 'react-router-dom';

const ProfileOverview = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get('/accounts/seeker/profile/');
                setProfile(res.data);
            } catch (err) {
                console.error('Failed to load profile', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    if (loading) return <div>Loading profile...</div>;
    if (!profile) return <div>No profile data</div>;
    console.log("PROFILE DATA:", profile);

    return (
        <div className="animate-fade-in space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                <div className="flex items-start justify-between mb-8">
                    <div className="flex gap-6">
                        <div className="w-24 h-24 rounded-full bg-slate-200 border-4 border-white shadow-lg overflow-hidden">
                            <img
                                src={
                                    profile.profile_picture || '/default-avatar.png'
                                        // ? `http://localhost:8000${profile.profile_picture}`
                                        // : '/default-avatar.png'
                                }onError={() => console.log('Image failed to load:', profile.profile_picture)}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />

                        </div>

                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">
                                {profile.full_name}
                            </h2>

                            <p className="text-brand-blue font-medium mb-2">
                                {profile.profession}
                            </p>

                            <div className="flex gap-4 text-sm text-slate-500">
                                {profile.location && (
                                    <span className="flex items-center gap-1">
                                        <MapPin className="w-4 h-4" />
                                        {profile.location}
                                    </span>
                                )}

                                {profile.experience_level !== null && (
                                    <span className="flex items-center gap-1">
                                        <Briefcase className="w-4 h-4" />
                                        {profile.experience_level} Years Exp
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={() => navigate('/seeker/settings')}
                        className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                        Edit Profile
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="font-semibold text-slate-900 mb-4">
                            About Me
                        </h3>
                        <p className="text-slate-600 leading-relaxed text-sm">
                            {profile.summary || 'No description added yet.'}
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-slate-900 mb-4">
                            Skills
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {profile.skills?.length > 0 ? (
                                profile.skills.map(skill => (
                                    <span
                                        key={skill}
                                        className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium"
                                    >
                                        {skill}
                                    </span>
                                ))
                            ) : (
                                <span className="text-sm text-slate-400">
                                    No skills added
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileOverview;
