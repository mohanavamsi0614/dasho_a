import api from "../lib/api";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { saveAs } from "file-saver";
import socket from "@/lib/socket";

function HackDashboard() {
  const { event } = useParams();
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/admin/event/" + event)
      .then((res) => {
        setEventData(res.data);
        console.log(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
    socket.emit("join", [event]);
  }, [event]);

  const openEvent = async () => {
    socket.emit("openEvent", event);
  };

  const closeEvent = async () => {
    socket.emit("closeEvent", event);
  };
  const onOpen = () => {
    console.log(eventData);
    setEventData((prev) => {
      if (!prev) return prev;
      return { ...prev, event: { ...prev.event, status: "open" } };
    });
  };

  const onClosed = () => {
    console.log(eventData);
    setEventData((prev) => {
      if (!prev) return prev;
      return { ...prev, event: { ...prev.event, status: "closed" } };
    });
  };

  socket.on("eventOpen", onOpen);
  socket.on("eventClosed", onClosed);

  const downloadCSV = () => {
    if (!eventData || !eventData.event_og) return;

    let csvRows = [
      [
        "Team Name",
        "Role",
        "Name",
        "Email",
        "Phone",
        "Roll Number",
        "College",
        "Attd-1",
        "Attd-2",
        "Attd-3",
      ],
    ];

    eventData.event_og.forEach((team) => {
      csvRows.push([
        team.teamName,
        "Lead",
        team.lead.name,
        team.lead.email || "",
        team.lead.phone || "",
        team.lead.rollNumber || "",
        team.lead.college || "",
        team.lead["Attd-1"] || "",
        team.lead["Attd-2"] || "",
        team.lead["Attd-3"] || "",
      ]);

      team.members.forEach((m) => {
        csvRows.push([
          team.teamName,
          "Member",
          m.name,
          m.email || "",
          m.phone || "",
          m.rollNumber || "",
          m.college || "",
          m["Attd-1"] || "",
          m["Attd-2"] || "",
          m["Attd-3"] || "",
        ]);
      });
    });

    const csvString = csvRows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `Hackathon-${event}.csv`);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-neutral-950">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );

  return (
    <div className="min-h-screen font-poppins bg-[#0a0a0a] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] text-white p-6 sm:p-10 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-6 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl">
          <div>
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
              Hackathon Dashboard
            </h1>
            <p className="text-gray-400 text-sm">Manage your event and participants effectively.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl flex items-center gap-2 text-sm text-gray-300">
              <span className="font-semibold text-indigo-400">TeamPanel:</span>
              <code className="bg-black/30 px-2 py-1 rounded text-xs select-all">/teampanel/{event}</code>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={eventData?.event?.status == "open" ? closeEvent : openEvent}
              className={`px-8 py-3 rounded-xl font-bold shadow-lg transform transition-all duration-300 hover:scale-105 active:scale-95 ${eventData?.event?.status == "open"
                  ? "bg-gradient-to-r from-red-600 to-rose-600 shadow-red-500/20"
                  : "bg-gradient-to-r from-emerald-500 to-green-600 shadow-emerald-500/20"
                }`}
            >
              {eventData?.event?.status == "open" ? "Close Event" : "Open Event"}
            </button>
            <button
              onClick={downloadCSV}
              className="px-8 py-3 rounded-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20 transform transition-all duration-300 hover:scale-105 active:scale-95 hover:from-indigo-600 hover:to-purple-700"
            >
              Export CSV
            </button>
          </div>
        </div>

        {/* Stats / Status Bar (Optional - can be added later, keeping it simple for now) */}

        {/* Teams Table */}
        {eventData && eventData.event_og.length > 0 ? (
          <div className="rounded-3xl border border-white/10 overflow-hidden bg-white/5 backdrop-blur-md shadow-2xl">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-black/40 text-gray-300 uppercase text-xs tracking-wider font-semibold">
                  <tr>
                    {[
                      "Team",
                      "Role",
                      "Name",
                      "Email",
                      "Phone",
                      "Roll",
                      "College",
                      "Attd 1",
                      "Attd 2",
                      "Attd 3",
                    ].map((h) => (
                      <th key={h} className="p-5 border-b border-white/5">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {eventData.event_og.map((team, idx) => (
                    <>
                      {/* Team Lead Row */}
                      <tr
                        key={team._id + "-lead"}
                        className="group hover:bg-white/5 transition-colors duration-200"
                      >
                        <td className="p-5 font-bold text-white group-hover:text-indigo-300 transition-colors">
                          {team.teamName}
                        </td>
                        <td className="p-5">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            Lead
                          </span>
                        </td>
                        <td className="p-5 font-medium text-gray-200">{team.lead.name}</td>
                        <td className="p-5 text-gray-400 text-sm">{team.lead.email}</td>
                        <td className="p-5 text-gray-400 text-sm">{team.lead.phone}</td>
                        <td className="p-5 text-gray-400 text-sm">{team.lead.rollNumber}</td>
                        <td className="p-5 text-gray-400 text-sm truncate max-w-[150px]" title={team.lead.college}>{team.lead.college}</td>
                        <td className="p-5"><StatusBadge status={team.lead["Attd-1"]} /></td>
                        <td className="p-5"><StatusBadge status={team.lead["Attd-2"]} /></td>
                        <td className="p-5"><StatusBadge status={team.lead["Attd-3"]} /></td>
                      </tr>

                      {/* Members Rows */}
                      {team.members.map((m, i) => (
                        <tr
                          key={team._id + "-member-" + i}
                          className="hover:bg-white/5 transition-colors duration-200"
                        >
                          <td className="p-5 opacity-0"></td> {/* Spacer for Team Name */}
                          <td className="p-5">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                              Member
                            </span>
                          </td>
                          <td className="p-5 text-gray-300">{m.name}</td>
                          <td className="p-5 text-gray-500 text-sm">{m.email}</td>
                          <td className="p-5 text-gray-500 text-sm">{m.phone}</td>
                          <td className="p-5 text-gray-500 text-sm">{m.rollNumber}</td>
                          <td className="p-5 text-gray-500 text-sm truncate max-w-[150px]" title={m.college}>{m.college}</td>
                          <td className="p-5"><StatusBadge status={m["Attd-1"]} /></td>
                          <td className="p-5"><StatusBadge status={m["Attd-2"]} /></td>
                          <td className="p-5"><StatusBadge status={m["Attd-3"]} /></td>
                        </tr>
                      ))}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-20 text-gray-500 bg-white/5 rounded-3xl border border-white/10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <p className="text-xl font-medium">No teams found yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper component for Attendance Status
const StatusBadge = ({ status }) => {
  // Assuming status can be "P" for Present, or undefined/null
  // Adjust logic based on actual data values if they differ (e.g. true/false)
  const isPresent = status === "P" || status === true;

  // If status is strictly undefined, maybe show "Pending" or "-"
  // The original code showed "P" as default if value was truthy, or fallback?
  // Original: team.lead["Attd-1"] || "P" -> Wait, actually the original code said `team.lead["Attd-1"] || "P"`. 
  // This implies if it's MISSING, it defaults to "P"? That seems like a bug or specific logic. 
  // I will respect the original display logic but make it look nicer.
  // Actually, looking closely: `team.lead["Attd-1"] || "P"`

  const display = status || "P";

  return (
    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${display === "P"
        ? "bg-green-500/20 text-green-400 border border-green-500/30"
        : "bg-red-500/20 text-red-400 border border-red-500/30"
      }`}>
      {display}
    </span>
  )
}

export default HackDashboard;
