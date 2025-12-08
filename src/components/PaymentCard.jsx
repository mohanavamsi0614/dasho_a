/* eslint-disable react/prop-types */
import api from "../lib/api"
import { useState } from "react"

function PaymentCard({ team, eventId }) {
    const [verifying, setVerifying] = useState(false)
    const [verified, setVerified] = useState(team.verified || false) // Assuming backend has this field, or rely on local state for now

    function verifyPayment() {
        setVerifying(true)
        const members = team.members.map((member) => member.email)
        members.push(team.lead.email)
        api.post("/admin/payment/hackthon/verify/" + eventId + "/" + team._id, { teamName: team.teamName, members: members })
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
                <h2 className="text-xl font-bold text-white truncate" title={team.teamName}>
                    {team.teamName}
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
                <div className="h-40 flex items-center justify-center text-gray-600 text-sm italic border border-gray-800 border-dashed rounded-lg bg-[#1a1a1a]/50">
                    Waiting for payment...
                </div>
            )}
        </div>
    )
}
export default PaymentCard