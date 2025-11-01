import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router";

function HackAttd() {
  const { event } = useParams();
  const [eventData, setEventData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState({});
  const [selectedAttd, setSelectedAttd] = useState("Attd-1");

  useEffect(() => {
    axios
      .get(`https://dasho-backend.onrender.com/admin/event/${event}`)
      .then((res) => {
        const data = res.data.event_og || [];
        setEventData(data);

        // Initialize attendance with "Absent"
        const init = {};
        data.forEach((team) => {
          init[team._id] = {
            lead: {
              ...team.lead,
              "Attd-1": "Absent",
              "Attd-2": "Absent",
              "Attd-3": "Absent",
            },
            members:
              team.members?.map((m) => ({
                ...m,
                "Attd-1": "Absent",
                "Attd-2": "Absent",
                "Attd-3": "Absent",
              })) || [],
          };
        });
        setAttendance(init);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching event:", err);
        setLoading(false);
      });
  }, [event]);

  const toggleLead = (teamId) => {
    setAttendance((prev) => ({
      ...prev,
      [teamId]: {
        ...prev[teamId],
        lead: {
          ...prev[teamId].lead,
          [selectedAttd]:
            prev[teamId].lead[selectedAttd] === "Present"
              ? "Absent"
              : "Present",
        },
      },
    }));
  };

  const toggleMember = (teamId, index) => {
    setAttendance((prev) => {
      const updatedMembers = [...prev[teamId].members];
      updatedMembers[index][selectedAttd] =
        updatedMembers[index][selectedAttd] === "Present"
          ? "Absent"
          : "Present";
      return {
        ...prev,
        [teamId]: { ...prev[teamId], members: updatedMembers },
      };
    });
  };

  const submitAttendance = async (teamId) => {
    try {
      const { lead, members } = attendance[teamId];
      console.log("Submitting:", lead, members);

      await axios.post(
        `https://dasho-backend.onrender.com/admin/attd/${event}/${teamId}`,
        { lead, members }
      );

      alert(`✅ ${selectedAttd} recorded for ${lead.name}'s team`);
    } catch (err) {
      console.error("Error submitting attendance:", err);
      alert("❌ Failed to record attendance");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#212121] text-gray-300 flex justify-center items-center">
        <p>Loading event details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111] text-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold">
          Attendance Dashboard – {event}
        </h1>
        <select
          value={selectedAttd}
          onChange={(e) => setSelectedAttd(e.target.value)}
          className="bg-[#1e1e1e] text-white border border-gray-600 px-3 py-2 rounded-lg"
        >
          {["Attd-1", "Attd-2", "Attd-3"].map((attd) => (
            <option key={attd} value={attd}>
              {attd}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {eventData.map((team) => {
          const t = attendance[team._id];
          if (!t) return null;
          return (
            <div
              key={team._id}
              className="bg-[#1e1e1e] p-4 rounded-2xl shadow-md border border-gray-700"
            >
              <h2 className="text-xl font-bold text-white mb-2">
                {team.teamName}
              </h2>
              <div className="border-t border-gray-700 my-2"></div>

              {/* Lead */}
              <p className="text-red-400 font-semibold">Team Lead</p>
              <div
                className="flex justify-between items-center bg-[#2a2a2a] p-2 rounded-md cursor-pointer"
                onClick={() => toggleLead(team._id)}
              >
                <div>
                  <p>{t.lead.name}</p>
                  <p className="text-sm text-gray-400">{t.lead.email}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    t.lead[selectedAttd] === "Present"
                      ? "bg-green-600"
                      : "bg-gray-600"
                  }`}
                >
                  {t.lead[selectedAttd]}
                </span>
              </div>

              {/* Members */}
              <p className="text-red-400 font-semibold mt-4">Members</p>
              {t.members.length ? (
                t.members.map((m, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center bg-[#2a2a2a] p-2 rounded-md cursor-pointer"
                    onClick={() => toggleMember(team._id, idx)}
                  >
                    <div>
                      <p>{m.name}</p>
                      <p className="text-sm text-gray-400">{m.email}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        m[selectedAttd] === "Present"
                          ? "bg-green-600"
                          : "bg-gray-600"
                      }`}
                    >
                      {m[selectedAttd]}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-sm">No members listed</p>
              )}

              <button
                onClick={() => submitAttendance(team._id)}
                className="w-full mt-4 bg-red-500 hover:bg-red-600 transition rounded-lg py-2 text-white font-medium"
              >
                Submit {selectedAttd}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default HackAttd;
