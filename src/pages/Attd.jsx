import api from "../lib/api";
import { useEffect, useState } from "react";
import { useParams } from "react-router";

function QrDashboard() {
  const { event } = useParams();
  const [eventData, setEventData] = useState({});

  useEffect(() => {
    api
      .get(`/admin/event/${event}`)
      .then((res) => {
        setEventData(res.data);
        console.log(res.data);
      })
      .catch((err) => console.error("Error fetching event:", err));
  }, [event]);

  const toggleStatus = async () => {
    try {
      const res = await api.post(
        `/admin/event/status/${event}`,
        { status: !eventData.event?.status }
      );
      setEventData(res.data);
    } catch (err) {
      console.error("Error changing status:", err);
    }
  };

  return (
    <div className="min-h-screen font-poppins bg-[#212121] text-[#ECE8E7] p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 border-b border-[#919294] pb-4">
        <h1 className="text-3xl font-bold tracking-wide">
          {eventData.event?.eventTitle || "Event Dashboard"}
        </h1>
        <button
          onClick={toggleStatus}
          className={`px-5 py-2 rounded-xl text-white font-semibold shadow-md transition-all duration-300 ${eventData.event?.status
              ? "bg-[#E16254] hover:bg-red-700"
              : "bg-green-600 hover:bg-green-700"
            }`}
        >
          {eventData.event?.status ? "Close Event" : "Open Event"}
        </button>
      </div>

      {/* Event OGs List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {eventData.event_og?.length > 0 ? (
          eventData.event_og.map((item, index) => (
            <div
              key={index}
              className="bg-[#111111] border border-[#919294]/30 rounded-2xl p-6 shadow-md hover:shadow-[#E16254]/30 hover:scale-[1.02] transition-all duration-300"
            >
              <h3 className="text-xl font-bold text-[#ECE8E7] mb-2">{item.name}</h3>
              <div className="text-sm text-[#919294] space-y-1 mb-4">
                <p>🎓 {item.collage}</p>
                <p>📅 {item.year}</p>
                <p>💻 {item.branch}</p>
                <p>🆔 {item.rollnumber}</p>
              </div>

              {/* Check-in Section */}
              <div className="bg-[#0d0d0d] p-3 rounded-lg border border-green-600/30 mb-3">
                <p className="font-semibold text-green-400 mb-1">✅ Check-in:</p>
                <ul className="list-disc list-inside text-[#ECE8E7]/90 text-sm">
                  {(item.checkin || []).length > 0 ? (
                    item.checkin.map((i, idx) => <li key={idx}>{i}</li>)
                  ) : (
                    <li className="text-[#919294]">No check-ins yet</li>
                  )}
                </ul>
              </div>

              {/* Check-out Section */}
              <div className="bg-[#0d0d0d] p-3 rounded-lg border border-red-600/30">
                <p className="font-semibold text-[#E16254] mb-1">🚪 Check-out:</p>
                <ul className="list-disc list-inside text-[#ECE8E7]/90 text-sm">
                  {(item.checkout || []).length > 0 ? (
                    item.checkout.map((i, idx) => <li key={idx}>{i}</li>)
                  ) : (
                    <li className="text-[#919294]">No check-outs yet</li>
                  )}
                </ul>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-[#919294] col-span-full">
            No registered participants yet.
          </p>
        )}
      </div>
    </div>
  );
}

export default QrDashboard;
