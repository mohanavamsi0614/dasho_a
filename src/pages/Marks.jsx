import { useState, useEffect } from "react";
import { useParams } from "react-router";
import api from "../lib/api";

function Marks() {
    const eventId = useParams().event;
    // Core Data
    const [eventData, setEventData] = useState(null); // stores { event: ..., event_og: ... }
    const [teams, setTeams] = useState([]);
    const [rounds, setRounds] = useState([]);

    // UI State
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("grading"); // "grading" | "results"
    const [selectedRound, setSelectedRound] = useState(null);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [currentMarks, setCurrentMarks] = useState({});
    const [searchTerm, setSearchTerm] = useState("");
    const [showCreateRound, setShowCreateRound] = useState(false);

    // Fetch Data on Load
    useEffect(() => {
        setLoading(true);
        api.get("/admin/event/" + eventId)
            .then((res) => {
                setEventData(res.data);
                setTeams(res.data.event_og || []);

                const fetchedRounds = res.data.event.rounds || [];
                setRounds(fetchedRounds);
                if (fetchedRounds.length > 0) {
                    setSelectedRound(fetchedRounds[0]);
                }

                // Select first team by default if available
                if (res.data.event_og && res.data.event_og.length > 0) {
                    setSelectedTeam(res.data.event_og[0]);
                }

                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, [eventId]);

    useEffect(() => {
        if (selectedTeam && selectedRound) {
            const existingMarks = selectedTeam.marks?.filter(m => m.name === selectedRound.name)[0]?.marks || {};
            setCurrentMarks(existingMarks);
        }
    }, [selectedTeam, selectedRound]);

    const handleScoreChange = (category, value) => {
        const max = Number(selectedRound.catogary.find(c => c.title === category)?.marks || 100);
        let numValue = Number(value);
        if (numValue < 0) numValue = 0;
        if (numValue > max) numValue = max;

        setCurrentMarks((prev) => ({
            ...prev,
            [category]: numValue
        }));
    };

    const handleSubmitMarks = () => {
        if (!selectedTeam || !selectedRound) return;

        const payload = {
            marks: { name: selectedRound.name, marks: { ...currentMarks }, total: calculateTotal(currentMarks) }
        };
        console.log(payload);
        setLoading(true)
        api.post("/admin/marks/" + eventId + "/" + selectedTeam._id, payload)
            .then((res) => {
                alert("Marks saved successfully!");
                setTeams((prevTeams) =>
                    prevTeams.map(t => {
                        if (t._id === selectedTeam._id) {
                            return {
                                ...t,
                                marks: [
                                    ...t.marks?.filter(m => m.name !== selectedRound.name),
                                    { name: selectedRound.name, marks: { ...currentMarks }, total: calculateTotal(currentMarks) }
                                ]
                            }
                        }
                        return t;
                    })
                );
            })
        setLoading(false)
            .catch(err => {
                console.error(err);
                alert("Failed to save marks.");
            });
    };

    const handleNextTeam = () => {
        const filtered = getFilteredTeams();
        const idx = filtered.findIndex(t => t._id === selectedTeam._id);
        if (idx !== -1 && idx < filtered.length - 1) {
            setSelectedTeam(filtered[idx + 1]);
        } else if (filtered.length > 0) {
            setSelectedTeam(filtered[0]); // Loop back to start
        }
    };

    const getFilteredTeams = () => {
        return teams.filter(t => t.teamName.toLowerCase().includes(searchTerm.toLowerCase()));
    };

    const calculateTotal = (marksObj) => {
        if (!marksObj) return 0;
        return Object.entries(marksObj).reduce((acc, [key, val]) => {
            if (key === "name") return acc;
            return acc + (Number(val) || 0);
        }, 0);
    };

    // --- Render ---

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-[#0a0a0a]">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen font-poppins bg-[#0a0a0a] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] text-white p-4 sm:p-8 relative overflow-hidden">
            {/* Background blobs */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px]" />
            </div>

            <div className="w-full max-w-full mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-6 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 shadow-xl">
                    <div>
                        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Marks Management</h1>
                        <p className="text-gray-400 text-sm">Grading Panel for {eventData?.event?.title || "Hackathon"}</p>
                    </div>

                    <div className="flex bg-black/40 p-1 rounded-xl">
                        <button
                            onClick={() => setActiveTab("grading")}
                            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${activeTab === 'grading' ? "bg-indigo-600 text-white shadow-lg" : "text-gray-400 hover:text-white"}`}
                        >
                            Grading
                        </button>
                        <button
                            onClick={() => setActiveTab("results")}
                            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${activeTab === 'results' ? "bg-indigo-600 text-white shadow-lg" : "text-gray-400 hover:text-white"}`}
                        >
                            Results Table
                        </button>
                    </div>

                    <button
                        onClick={() => setShowCreateRound(true)}
                        className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl text-white font-semibold text-sm shadow-lg hover:shadow-emerald-500/20 transition-all active:scale-95"
                    >
                        + Create Round
                    </button>
                </div>

                {/* Round Selector Stripe */}
                {rounds.length > 0 ? (
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                        {rounds.map(r => (
                            <button
                                key={r.name}
                                onClick={() => setSelectedRound(r)}
                                className={`whitespace-nowrap px-4 py-2 rounded-full border transition-all duration-300 text-sm font-medium ${selectedRound?.name === r.name
                                    ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                                    : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:border-white/30"
                                    }`}
                            >
                                {r.name}
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="text-center p-10 border border-dashed border-gray-700 rounded-3xl bg-white/5">
                        <p className="text-gray-400">No rounds found. Please create a round to start grading.</p>
                    </div>
                )}


                {/* Content Area */}
                {rounds.length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">

                        {/* --- GRADING TAB --- */}
                        {activeTab === 'grading' && (
                            <>
                                {/* Left Sidebar: Team List */}
                                <div className="lg:col-span-3 flex flex-col gap-4 bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-3xl h-[600px]">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Search teams..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 pl-10 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                                        />
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-3 top-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>

                                    <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                                        {getFilteredTeams().map(team => {
                                            const isSelected = selectedTeam?._id === team._id;
                                            const hasMarks = team.marks?.filter(m => m.name === selectedRound.name)[0]?.marks?.total;
                                            return (
                                                <div
                                                    key={team._id}
                                                    onClick={() => setSelectedTeam(team)}
                                                    className={`p-3 rounded-xl cursor-pointer transition-all border flex justify-between items-center ${isSelected
                                                        ? "bg-indigo-600/20 border-indigo-500/50"
                                                        : "bg-white/5 border-transparent hover:bg-white/10"
                                                        }`}
                                                >
                                                    <div>
                                                        <p className={`text-sm font-semibold ${isSelected ? "text-indigo-300" : "text-gray-300"}`}>{team.teamName}</p>
                                                        <p className={`text-xs text-gray-400 ${isSelected ? "text-indigo-300" : "text-gray-300"}`}>{team.marks?.filter(m => m.name === selectedRound.name)[0]?.marks?.total}</p>
                                                    </div>
                                                    {hasMarks && (
                                                        <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                        {getFilteredTeams().length === 0 && (
                                            <p className="text-gray-500 text-sm text-center mt-10">No teams match your search.</p>
                                        )}
                                    </div>
                                </div>

                                {/* Right Panel: Grading Form */}
                                <div className="lg:col-span-9 flex flex-col bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-3xl relative overflow-hidden">
                                    {selectedTeam ? (
                                        <>
                                            <div className="flex justify-between items-start mb-8 pb-6 border-b border-white/10">
                                                <div>
                                                    <h2 className="text-3xl font-bold text-white mb-1">{selectedTeam.teamName}</h2>
                                                    <div className="flex gap-4 text-sm text-gray-400">
                                                        <span>Lead: {selectedTeam.lead?.name}</span>
                                                        <span>•</span>
                                                        <span>{selectedTeam.lead?.college}</span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm text-gray-400 mb-1">Current Score</div>
                                                    <div className="text-4xl font-mono font-bold text-indigo-400">
                                                        {selectedTeam.marks?.filter(m => m.name === selectedRound.name)[0]?.marks?.total || 0}
                                                        <span className="text-lg text-gray-600"> / {selectedRound.total}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 overflow-y-auto pr-2 custom-scrollbar max-h-[400px]">
                                                {selectedRound.catogary.map((cat, idx) => (
                                                    <div key={idx} className="bg-black/20 p-5 rounded-2xl border border-white/5 group hover:border-white/10 transition-colors">
                                                        <div className="flex justify-between mb-3">
                                                            <label className="text-gray-300 font-medium">{cat.title}</label>
                                                            <span className="text-xs font-mono py-1 px-2 rounded bg-white/10 text-gray-400">Max: {cat.marks}</span>
                                                        </div>
                                                        <div className="relative">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                max={cat.marks}
                                                                value={currentMarks[cat.title] || ""}
                                                                onChange={(e) => handleScoreChange(cat.title, e.target.value)}
                                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-lg text-white focus:outline-none focus:border-indigo-500 transition-colors placeholder-gray-700"
                                                                placeholder="0"
                                                            />
                                                        </div>
                                                        <input
                                                            type="range"
                                                            min="0"
                                                            max={cat.marks}
                                                            value={Number(currentMarks[cat.title] || 0)}
                                                            onChange={(e) => handleScoreChange(cat.title, e.target.value)}
                                                            className="w-full mt-4 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                                        />
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="mt-auto flex justify-end gap-4 pt-6 border-t border-white/10">
                                                <button
                                                    onClick={handleNextTeam}
                                                    className="px-6 py-3 rounded-xl font-semibold bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white transition-all"
                                                >
                                                    Skip to Next
                                                </button>
                                                <button
                                                    onClick={handleSubmitMarks}
                                                    className="px-8 py-3 rounded-xl font-bold bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-500 hover:scale-105 active:scale-95 transition-all"
                                                >
                                                    Save Marks
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                            <p>Select a team from the list to start grading.</p>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {activeTab === 'results' && (
                            <div className="lg:col-span-12 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-left">
                                        <thead className="bg-black/40 text-gray-300 uppercase text-xs tracking-wider font-semibold">
                                            <tr>
                                                <th className="p-5 border-b border-white/5">Rank</th>
                                                <th className="p-5 border-b border-white/5">Team Name</th>
                                                {selectedRound.catogary.map((cat, i) => (
                                                    <th key={i} className="p-5 border-b border-white/5">{cat.title}</th>
                                                ))}
                                                <th className="p-5 border-b border-white/5 text-indigo-400">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {[...teams]
                                                .map(t => ({
                                                    ...t,
                                                    totalScore: t.marks?.filter(m => m.name === selectedRound.name)[0]?.total
                                                }))
                                                .sort((a, b) => b.totalScore - a.totalScore)
                                                .map((team, idx) => (
                                                    <tr key={team._id} className="hover:bg-white/5 transition-colors">
                                                        <td className="p-5 font-mono text-gray-500">#{idx + 1}</td>
                                                        <td className="p-5 font-bold text-white">{team.teamName}</td>
                                                        {selectedRound.catogary.map((cat, i) => (
                                                            <td key={i} className="p-5 text-gray-400">
                                                                {team.marks?.filter(m => m.name === selectedRound.name)[0]?.marks?.[cat.title] || "-"}
                                                            </td>
                                                        ))}
                                                        <td className="p-5 font-bold text-indigo-400 text-lg">
                                                            {team.totalScore}
                                                        </td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                    </div>
                )}
            </div>

            {/* Create Round Popup */}
            {showCreateRound && (
                <CreateRoundPopup
                    setClose={() => setShowCreateRound(false)}
                    eventId={eventId}
                    onSuccess={(newRound) => {
                        setRounds([...rounds, newRound]);
                        setSelectedRound(newRound);
                    }}
                />
            )}
        </div>
    );
}

// Sub-component for Creating Rounds
function CreateRoundPopup({ setClose, eventId, onSuccess }) {
    const [name, setName] = useState("");
    const [categories, setCategories] = useState([]);

    // Add one empty category by default
    useEffect(() => {
        if (categories.length === 0) setCategories([{ title: "", marks: "" }]);
    }, []);

    const addCategory = () => setCategories([...categories, { title: "", marks: "" }]);

    const removeCategory = (idx) => {
        setCategories(categories.filter((_, i) => i !== idx));
    };

    const updateCategory = (idx, field, value) => {
        const newCats = [...categories];
        newCats[idx][field] = value;
        setCategories(newCats);
    };

    const totalPoints = categories.reduce((sum, c) => sum + (Number(c.marks) || 0), 0);

    const handleSave = () => {
        // Validate
        if (!name.trim()) return alert("Round name is required");
        const validCats = categories.filter(c => c.title.trim() && c.marks);
        if (validCats.length === 0) return alert("Add at least one valid category");

        const newRound = {
            name,
            catogary: validCats,
            total: totalPoints
        };

        api.post("/admin/hackthon/round/create/" + eventId, { round: newRound })
            .then((res) => {
                alert("Round created successfully!");
                onSuccess(newRound);
                setClose();
            })
            .catch(err => {
                console.error(err);
                alert("Failed to create round");
            });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#111] border border-white/10 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Create New Round</h2>
                    <button onClick={setClose} className="text-gray-400 hover:text-white">✕</button>
                </div>

                <div className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Round Name</label>
                        <input
                            type="text"
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
                            placeholder="e.g. Final Pitch"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <label className="text-sm font-medium text-gray-400">Scoring Categories</label>
                            <button onClick={addCategory} className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold">+ Add Category</button>
                        </div>
                        <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                            {categories.map((cat, idx) => (
                                <div key={idx} className="flex gap-2">
                                    <input
                                        placeholder="Title"
                                        className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                                        value={cat.title}
                                        onChange={(e) => updateCategory(idx, "title", e.target.value)}
                                    />
                                    <input
                                        placeholder="Pts"
                                        type="number"
                                        className="w-20 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white text-center"
                                        value={cat.marks}
                                        onChange={(e) => updateCategory(idx, "marks", e.target.value)}
                                    />
                                    <button
                                        onClick={() => removeCategory(idx)}
                                        className="text-gray-500 hover:text-red-400 px-2"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl">
                        <span className="text-gray-300 font-medium">Total Points</span>
                        <span className="text-xl font-bold text-indigo-400">{totalPoints}</span>
                    </div>
                </div>

                <div className="p-6 border-t border-white/10 flex justify-end gap-3 bg-white/5">
                    <button onClick={setClose} className="px-4 py-2 text-gray-400 hover:text-white font-medium">Cancel</button>
                    <button onClick={handleSave} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold shadow-lg shadow-indigo-500/20">Create Round</button>
                </div>
            </div>
        </div>
    );
}

export default Marks;