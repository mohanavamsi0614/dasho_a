import PaymentCard from "@/components/PaymentCard"
import api from "../lib/api"
import { useEffect, useState } from "react"
import { useParams } from "react-router"

function Payment() {
    const { event } = useParams()
    const [teams, setTeams] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState("pending")
    const [payments, setpayments] = useState([])

    useEffect(() => {
        api.get("/admin/event/" + event).then((res) => {
            console.log(res.data)
            setTeams(res.data.event_og || [])
            setLoading(false)
            setpayments(res.data.event.payments || [])
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


    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [newPayment, setNewPayment] = useState({
        bankName: "",
        accountNumber: "",
        ifscCode: "",
        accountName: "",
        upi: "",
        imgUrl: ""
    })

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setNewPayment(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleAddPayment = async () => {
        try {
            const res = await api.post(`/admin/payment/add/${event}`, newPayment)
            setpayments(prev => [...prev, newPayment]) // Optimistic update or use res.data.payment if structure matches
            setIsAddModalOpen(false)
            setNewPayment({
                bankName: "",
                accountNumber: "",
                ifscCode: "",
                accountName: "",
                upi: "",
                imgUrl: ""
            })
            // Ideally show a success toast here
            console.log("Payment added:", res.data)
        } catch (error) {
            console.error("Error adding payment:", error)
            alert("Failed to add payment option")
        }
    }

    const handleDeletePayment = async (indexToDelete) => {
        if (!confirm("Are you sure you want to delete this payment option?")) return

        const updatedPayments = payments.filter((_, index) => index !== indexToDelete)

        try {
            await api.put(`/admin/payment/update/${event}`, updatedPayments)
            setpayments(updatedPayments)
            console.log("Payment deleted successfully")
        } catch (error) {
            console.error("Error deleting payment:", error)
            alert("Failed to delete payment option")
        }
    }

    const [editingTeam, setEditingTeam] = useState(null)

    const handleUpdateTeam = async () => {
        if (!editingTeam) return

        try {
            const data = {
                teamName: editingTeam.name,
                lead: editingTeam.lead,
                members: editingTeam.members,
                payment: editingTeam.payment,
                verified: editingTeam.verified,
            }
            const res = await api.put(`/admin/team/update/${event}/${editingTeam._id}`, data)
            // Update local state
            setTeams(prev => prev.map(t => t._id === editingTeam._id ? editingTeam : t))
            setEditingTeam(null)
            console.log("Team updated:", res.data)
            alert("Team updated successfully")
        } catch (error) {
            console.error("Error updating team:", error)
            alert("Failed to update team")
        }
    }

    const handleEditInputChange = (e) => {
        const { name, value } = e.target
        setEditingTeam(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleLeadChange = (e) => {
        const { name, value } = e.target
        setEditingTeam(prev => ({
            ...prev,
            lead: {
                ...prev.lead,
                [name]: value
            }
        }))
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
            </div>
        )
    }

    const handleDeleteTeam = async (teamId) => {
        if (!confirm("Are you sure you want to delete this team? This action cannot be undone.")) return

        try {
            await api.delete(`/admin/team/delete/${event}/${teamId}`)
            setTeams(prev => prev.filter(t => t._id !== teamId))
            console.log("Team deleted successfully")
        } catch (error) {
            console.error("Error deleting team:", error)
            alert("Failed to delete team")
        }
    }

    const filteredTeams = getFilteredTeams();

    return (
        <div className="min-h-screen bg-black text-[#ECE8E7] p-8">
            <div className="w-full max-w-full mx-auto">
                <h1 className="text-3xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-orange-500">
                    Payment Verification
                </h1>

                {/* Payment Options Section */}
                <div className="mb-12 bg-[#111] p-6 rounded-2xl border border-[#333]">
                    <h2 className="text-2xl font-bold mb-6 text-white border-b border-[#333] pb-2">Manage Payment Options</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                        {payments.map((item, index) => (
                            <div key={index} className="relative bg-[#1A1A1A] rounded-xl overflow-hidden border border-[#333] group hover:border-orange-500/50 transition-all duration-300">
                                <button
                                    onClick={() => handleDeletePayment(index)}
                                    className="absolute top-2 right-2 p-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-full transition-all z-10"
                                    title="Delete Payment Option"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </button>

                                {item.imgUrl && (
                                    <div className="h-48 w-full overflow-hidden bg-black/50">
                                        <img src={item.imgUrl} alt="Payment Method" className="w-full h-full object-contain" />
                                    </div>
                                )}

                                <div className="p-4 space-y-2 text-sm text-gray-300">
                                    {item.bankName && <p><span className="text-gray-500">Bank:</span> {item.bankName}</p>}
                                    {item.accountNumber && <p><span className="text-gray-500">Acc No:</span> <span className="font-mono">{item.accountNumber}</span></p>}
                                    {item.ifscCode && <p><span className="text-gray-500">IFSC:</span> <span className="font-mono">{item.ifscCode}</span></p>}
                                    {item.accountName && <p><span className="text-gray-500">Name:</span> {item.accountName}</p>}
                                    {item.upi && <p><span className="text-gray-500">UPI:</span> {item.upi}</p>}
                                </div>
                            </div>
                        ))}

                        {/* Add New Button Card */}
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="flex flex-col items-center justify-center min-h-[200px] border-2 border-dashed border-[#333] hover:border-orange-500 rounded-xl text-gray-500 hover:text-orange-500 transition-all bg-[#111] hover:bg-[#1A1A1A]"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span className="font-medium">Add Payment Option</span>
                        </button>
                    </div>
                </div>

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
                            <PaymentCard
                                key={team._id}
                                team={team}
                                eventId={event}
                                onDelete={() => handleDeleteTeam(team._id)}
                                onEdit={() => setEditingTeam(team)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Edit Team Modal */}
            {editingTeam && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-[#111] border border-[#333] rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-6 text-white">Edit Team Details</h2>

                        <div className="space-y-4">
                            {/* Team Name */}
                            <div>
                                <label className="block text-sm text-gray-500 mb-1">Team Name / Participant Name</label>
                                <input
                                    type="text"
                                    name={editingTeam.teamName ? "teamName" : "name"}
                                    value={editingTeam.teamName || editingTeam.name}
                                    onChange={handleEditInputChange}
                                    className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500 transition-colors"
                                />
                            </div>

                            {/* Lead Details */}
                            {editingTeam.lead && (
                                <>
                                    <div className="border-t border-[#333] pt-4 mt-4">
                                        <h3 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">Lead Information</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm text-gray-500 mb-1">Name</label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={editingTeam.lead.name}
                                                    onChange={handleLeadChange}
                                                    className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500 transition-colors"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm text-gray-500 mb-1">Email</label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={editingTeam.lead.email}
                                                    onChange={handleLeadChange}
                                                    className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500 transition-colors"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm text-gray-500 mb-1">Phone</label>
                                                <input
                                                    type="text"
                                                    name="phone"
                                                    value={editingTeam.lead.phone}
                                                    onChange={handleLeadChange}
                                                    className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500 transition-colors"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm text-gray-500 mb-1">Roll No.</label>
                                                <input
                                                    type="text"
                                                    name="rollNumber"
                                                    value={editingTeam.lead.rollNumber}
                                                    onChange={handleLeadChange}
                                                    className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500 transition-colors"
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <label className="block text-sm text-gray-500 mb-1">College</label>
                                                <input
                                                    type="text"
                                                    name="college"
                                                    value={editingTeam.lead.college}
                                                    onChange={handleLeadChange}
                                                    className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500 transition-colors"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 mt-8">
                            <button
                                onClick={() => setEditingTeam(null)}
                                className="px-5 py-2 rounded-lg text-gray-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateTeam}
                                className="px-5 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
                            >
                                Update Team
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Payment Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-[#111] border border-[#333] rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                        <h2 className="text-xl font-bold mb-6 text-white">Add Payment Option</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-500 mb-1">Image URL (QR Code / Banner)</label>
                                <input
                                    type="text"
                                    name="imgUrl"
                                    value={newPayment.imgUrl}
                                    onChange={handleInputChange}
                                    className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500 transition-colors"
                                    placeholder="https://..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-500 mb-1">Bank Name</label>
                                    <input
                                        type="text"
                                        name="bankName"
                                        value={newPayment.bankName}
                                        onChange={handleInputChange}
                                        className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500 transition-colors"
                                        placeholder="Bank Name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-500 mb-1">Account Name</label>
                                    <input
                                        type="text"
                                        name="accountName"
                                        value={newPayment.accountName}
                                        onChange={handleInputChange}
                                        className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500 transition-colors"
                                        placeholder="Account Holder"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-500 mb-1">Account Number</label>
                                    <input
                                        type="text"
                                        name="accountNumber"
                                        value={newPayment.accountNumber}
                                        onChange={handleInputChange}
                                        className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500 transition-colors"
                                        placeholder="1234..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-500 mb-1">IFSC Code</label>
                                    <input
                                        type="text"
                                        name="ifscCode"
                                        value={newPayment.ifscCode}
                                        onChange={handleInputChange}
                                        className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500 transition-colors"
                                        placeholder="IFSC..."
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-500 mb-1">UPI ID</label>
                                <input
                                    type="text"
                                    name="upi"
                                    value={newPayment.upi}
                                    onChange={handleInputChange}
                                    className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500 transition-colors"
                                    placeholder="username@upi"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-8">
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="px-5 py-2 rounded-lg text-gray-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddPayment}
                                className="px-5 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
                            >
                                Add Payment Option
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
export default Payment