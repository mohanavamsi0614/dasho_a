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
    setEventData((prev) => {
      if (!prev) return prev;
      return { ...prev, event: { ...prev.event, status: "open" } };
    });
  };

  const onClosed = () => {
    setEventData((prev) => {
      if (!prev) return prev;
      return { ...prev, event: { ...prev.event, status: "closed" } };
    });
  };

  socket.on("eventOpen", onOpen);
  socket.on("eventClosed", onClosed);
  socket.on("autoUpdate", (val) => {
    setEventData(prev => prev ? ({ ...prev, event: { ...prev.event, auto_payment_mail: val } }) : prev)
  });

  const downloadCSV = () => {
    if (!eventData || !eventData.event_og) return;

    // Base headers
    let headers = [
      "Team Name",
      "Role",
      "Name",
      "Email",
      "Phone",
      "Roll Number",
      "College",
    ];

    // Add custom field headers
    if (eventData.event?.other) {
      eventData.event.other.forEach(f => headers.push(f.title));
    }

    // Add remaining headers
    headers.push("Payment Status", "UPI", "Verified", "Marks", "Attd-1", "Attd-2", "Attd-3");

    let csvRows = [headers];

    eventData.event_og.forEach((team) => {
      // Helper to extract custom values
      const getCustomValues = (person) => {
        if (!eventData.event?.other) return [];
        return eventData.event.other.map(f => person[f.title] || "-");
      };

      // Helper to format marks
      const marksStr = team.marks ? team.marks.map(m => `${m.name}: ${m.total}`).join(" | ") : "-";

      // Lead Row
      csvRows.push([
        team.teamName,
        "Lead",
        team.lead.name,
        team.lead.email || "",
        team.lead.phone || "",
        team.lead.rollNumber || "",
        team.lead.college || "",
        ...getCustomValues(team.lead),
        team.payment ? "Paid" : "Pending",
        team.paymentDetails?.upi || "-",
        team.verified ? "Yes" : "No",
        marksStr,
        team.lead.attd?.attd_1?.status || "Absent",
        team.lead.attd?.attd_2?.status || "Absent",
        team.lead.attd?.attd_3?.status || "Absent",
      ]);

      // Member Rows
      team.members.forEach((m) => {
        csvRows.push([
          team.teamName,
          "Member",
          m.name,
          m.email || "",
          m.phone || "",
          m.rollNumber || "",
          m.college || "",
          ...getCustomValues(m),
          "-", // Payment Status (Team level)
          "-", // UPI
          "-", // Verified
          "-", // Marks
          m.attd?.attd_1?.status || "Absent",
          m.attd?.attd_2?.status || "Absent",
          m.attd?.attd_3?.status || "Absent",
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
        <h1 className="text-3xl font-bold text-white opacity-70">Hackathon Dashboard</h1>

        <div className="flex gap-4 items-center">
          {/* Team Panel Link */}
          <a
            href={`https://dashoo-p.vercel.app/teampanel/${event}`}
            target="_blank"
            rel="noreferrer"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl font-medium transition-all shadow-md flex items-center gap-2"
          >
            <span>TeamPanel</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>

          {/* Auto Payment Toggle */}
          <button
            onClick={() => socket.emit("auto", { event, auto: !eventData?.event?.auto_payment_mail })}
            className={`px-5 py-2 rounded-xl font-medium transition-all duration-300 shadow-md border ${eventData?.event?.auto_payment_mail
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/50 hover:bg-emerald-500/20"
              : "bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700"
              }`}
          >
            Auto Mail: {eventData?.event?.auto_payment_mail ? "ON" : "OFF"}
          </button>

          {/* Open/Close Event */}
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


      {
        eventData && eventData.event_og.length > 0 ? (
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
                  ].map((h) => (
                    <th key={h} className="p-3 font-semibold text-sm border-b border-gray-700 min-w-[120px]">
                      {h}
                    </th>
                  ))}
                  {/* Custom Fields Headers */}
                  {eventData.event?.other?.map((f, i) => (
                    <th key={i} className="p-3 font-semibold text-sm border-b border-gray-700 min-w-[120px] whitespace-nowrap">
                      {f.title}
                    </th>
                  ))}
                  {[
                    "Payment",
                    "Verified",
                    "Marks",
                    "Attd 1",
                    "Attd 2",
                    "Attd 3",
                  ].map((h) => (
                    <th key={h} className="p-3 font-semibold text-sm border-b border-gray-700 min-w-[100px]">
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
                      <td className="p-3 font-semibold text-[#ECE8E7] sticky left-0 bg-[#1c1c1c]">
                        {team.teamName}
                      </td>
                      <td className="p-3 text-[#E16254] font-medium">Lead</td>
                      <td className="p-3">{team.lead.name}</td>
                      <td className="p-3 font-mono text-sm text-gray-400">{team.lead.email}</td>
                      <td className="p-3">{team.lead.phone}</td>
                      <td className="p-3">{team.lead.rollNumber}</td>
                      <td className="p-3">{team.lead.college}</td>

                      {/* Custom Fields for Lead */}
                      {eventData.event?.other?.map((f, i) => (
                        <td key={i} className="p-3 text-gray-300">
                          {team.lead[f.title] || "-"}
                        </td>
                      ))}

                      {/* Payment */}
                      <td className="p-3">
                        <div className="flex flex-col gap-1">
                          <span className={`text-xs px-2 py-0.5 rounded w-fit ${team.payment ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {team.payment ? "Paid" : "Pending"}
                          </span>
                          {team.paymentDetails?.upi && <span className="text-xs text-gray-500">{team.paymentDetails.upi}</span>}
                          {team.paymentDetails?.imgUrl && (
                            <a href={team.paymentDetails.imgUrl} target="_blank" rel="noreferrer" className="text-xs text-indigo-400 hover:underline">View QR</a>
                          )}
                        </div>
                      </td>

                      {/* Verified */}
                      <td className="p-3">
                        <span className={`text-xs px-2 py-0.5 rounded ${team.verified ? 'bg-indigo-500/20 text-indigo-400' : 'bg-gray-800 text-gray-500'}`}>
                          {team.verified ? "Yes" : "No"}
                        </span>
                      </td>

                      {/* Marks */}
                      <td className="p-3">
                        {team.marks && team.marks.length > 0 ? (
                          <div className="text-xs space-y-1">
                            {team.marks.map((m, idx) => (
                              <div key={idx} className="whitespace-nowrap">
                                <span className="text-gray-400">{m.name}:</span> <span className="text-gray-200">{m.total}</span>
                              </div>
                            ))}
                          </div>
                        ) : "-"}
                      </td>

                      {/* Attendance */}
                      <td className="p-3">
                        <span className={`${team.lead.attd?.attd_1?.status === 'Present' ? 'text-green-400' : 'text-red-400'}`}>
                          {team.lead.attd?.attd_1?.status || "-"}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`${team.lead.attd?.attd_2?.status === 'Present' ? 'text-green-400' : 'text-red-400'}`}>
                          {team.lead.attd?.attd_2?.status || "-"}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`${team.lead.attd?.attd_3?.status === 'Present' ? 'text-green-400' : 'text-red-400'}`}>
                          {team.lead.attd?.attd_3?.status || "-"}
                        </span>
                      </td>
                    </tr>

                    {team.members.map((m, i) => (
                      <tr
                        key={team._id + "-member-" + i}
                        className="border-b border-gray-800 hover:bg-[#1a1a1a] transition-colors"
                      >
                        <td className="p-3 opacity-50 sticky left-0 bg-[#1a1a1a]">"</td>
                        <td className="p-3 text-gray-500 text-sm">Member</td>
                        <td className="p-3">{m.name}</td>
                        <td className="p-3 font-mono text-sm text-gray-500">{m.email}</td>
                        <td className="p-3">{m.phone}</td>
                        <td className="p-3">{m.rollNumber}</td>
                        <td className="p-3">{m.college}</td>

                        {/* Custom Fields for Member */}
                        {eventData.event?.other?.map((f, idx) => (
                          <td key={idx} className="p-3 text-gray-300">
                            {m[f.title] || "-"}
                          </td>
                        ))}

                        <td className="p-3 text-gray-600 text-xs">-</td>
                        <td className="p-3 text-gray-600 text-xs">-</td>
                        <td className="p-3 text-gray-600 text-xs">-</td>

                        {/* Attendance (Member) */}
                        <td className="p-3">
                          <span className={`${m.attd?.attd_1?.status === 'Present' ? 'text-green-400' : 'text-red-400'}`}>
                            {m.attd?.attd_1?.status || "-"}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`${m.attd?.attd_2?.status === 'Present' ? 'text-green-400' : 'text-red-400'}`}>
                            {m.attd?.attd_2?.status || "-"}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`${m.attd?.attd_3?.status === 'Present' ? 'text-green-400' : 'text-red-400'}`}>
                            {m.attd?.attd_3?.status || "-"}
                          </span>
                        </td>
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
        )
      }
    </div >
  );
}

export default HackDashboard;
