import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useParams } from "react-router";
import { Plus, X, Eye, Edit2, FileText, ChevronRight, BookOpen, Trash2 } from "lucide-react";
import { markdown } from "markdown";

function HackProblemStatements() {
    const { event } = useParams();
    const [problemStatements, setProblemStatements] = useState([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedPS, setSelectedPS] = useState(null);
    const [newPS, setNewPS] = useState({ title: "", description: "" });
    const [activeTab, setActiveTab] = useState("write");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProblemStatements();
    }, [event]);

    const fetchProblemStatements = () => {
        setLoading(true);
        api.get("/admin/event/" + event).then((res) => {
            setProblemStatements(res.data.event.PS || []);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    };

    const handleSubmit = () => {
        if (!newPS.title || !newPS.description) return;

        api.post("/admin/ps/" + event, { PS: newPS }).then((res) => {
            if (res.data.event && Array.isArray(res.data.event.PS)) {
                setProblemStatements(res.data.event.PS);
            } else if (res.data.PS && Array.isArray(res.data.PS)) {
                setProblemStatements(res.data.PS);
            } else {
                fetchProblemStatements();
            }
            setIsAddModalOpen(false);
            setNewPS({ title: "", description: "" });
            setActiveTab("write");
        }).catch(err => {
            console.error("Failed to add PS", err);
            alert("Failed to add Problem Statement");
        });
    };

    const handleDelete = async (index, e) => {
        if (e) e.stopPropagation();

        if (!window.confirm("Are you sure you want to delete this problem statement?")) return;

        const updatedPS = problemStatements.filter((_, i) => i !== index);

        try {
            const res = await api.put("/admin/ps/" + event, { PS: updatedPS });
            setProblemStatements(updatedPS);
            if (selectedPS) setSelectedPS(null);
        } catch (err) {
            console.error("Failed to delete PS", err);
            alert("Failed to delete Problem Statement");
        }
    };

    const renderMarkdown = (text) => {
        try {
            return { __html: markdown.toHTML(text) };
        } catch (e) {
            console.error("Markdown parsing error", e);
            return { __html: text };
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen font-poppins bg-[#050505] text-white p-4 sm:p-6 overflow-hidden selection:bg-indigo-500/30">
            {/* Background Effects */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 p-6 rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-lg">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            Problem Statements
                        </h1>
                        <p className="text-gray-400 text-sm mt-1">Manage and view hackathon problem statements</p>
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="px-6 py-3 rounded-xl font-bold bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 group"
                    >
                        <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                        Add New
                    </button>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                    {problemStatements.length > 0 ? (
                        problemStatements.map((ps, idx) => (
                            <div
                                key={ps._id || idx}
                                onClick={() => setSelectedPS({ ...ps, originalIndex: idx })}
                                className="group bg-white/[0.02] backdrop-blur-xl border border-white/10 hover:border-indigo-500/50 p-6 rounded-3xl transition-all hover:bg-white/[0.04] cursor-pointer hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 flex flex-col h-full relative"
                            >
                                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                    <button
                                        onClick={(e) => handleDelete(idx, e)}
                                        className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/20 group-hover:scale-110 transition-transform shrink-0">
                                        {idx + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h2 className="text-xl font-bold text-gray-100 group-hover:text-white transition-colors line-clamp-2 leading-tight">
                                            {ps.title}
                                        </h2>
                                    </div>
                                </div>

                                <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center text-sm text-gray-500 group-hover:text-indigo-300 transition-colors">
                                    <span className="flex items-center gap-2">
                                        <BookOpen size={14} /> View Details
                                    </span>
                                    <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-500 bg-white/[0.02] rounded-3xl border border-dashed border-white/10">
                            <FileText size={48} className="mb-4 opacity-50" />
                            <p className="text-lg">No problem statements added yet.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ADD Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
                    <div className="bg-[#111] border border-white/10 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="flex justify-between items-center p-6 border-b border-white/5 bg-white/[0.02]">
                            <h3 className="text-xl font-bold text-white">Add Problem Statement</h3>
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400">Title</label>
                                <input
                                    type="text"
                                    placeholder="Enter concise title..."
                                    value={newPS.title}
                                    onChange={(e) => setNewPS({ ...newPS, title: e.target.value })}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-gray-600"
                                />
                            </div>

                            <div className="space-y-2 flex-1 flex flex-col">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-medium text-gray-400">Description</label>
                                    <div className="flex bg-black/50 rounded-lg p-1 border border-white/10">
                                        <button
                                            onClick={() => setActiveTab("write")}
                                            className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all ${activeTab === "write" ? "bg-indigo-600 text-white shadow-lg" : "text-gray-500 hover:text-gray-300"
                                                }`}
                                        >
                                            <Edit2 size={12} /> Write
                                        </button>
                                        <button
                                            onClick={() => setActiveTab("preview")}
                                            className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all ${activeTab === "preview" ? "bg-indigo-600 text-white shadow-lg" : "text-gray-500 hover:text-gray-300"
                                                }`}
                                        >
                                            <Eye size={12} /> Preview
                                        </button>
                                    </div>
                                </div>

                                {activeTab === "write" ? (
                                    <textarea
                                        placeholder="Enter detailed description (Markdown supported)..."
                                        value={newPS.description}
                                        onChange={(e) => setNewPS({ ...newPS, description: e.target.value })}
                                        className="w-full h-64 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-gray-600 resize-none font-mono text-sm leading-relaxed"
                                    />
                                ) : (
                                    <div
                                        className="w-full h-64 bg-black/30 border border-white/10 rounded-xl px-6 py-4 overflow-y-auto prose prose-invert prose-sm max-w-none custom-scrollbar"
                                        dangerouslySetInnerHTML={renderMarkdown(newPS.description || "*No description yet*")}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-white/5 bg-white/[0.02] flex justify-end gap-3">
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="px-5 py-2.5 rounded-xl font-medium text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={!newPS.title || !newPS.description}
                                className="px-6 py-2.5 rounded-xl font-bold bg-indigo-600 text-white shadow-lg hover:bg-indigo-500 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                                Submit Statement
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* VIEW DETAILS Modal */}
            {selectedPS && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200"
                    onClick={() => setSelectedPS(null)}
                >
                    <div
                        className="bg-[#111] border border-white/10 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-5 duration-300"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex justify-between items-start p-6 md:p-8 border-b border-white/5 bg-white/[0.02]">
                            <div>
                                <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight">{selectedPS.title}</h3>
                            </div>
                            <button
                                onClick={() => setSelectedPS(null)}
                                className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors border border-white/5 shrink-0 ml-4"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
                            <div
                                className="prose prose-invert prose-lg max-w-none prose-headings:text-indigo-300 prose-a:text-indigo-400 prose-strong:text-white text-gray-300 leading-relaxed"
                                dangerouslySetInnerHTML={renderMarkdown(selectedPS.description)}
                            />
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-white/5 bg-white/[0.02] flex justify-between">
                            {selectedPS.originalIndex !== undefined && (
                                <button
                                    onClick={(e) => handleDelete(selectedPS.originalIndex, e)}
                                    className="px-6 py-3 rounded-xl font-bold bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center gap-2"
                                >
                                    <Trash2 size={18} /> Delete
                                </button>
                            )}
                            <button
                                onClick={() => setSelectedPS(null)}
                                className="px-6 py-3 rounded-xl font-bold bg-white text-black hover:bg-gray-200 transition-colors shadow-lg ml-auto"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

export default HackProblemStatements;