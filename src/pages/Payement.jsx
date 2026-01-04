import PaymentCard from "@/components/PaymentCard"
import api from "../lib/api"
import { useEffect, useState } from "react"
import { useParams } from "react-router"

function Payment() {
    const { event } = useParams()
    const [teams, setTeams] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState("pending") // "verified" | "pending" | "not_paid"

    useEffect(() => {
        api.get("/admin/event/" + event).then((res) => {
            console.log(res.data)
            setTeams(res.data.event_og || [])
            setLoading(false)
        }).catch(err => {
            console.error(err)
            setLoading(false)
        })
    }, [event])

    const getFilteredTeams = () => {
        switch (activeTab) {
            case "verified":
                return teams.filter(t => t.payment && t.verified);
            case "pending":
                return teams.filter(t => t.payment && !t.verified);
            case "not_paid":
                return teams.filter(t => !t.payment);
            default:
                return teams;
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
            </div>
        )
    }

    const filteredTeams = getFilteredTeams();

    return (
        <div className="min-h-screen bg-black text-[#ECE8E7] p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-orange-500">
                    Payment Verification
                </h1>

                {/* Tabs */}
                <div className="flex justify-center gap-4 mb-8">
                    <button
                        onClick={() => setActiveTab("pending")}
                        className={`px-6 py-2 rounded-full font-medium transition-all ${activeTab === "pending"
                            ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/50"
                            : "bg-[#111] text-gray-500 hover:text-gray-300"
                            }`}
                    >
                        Pending ({teams.filter(t => t.payment && !t.verified).length})
                    </button>
                    <button
                        onClick={() => setActiveTab("verified")}
                        className={`px-6 py-2 rounded-full font-medium transition-all ${activeTab === "verified"
                            ? "bg-green-500/20 text-green-400 border border-green-500/50"
                            : "bg-[#111] text-gray-500 hover:text-gray-300"
                            }`}
                    >
                        Verified ({teams.filter(t => t.payment && t.verified).length})
                    </button>
                    <button
                        onClick={() => setActiveTab("not_paid")}
                        className={`px-6 py-2 rounded-full font-medium transition-all ${activeTab === "not_paid"
                            ? "bg-red-500/20 text-red-400 border border-red-500/50"
                            : "bg-[#111] text-gray-500 hover:text-gray-300"
                            }`}
                    >
                        Not Paid ({teams.filter(t => !t.payment).length})
                    </button>
                </div>

                {filteredTeams.length === 0 ? (
                    <div className="text-center text-gray-500 mt-20 flex flex-col items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p>No teams in this category.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {filteredTeams.map((team) => (
                            <PaymentCard key={team._id} team={team} eventId={event} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
export default Payment