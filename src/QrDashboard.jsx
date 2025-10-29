import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router";

function QrDashboard() {
  const { event } = useParams();
  const [eventData, setEventData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`https://dasho-backend.onrender.com/admin/event/${event}`)
      .then((res) => {
        setEventData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching event:", err);
        setLoading(false);
      });
  }, [event]);

  const toggleStatus = async () => {
    try {
      const res = await axios.post(
        `https://dasho-backend.onrender.com/admin/event/status/${event}`,
        { status: !eventData.event?.status }
      );
      setEventData(res.data);
    } catch (err) {
      console.error("Error changing status:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-gray-300 flex justify-center items-center">
        <p>Loading event details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-gray-200 px-6 py-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-semibold text-white">
            {eventData.event?.eventTitle || "QR Event Dashboard"}
          </h1>
          <button
            onClick={toggleStatus}
            className={`px-5 py-2 rounded-lg font-medium transition-all duration-200 ${
              eventData.event?.status
                ? "bg-red-600 hover:bg-red-700"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {eventData.event?.status ? "Close Event" : "Open Event"}
          </button>
        </div>

        {/* Summary Info */}
        <div className="bg-[#111] border border-gray-800 rounded-xl p-6 mb-10">
          <h2 className="text-xl font-medium text-white mb-3">Event Details</h2>
          <div className="grid md:grid-cols-2 gap-4 text-gray-400">
            <p>
              <span className="text-gray-300">Venue:</span>{" "}
              {eventData.event?.venue || "N/A"}
            </p>
            <p>
              <span className="text-gray-300">Start:</span>{" "}
              {eventData.event?.startDate} {eventData.event?.startTime}
            </p>
            <p>
              <span className="text-gray-300">End:</span>{" "}
              {eventData.event?.endDate || "-"}
            </p>
            <p>
              <span className="text-gray-300">Type:</span>{" "}
              {eventData.event?.type || "QR"}
            </p>
          </div>
        </div>

        {/* Participants Section */}
        <div>
          <h2 className="text-2xl font-semibold text-white mb-6">
            Participants ({eventData.event_og?.length || 0})
          </h2>

          {eventData.event_og?.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {eventData.event_og.map((item, index) => (
                <div
                  key={index}
                  className="bg-[#111] border border-gray-800 rounded-xl p-5 shadow-md hover:shadow-red-500/10 transition-all"
                >
                  <h3 className="text-lg font-semibold text-white mb-1">
                    {item.name}
                  </h3>
                  <p className="text-gray-400 text-sm mb-1">{item.collage}</p>
                  <p className="text-gray-400 text-sm mb-1">
                    {item.year} • {item.branch}
                  </p>
                  <p className="text-gray-300 text-sm font-medium mb-3">
                    Roll: {item.rollnumber}
                  </p>

                  {/* Check-in list */}
                  <div className="mb-3">
                    <p className="font-semibold text-green-500 mb-1">
                      ✅ Check-in:
                    </p>
                    <ul className="list-disc list-inside text-gray-400 text-sm">
                      {(item.checkin || []).length > 0 ? (
                        item.checkin.map((i, idx) => <li key={idx}>{i}</li>)
                      ) : (
                        <li>No check-ins</li>
                      )}
                    </ul>
                  </div>

                  {/* Check-out list */}
                  <div>
                    <p className="font-semibold text-red-500 mb-1">
                      🚪 Check-out:
                    </p>
                    <ul className="list-disc list-inside text-gray-400 text-sm">
                      {(item.checkout || []).length > 0 ? (
                        item.checkout.map((i, idx) => <li key={idx}>{i}</li>)
                      ) : (
                        <li>No check-outs</li>
                      )}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No participants registered yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default QrDashboard;
