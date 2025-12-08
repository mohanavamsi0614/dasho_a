import PaymentCard from "@/components/PaymentCard"
import axios from "axios"
import { useEffect, useState } from "react"
import { useParams } from "react-router"

function Payment() {
    const { event } = useParams()
    const [teams, setTeams] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        axios.get("http://localhost:6100/admin/event/" + event).then((res) => {
            console.log(res.data)
            setTeams(res.data.event_og || [])
            setLoading(false)
        }).catch(err => {
            console.error(err)
            setLoading(false)
        })
    }, [event])

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black text-[#ECE8E7] p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-orange-500">
                    Payment Verification ({teams.length})
                </h1>

                {teams.length === 0 ? (
                    <div className="text-center text-gray-500 mt-20">
                        No teams found for this event.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {teams.sort((a, b) => { return b.verify ? 1 : -1 }).map((team) => (
                            <PaymentCard key={team._id} team={team} eventId={event} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
export default Payment