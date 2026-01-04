/* eslint-disable react/prop-types */
import axios from "axios"
import api from "../lib/api"
import { useState } from "react"

function PaymentCard({ team, eventId }) {
    const [verifying, setVerifying] = useState(false)
    const [verified, setVerified] = useState(team.verified || false)
    const [reminderLoading, setReminderLoading] = useState(false)

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
        <div className="bg-[#111] border border-gray-800 rounded-xl p-6 shadow-lg hover:shadow-red-500/10 transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-white truncate" title={team.teamName || team.name}>
                    {team.teamName || team.name}
                </h2>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${team.payment
                    ? (verified ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400")
                    : "bg-red-500/20 text-red-400"
                    }`}>
                    {team.payment ? (verified ? "Verified" : "Paid (Pending)") : "Not Paid"}
                </span>
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
                        <div className="relative group">
                            <img
                                src={team.paymentDetails.imgUrl}
                                alt="Payment Screenshot"
                                className="w-full h-48 object-cover rounded-lg border border-gray-700 cursor-pointer hover:opacity-90 transition"
                                onClick={() => window.open(team.paymentDetails.imgUrl, '_blank')}
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black/50 rounded-lg pointer-events-none">
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