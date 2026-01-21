/* eslint-disable react/prop-types */
import axios from "axios"
import api from "../lib/api"
import { useState } from "react"

function PaymentCard({ team, eventId, onDelete, onEdit }) {
    const [verifying, setVerifying] = useState(false)
    const [verified, setVerified] = useState(team.verified || false)
    const [reminderLoading, setReminderLoading] = useState(false)

    const [showDetails, setShowDetails] = useState(false)

    function verifyPayment() {
        setVerifying(true)
        // Check if it's a team (has members/lead) or individual (QR event)
        const isHackathon = !!team.members;

        let payload = {};
        if (isHackathon) {
            const members = team.members.map((member) => member.email)
            members.push(team.lead.email)
            payload = { teamName: team.teamName, members: members };
        } else {
            // QR Event participant
            payload = { name: team.name, email: team.email };
        }

        const url = isHackathon
            ? "/admin/payment/hackthon/verify/" + eventId + "/" + team._id
            : "/admin/payment/qr/verify/" + eventId + "/" + team._id; // Assuming this endpoint exists based on plan

        api.post(url, payload)
            .then((res) => {
                console.log(res.data)
                setVerified(true)
                alert("Payment verified successfully!")
            })
            .catch(err => {
                console.error(err)
                alert("Verification failed")
            })
            .finally(() => setVerifying(false))
    }

    return (
        <div className="bg-[#111] border border-gray-800 rounded-xl p-6 shadow-lg hover:shadow-red-500/10 transition-all duration-300 relative group">
            {/* Action Buttons */}
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10">
                <button
                    onClick={onEdit}
                    className="p-2 bg-blue-500/10 text-blue-500 rounded-full hover:bg-blue-500 hover:text-white transition-all duration-200"
                    title="Edit Team"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                </button>
                <button
                    onClick={onDelete}
                    className="p-2 bg-red-500/10 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all duration-200"
                    title="Delete Team"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>

            <div className="flex justify-between items-start mb-4 pr-10">
                <h2 className="text-xl font-bold text-white truncate w-full" title={team.teamName || team.name}>
                    {team.teamName || team.name}
                </h2>
                <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${team.payment
                    ? (verified ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400")
                    : "bg-red-500/20 text-red-400"
                    }`}>
                    {team.payment ? (verified ? "Verified" : "Pending") : "Not Paid"}
                </span>
            </div>

            {/* Team Details Section */}
            <div className="mb-6 border-b border-gray-800 pb-4">
                <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="w-full flex items-center justify-between text-sm text-gray-400 hover:text-white transition-colors bg-[#1a1a1a] p-2 rounded-lg"
                >
                    <span className="font-medium">Team Details (Lead & Members)</span>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-4 w-4 transition-transform duration-200 ${showDetails ? "rotate-180" : ""}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {showDetails && (
                    <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                        {/* Lead Details */}
                        {team.rollNumber && (
                            <div className="bg-[#1a1a1a]/50 p-3 rounded-lg border border-gray-800/50">
                                <h3 className="text-xs uppercase tracking-wider text-[#E16254] font-bold mb-2">Team Lead</h3>
                                <div className="grid grid-cols-1 gap-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Roll Number:</span>
                                        <span className="text-gray-200 font-medium">{team.rollNumber}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Stream</span>
                                        <span>{team.stream}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Branch</span>
                                        <span>{team.branch}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        {team.lead && (
                            <div className="bg-[#1a1a1a]/50 p-3 rounded-lg border border-gray-800/50">
                                <h3 className="text-xs uppercase tracking-wider text-[#E16254] font-bold mb-2">Team Lead</h3>
                                <div className="grid grid-cols-1 gap-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Name:</span>
                                        <span className="text-gray-200 font-medium">{team.lead.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Email:</span>
                                        <span className="text-gray-200 font-mono text-xs">{team.lead.email}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Phone:</span>
                                        <span className="text-gray-200">{team.lead.phone}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Roll:</span>
                                        <span className="text-gray-200">{team.lead.rollNumber}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">College:</span>
                                        <span className="text-gray-200 text-right truncate ml-2">{team.lead.college}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Members Details */}
                        {team.members && team.members.length > 0 && (
                            <div className="space-y-2">
                                <h3 className="text-xs uppercase tracking-wider text-gray-400 font-bold px-1">Members ({team.members.length})</h3>
                                {team.members.map((member, idx) => (
                                    <div key={idx} className="bg-[#1a1a1a]/50 p-3 rounded-lg border border-gray-800/50">
                                        <div className="grid grid-cols-1 gap-1 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Name:</span>
                                                <span className="text-gray-300">{member.name}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Email:</span>
                                                <span className="text-gray-400 font-mono text-xs">{member.email}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Phone:</span>
                                                <span className="text-gray-400">{member.phone}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Roll:</span>
                                                <span className="text-gray-400">{member.rollNumber}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">College:</span>
                                                <span className="text-gray-400 text-right truncate ml-2">{member.college}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {team.payment ? (
                <div className="space-y-4">
                    <div className="bg-[#1a1a1a] p-3 rounded-lg border border-gray-800">
                        <p className="text-xs text-gray-500 mb-1">UPI Transaction ID / Reference</p>
                        <p className="text-sm font-mono text-gray-300 break-all">
                            {team.paymentDetails?.upi || "N/A"}
                        </p>
                    </div>

                    {team.paymentDetails?.imgUrl ? (
                        <div className="relative group/image">
                            <img
                                src={team.paymentDetails.imgUrl}
                                alt="Payment Screenshot"
                                className="w-full h-48 object-cover rounded-lg border border-gray-700 cursor-pointer hover:opacity-90 transition"
                                onClick={() => window.open(team.paymentDetails.imgUrl, '_blank')}
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition bg-black/50 rounded-lg pointer-events-none">
                                <span className="text-white text-sm font-medium">Click to view</span>
                            </div>
                        </div>
                    ) : (
                        <div className="h-48 bg-[#1a1a1a] rounded-lg flex items-center justify-center border border-gray-800 border-dashed">
                            <p className="text-gray-500 text-sm">No screenshot uploaded</p>
                        </div>
                    )}

                    {!verified && (
                        <button
                            onClick={verifyPayment}
                            disabled={verifying}
                            className="w-full py-2.5 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {verifying ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Verifying...
                                </>
                            ) : (
                                "Verify Payment"
                            )}
                        </button>
                    )}

                    {verified && (
                        <div className="w-full py-2.5 bg-green-600/20 border border-green-600/50 text-green-400 font-medium rounded-lg text-center">
                            Payment Verified
                        </div>
                    )}
                </div>
            ) : (
                <div className="h-40 flex flex-col items-center justify-center text-center border border-gray-800 border-dashed rounded-lg bg-[#1a1a1a]/50 p-4 gap-3">
                    <div className="text-gray-500 text-sm italic">
                        Payment proof not yet uploaded
                    </div>
                    <button
                        onClick={() => {
                            if (confirm("Send payment reminder email to team?")) {
                                setReminderLoading(true);
                                api.post(`/admin/payment_remider/${eventId}/${team._id}`)
                                    .then(() => alert("Reminder sent successfully!"))
                                    .catch(err => {
                                        console.error(err);
                                        alert("Failed to send reminder.");
                                    })
                                    .finally(() => setReminderLoading(false));
                            }
                        }}
                        disabled={reminderLoading}
                        className="px-4 py-2 bg-amber-600/10 text-amber-500 border border-amber-600/20 hover:bg-amber-600/20 rounded-lg text-sm font-medium transition-all flex items-center gap-2 hover:shadow-lg hover:shadow-amber-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {reminderLoading ? (
                            <div className="w-3 h-3 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></div>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        )}
                        {reminderLoading ? "Sending..." : "Send Reminder"}
                    </button>
                </div>
            )}
        </div>
    )
}
export default PaymentCard