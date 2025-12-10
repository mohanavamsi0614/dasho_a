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
        console.log(res.data)
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
    socket.emit("join", [event])

  }, [event]);

  const openEvent = async () => {
    socket.emit("openEvent", event)
  }

  const closeEvent = async () => {
    socket.emit("closeEvent", event)
  }
  const onOpen = () => {
    console.log(eventData)
    setEventData((prev) => {
      if (!prev) return prev;
      return { ...prev, event: { ...prev.event, status: "open" } };
    });
  };

  const onClosed = () => {
    console.log(eventData)
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
      <p className="text-center text-gray-400 mt-10 text-lg">Loading...</p>
    );

  return (
    <div className="min-h-screen font-poppins bg-[#212121] text-white p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Hackathon Dashboard</h1>
        <div className="flex gap-4">
          <button
            onClick={eventData?.event?.status == "open" ? closeEvent : openEvent}
            className={`px-6 py-2 rounded-xl font-medium shadow-md transition-all duration-300 ${eventData?.event?.status == "open"
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-green-600 hover:bg-green-700 text-white"
              }`}
          >
            {eventData?.event?.status == "open" ? "Close Event" : "Open Event"}
          </button>
          <button
            onClick={downloadCSV}
            className="bg-[#E16254] hover:bg-[#c65248] text-white px-6 py-2 rounded-xl shadow-md transition-all duration-300"
          >
            Download CSV
          </button>
        </div>
      </div>


      {eventData && eventData.event_og.length > 0 ? (
        <div className="overflow-x-auto bg-[#111111] border border-gray-700 rounded-2xl shadow-lg">
          <table className="min-w-full border-collapse">
            <thead className="bg-[#1c1c1c] text-[#ECE8E7]">
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
                  <th key={h} className="p-3 font-semibold text-sm border-b border-gray-700">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {eventData.event_og.map((team) => (
                <>
                  <tr
                    key={team._id + "-lead"}
                    className="border-b border-gray-800 hover:bg-[#1c1c1c] transition-colors"
                  >
                    <td className="p-3 font-semibold text-[#ECE8E7]">
                      {team.teamName}
                    </td>
                    <td className="p-3 text-[#E16254] font-medium">Lead</td>
                    <td className="p-3">{team.lead.name}</td>
                    <td className="p-3">{team.lead.email}</td>
                    <td className="p-3">{team.lead.phone}</td>
                    <td className="p-3">{team.lead.rollNumber}</td>
                    <td className="p-3">{team.lead.college}</td>
                    <td className="p-3">{team.lead["Attd-1"] || "P"}</td>
                    <td className="p-3">{team.lead["Attd-2"] || "P"}</td>
                    <td className="p-3">{team.lead["Attd-3"] || "P"}</td>
                  </tr>

                  {team.members.map((m, i) => (
                    <tr
                      key={team._id + "-member-" + i}
                      className="border-b border-gray-800 hover:bg-[#1a1a1a] transition-colors"
                    >
                      <td className="p-3">{team.teamName}</td>
                      <td className="p-3 text-gray-400">Member</td>
                      <td className="p-3">{m.name}</td>
                      <td className="p-3">{m.email}</td>
                      <td className="p-3">{m.phone}</td>
                      <td className="p-3">{m.rollNumber}</td>
                      <td className="p-3">{m.college}</td>
                      <td className="p-3">{m["Attd-1"] || "P"}</td>
                      <td className="p-3">{m["Attd-2"] || "P"}</td>
                      <td className="p-3">{m["Attd-3"] || "P"}</td>
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center text-gray-500 mt-10 text-lg">
          No teams found.
        </p>
      )}
    </div>
  );
}

export default HackDashboard;
