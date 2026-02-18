import socket from "@/lib/socket";
import { useState } from "react";
import { useParams } from "react-router";

function Update() {
    const [update, setUpdate] = useState("");
    const { event } = useParams();

    const handleSubmit = () => {
        socket.emit("update", { update: update, id: event });
    };

    return (
        <div className="min-h-screen flex justify-center py-10 px-4 bg-[#0a0a0a]">
            {/* Background Effects */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 w-full max-w-2xl mx-auto bg-[#111] border border-white/10 shadow-2xl rounded-3xl p-8">

                <div className="mb-8 border-b border-white/5 pb-6">
                    <h2 className="text-3xl font-black text-white mb-2">Send Update</h2>
                    <p className="text-gray-400 text-sm">Broadcast a message to all participants.</p>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
                            Announcement Content
                        </label>
                        <div className="relative">
                            <textarea
                                value={update}
                                onChange={(e) => setUpdate(e.target.value)}
                                className="w-full bg-black/40 text-white h-60 p-4 rounded-xl border border-white/10 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition-all resize-none placeholder-gray-600 font-mono text-sm leading-relaxed"
                                placeholder="Type your update here using HTML or plain text..."
                            />
                            <div className="absolute bottom-4 right-4 text-xs text-gray-500">
                                {update.length} chars
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleSubmit}
                        className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-red-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                        Publish Update
                    </button>
                </div>

                {update && (
                    <div className="mt-10 animate-in slide-in-from-bottom-5">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Live Preview</h3>
                        <div className="p-6 bg-[#050505] border border-white/5 rounded-2xl prose prose-invert max-w-none prose-p:text-gray-300 prose-headings:text-white"
                            dangerouslySetInnerHTML={{ __html: update }}
                        ></div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Update;
