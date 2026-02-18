import api from "@/lib/api";
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Calendar, Clock, MapPin, IndianRupee, Users, Trophy, Award, Target, MessageCircle, ExternalLink, ChevronDown, ChevronUp, Edit } from "lucide-react";

function HackEvent() {
    const { event } = useParams();
    const [eventData, setEventData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeAccordion, setActiveAccordion] = useState(null);

    useEffect(() => {
        api.get("/admin/event/" + event).then(res => {
            console.log(res.data)
            setEventData(res.data.event)
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        })
    }, [event])

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (!eventData) return <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">Event not found</div>;

    const toggleAccordion = (index) => {
        setActiveAccordion(activeAccordion === index ? null : index);
    };

    return (
        <div className="min-h-screen font-poppins bg-[#050505] text-white overflow-x-hidden">
            {/* --- HERO SECTION --- */}
            <div className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 z-0">
                    <img
                        src={eventData.bannerUrl || "https://images.unsplash.com/photo-1504384308090-c54be3855833?q=80&w=2574&auto=format&fit=crop"}
                        alt="Event Banner"
                        className="w-full h-full object-cover opacity-40 blur-sm scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-[#050505]" />
                </div>

                {/* Content */}
                <div className="relative z-10 container mx-auto px-4 text-center mt-10">
                    {eventData.logoUrl && (
                        <img
                            src={eventData.logoUrl}
                            alt="Logo"
                            className="w-32 h-32 md:w-48 md:h-48 mx-auto mb-8 rounded-full border-4 border-indigo-500/30 shadow-[0_0_50px_rgba(99,102,241,0.5)] animate-in fade-in zoom-in duration-700"
                        />
                    )}

                    <span className="inline-block px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-sm font-bold tracking-widest uppercase mb-4 backdrop-blur-md">
                        {eventData.type || "Hackathon"}
                    </span>

                    <h1 className="text-5xl md:text-7xl lg:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 mb-4 drop-shadow-2xl">
                        {eventData.eventTitle}
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto font-light leading-relaxed mb-10">
                        "{eventData.theme}"
                    </p>

                    <div className="flex flex-wrap justify-center gap-4 animate-in slide-in-from-bottom-5 duration-700 delay-200">
                        {eventData.links?.map((link, idx) => (
                            <a
                                key={idx}
                                href={link.url}
                                target="_blank"
                                rel="noreferrer"
                                className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-bold text-lg transition-all shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_40px_rgba(79,70,229,0.6)] hover:-translate-y-1 flex items-center gap-2"
                            >
                                {link.title.includes("WhatsApp") ? <MessageCircle size={20} /> : <ExternalLink size={20} />}
                                {link.title}
                            </a>
                        ))}
                    </div>
                </div>

                {/* Animated Scroll Down Indicator */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-50">
                    <ChevronDown size={32} />
                </div>

                {/* Edit Button */}
                <div className="absolute top-24 right-4 z-20 md:top-10 md:right-10">
                    <Link
                        to={`/hack/${event}/edit`}
                        className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full backdrop-blur-md border border-white/10 transition-all flex items-center gap-2 hover:scale-105"
                    >
                        <Edit size={16} />
                        <span className="text-sm font-medium">Edit Event</span>
                    </Link>
                </div>
            </div>

            {/* --- INFO STRIP --- */}
            <div className="container mx-auto px-4 -mt-16 relative z-20">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
                    <InfoItem icon={<Calendar className="text-indigo-400" />} label="Date" value={`${eventData.startDate} - ${eventData.endDate}`} />
                    <InfoItem icon={<Clock className="text-emerald-400" />} label="Time" value={eventData.startTime} />
                    <InfoItem icon={<MapPin className="text-rose-400" />} label="Venue" value={eventData.venue} />
                    <InfoItem icon={<IndianRupee className="text-amber-400" />} label="Fee" value={`₹${eventData.cost}`} />
                    <InfoItem icon={<Users className="text-cyan-400" />} label="Team Size" value={`${eventData.minTeamMembers} - ${eventData.maxTeamMembers} Members`} />
                </div>
            </div>

            {/* --- LAYOUT GRID --- */}
            <div className="container mx-auto px-4 py-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* LEFT COLUMN (Main Content) */}
                    <div className="lg:col-span-8 space-y-16">

                        {/* ABOUT */}
                        <section className="space-y-6">
                            <SectionHeader title="About The Event" subtitle="What to expect" />
                            <div className="prose prose-invert prose-lg max-w-none text-gray-400 leading-relaxed bg-white/[0.02] p-8 rounded-3xl border border-white/5">
                                {eventData.description}
                            </div>
                        </section>

                        {/* ROUNDS */}
                        {eventData.rounds && eventData.rounds.length > 0 && (
                            <section>
                                <SectionHeader title="Event Timeline" subtitle="Structure of the hackathon" />
                                <div className="space-y-8 mt-8 border-l-2 border-indigo-500/20 ml-4 md:ml-10 pl-8 md:pl-12 relative">
                                    {eventData.rounds.map((round, idx) => (
                                        <div key={idx} className="relative group">
                                            {/* Timeline Dot */}
                                            <div className="absolute -left-[41px] md:-left-[59px] top-0 w-5 h-5 md:w-7 md:h-7 rounded-full bg-[#050505] border-4 border-indigo-500 z-10 group-hover:scale-125 transition-transform shadow-[0_0_10px_rgba(99,102,241,0.5)]" />

                                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-indigo-500/30 transition-colors">
                                                <h3 className="text-2xl font-bold text-white mb-2">{round.name}</h3>
                                                <div className="flex flex-wrap gap-2 mt-4">
                                                    {round.catogary?.map((cat, cIdx) => (
                                                        <span key={cIdx} className="px-3 py-1 bg-white/5 rounded-lg text-sm text-gray-400 border border-white/5">
                                                            {cat.title} ({cat.marks} pts)
                                                        </span>
                                                    ))}
                                                </div>
                                                <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center text-sm text-gray-500">
                                                    <span>Total Points: {round.total}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* PROBLEM STATEMENTS */}
                        {eventData.PS && eventData.PS.length > 0 && (
                            <section>
                                <SectionHeader title="Problem Statements" subtitle="Challenges to solve" />
                                <div className="grid gap-4 mt-8">
                                    {eventData.PS.map((ps, idx) => (
                                        <div key={idx} className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden">
                                            <button
                                                onClick={() => toggleAccordion(idx)}
                                                className="w-full flex justify-between items-center p-6 text-left hover:bg-white/[0.02] transition-colors"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 font-bold text-sm">
                                                        {idx + 1}
                                                    </span>
                                                    <h3 className="text-lg font-bold text-gray-200">{ps.title}</h3>
                                                </div>
                                                {activeAccordion === idx ? <ChevronUp className="text-gray-500" /> : <ChevronDown className="text-gray-500" />}
                                            </button>
                                            {activeAccordion === idx && (
                                                <div className="px-6 pb-6 pt-0 text-gray-400 text-sm leading-relaxed border-t border-white/5 mt-2 animate-in slide-in-from-top-2">
                                                    <div className="py-4">{ps.description}</div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* RIGHT COLUMN (Sidebar) */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* PRIZES CARD */}
                        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-white/10 rounded-3xl p-8 sticky top-8">
                            <div className="flex items-center gap-3 mb-6">
                                <Trophy className="text-yellow-500" size={28} />
                                <h2 className="text-2xl font-bold">Prizes</h2>
                            </div>

                            <div className="space-y-4">
                                {/* 1st Prize */}
                                <div className="bg-gradient-to-r from-yellow-500/20 to-transparent border border-yellow-500/20 p-4 rounded-2xl flex items-center gap-4">
                                    <div className="text-4xl">🥇</div>
                                    <div>
                                        <p className="text-sm text-yellow-500 font-bold uppercase tracking-wider">1st Prize</p>
                                        <p className="text-2xl font-black text-white">₹7,000</p>
                                    </div>
                                </div>
                                {/* 2nd Prize */}
                                <div className="bg-gradient-to-r from-gray-400/20 to-transparent border border-gray-400/20 p-4 rounded-2xl flex items-center gap-4">
                                    <div className="text-4xl">🥈</div>
                                    <div>
                                        <p className="text-sm text-gray-400 font-bold uppercase tracking-wider">2nd Prize</p>
                                        <p className="text-2xl font-black text-white">₹5,000</p>
                                    </div>
                                </div>
                                {/* 3rd Prize */}
                                <div className="bg-gradient-to-r from-orange-700/20 to-transparent border border-orange-700/20 p-4 rounded-2xl flex items-center gap-4">
                                    <div className="text-4xl">🥉</div>
                                    <div>
                                        <p className="text-sm text-orange-700 font-bold uppercase tracking-wider">3rd Prize</p>
                                        <p className="text-2xl font-black text-white">₹3,000</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ORGANIZER CARD */}
                        {eventData.by && (
                            <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-8">
                                <h3 className="text-lg font-bold mb-6 text-gray-400 uppercase tracking-widest">Organized By</h3>
                                <div className="flex flex-col items-center text-center">
                                    <img src={eventData.by.imgUrl} alt={eventData.by.orgName} className="w-24 h-24 rounded-full mb-4 border border-white/10 object-contain bg-white/5 p-2" />
                                    <h4 className="text-xl font-bold text-white">{eventData.by.orgName}</h4>
                                    <p className="text-indigo-400 text-sm mb-4">{eventData.by.orgType}</p>
                                    <p className="text-sm text-gray-500 mb-6 line-clamp-3">{eventData.by.description}</p>

                                    <div className="w-full space-y-3 text-sm">
                                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                                            <span className="text-gray-500">Contact</span>
                                            <span className="text-white">{eventData.by.contactName}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                                            <span className="text-gray-500">Phone</span>
                                            <span className="text-white">{eventData.by.contactPhone}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                                            <span className="text-gray-500">Email</span>
                                            <span className="text-white truncate max-w-[150px]">{eventData.by.email}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* --- FOOTER --- */}
            <footer className="border-t border-white/10 bg-[#0a0a0a] py-12 mt-20">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-gray-500 text-sm">
                        &copy; 2026 {eventData.by?.orgName || "Hackathon Organizers"}. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}

// Helper Component for Info Strip
function InfoItem({ icon, label, value }) {
    return (
        <div className="flex flex-col items-center text-center p-2 rounded-xl hover:bg-white/5 transition-colors">
            <div className="bg-white/10 p-3 rounded-full mb-2 backdrop-blur-sm">
                {icon}
            </div>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">{label}</p>
            <p className="text-sm md:text-base font-semibold text-white leading-tight">{value}</p>
        </div>
    )
}

function SectionHeader({ title, subtitle }) {
    return (
        <div className="border-l-4 border-indigo-500 pl-6">
            <h2 className="text-4xl font-black text-white mb-2">{title}</h2>
            <p className="text-gray-400 text-lg">{subtitle}</p>
        </div>
    )
}

export default HackEvent;
