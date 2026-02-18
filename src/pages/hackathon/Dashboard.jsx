import api from "@/lib/api";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { saveAs } from "file-saver";
import socket from "@/lib/socket";
import Logo from "@/assets/image.png";
import { Users } from "lucide-react";

function HackDashboard() {
  const { event } = useParams();
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState([]); // Local state for immediate UI updates
  const [editingTeam, setEditingTeam] = useState(null);
  const [expandedTeamId, setExpandedTeamId] = useState(null);

  useEffect(() => {
    api
      .get("/admin/event/" + event)
      .then((res) => {
        setEventData(res.data);
        setTeams(res.data.event_og || []);
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
  const handleAddMember = () => {
    if (eventData.event.maxTeamMembers > editingTeam.members.length + 1) {
      setEditingTeam({ ...editingTeam, members: [...editingTeam.members, { name: "", rollNumber: "", college: "" }] })
    }
    else {
      alert("Maximum number of members reached")
    }
  }
  const handleMemberChange = (index, e) => {
    const { name, value } = e.target;
    setEditingTeam({ ...editingTeam, members: editingTeam.members.map((member, i) => i === index ? { ...member, [name]: value } : member) })
  }

  const handleRemoveMember = (index) => {
    setEditingTeam({ ...editingTeam, members: editingTeam.members.filter((_, i) => i !== index) })
  }

  socket.on("eventOpen", onOpen);
  socket.on("eventClosed", onClosed);
  socket.on("autoUpdate", (val) => {
    setEventData((prev) =>
      prev
        ? { ...prev, event: { ...prev.event, auto_payment_mail: val } }
        : prev
    );
  });

  const downloadCSV = () => {
    if (!eventData || !teams) return;

    const safe = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;

    let headers = [
      "Team Name",
      "Role",
      "Name",
      "Email",
      "Phone",
      "Roll Number",
      "College",
      "Branch",
      "Stream",
      "Year"
    ];

    if (eventData.event?.other) {
      eventData.event.other.forEach((f) => headers.push(f.title));
    }

    headers.push("Payment", "UPI", "Verified");
    eventData.event.attd.forEach((i) => headers.push(i))
    eventData.event.attd.forEach((i) => headers.push(i + "-" + "img"))

    if (eventData.event?.rounds) {
      eventData.event.rounds.forEach(round => {
        headers.push(`${round.name} (Total)`);
        if (round.catogary) {
          round.catogary.forEach(cat => {
            headers.push(`${round.name} - ${cat.title}`);
          });
        }
      });
    }


    let csvRows = [headers];

    const getCustomValues = (person) => {
      if (!eventData.event?.other) return [];
      return eventData.event.other.map((f) => person[f.title] || "-");
    };
    teams.forEach((team) => {
      const leadRow = [
        team.teamName,
        "Lead",
        team.lead.name,
        team.lead.email,
        team.lead.phone,
        team.lead.rollNumber,
        team.lead.college,
        team.lead.branch,
        team.lead.stream,
        team.lead.year,
        ...getCustomValues(team.lead),
        team.payment ? "Paid" : "Pending",
        team.paymentDetails?.upi || "-",
        team.verified ? "Yes" : "No",
      ];
      eventData.event.attd.forEach((i) => leadRow.push(team.lead?.attd?.[i]?.status || "-"));
      eventData.event.attd.forEach((i) => leadRow.push(team.lead?.attd?.[i]?.img || "-"));

      if (eventData.event?.rounds) {
        eventData.event.rounds.forEach(round => {
          const roundData = team.marks?.find(m => m.name === round.name);
          leadRow.push(roundData?.total || "-");
          if (round.catogary) {
            round.catogary.forEach(cat => {
              leadRow.push(roundData?.marks?.[cat.title] || "-");
            });
          }
        });
      }
      csvRows.push(leadRow);

      team.members.forEach((m) => {
        const memberRow = [
          team.teamName,
          "Member",
          m.name,
          m.email,
          m.phone,
          m.rollNumber,
          m.college,
          m.branch,
          m.stream,
          m.year,
          ...getCustomValues(m),
          team.payment ? "Paid" : "Pending",
          team.paymentDetails?.upi || "-",
          team.verified ? "Yes" : "No",
        ];
        eventData.event.attd.forEach((i) => memberRow.push(m?.attd?.[i]?.status || "-"));
        eventData.event.attd.forEach((i) => memberRow.push(m?.attd?.[i]?.img || "-"));

        if (eventData.event?.rounds) {
          eventData.event.rounds.forEach(round => {
            const roundData = team.marks?.find(m => m.name === round.name);
            memberRow.push(roundData?.total || "-");
            if (round.catogary) {
              round.catogary.forEach(cat => {
                memberRow.push(roundData?.marks?.[cat.title] || "-");
              });
            }
          });
        }
        csvRows.push(memberRow);
      });
    });

    const csvString = csvRows
      .map((r) => r.map(safe).join(","))
      .join("\n");

    const blob = new Blob([csvString], {
      type: "text/csv;charset=utf-8;"
    });

    saveAs(blob, `Hackathon-${event}.csv`);
  };


  const handleDeleteTeam = async (teamId) => {
    if (
      !confirm(
        "Are you sure you want to delete this team? This action cannot be undone."
      )
    )
      return;

    try {
      await api.delete(`/admin/team/delete/${event}/${teamId}`);
      setTeams((prev) => prev.filter((t) => t._id !== teamId));
      console.log("Team deleted successfully");
    } catch (error) {
      console.error("Error deleting team:", error);
      alert("Failed to delete team");
    }
  };

  const handleUpdateTeam = async () => {
    if (!editingTeam) return;

    try {
      const data = {
        teamName: editingTeam.teamName || editingTeam.name,
        lead: editingTeam.lead,
        members: editingTeam.members,
        payment: editingTeam.payment,
        verified: editingTeam.verified,
      };
      const res = await api.put(
        `/admin/team/update/${event}/${editingTeam._id}`,
        data
      );
      // Update local state
      setTeams((prev) =>
        prev.map((t) => (t._id === editingTeam._id ? editingTeam : t))
      );
      setEditingTeam(null);
      console.log("Team updated:", res.data);
      alert("Team updated successfully");
    } catch (error) {
      console.error("Error updating team:", error);
      alert("Failed to update team");
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditingTeam((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLeadChange = (e) => {
    const { name, value } = e.target;
    setEditingTeam((prev) => ({
      ...prev,
      lead: {
        ...prev.lead,
        [name]: value,
      },
    }));
  };


  if (loading)
    return (
      <div className="min-h-screen bg-[#212121] text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );

  return (
    <div className="min-h-screen font-poppins bg-[#212121] text-white p-8">
      {/* Header Section */}
      <div className="relative mb-8 rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-[#161616]">
        {/* Banner Background */}
        {eventData?.event?.bannerUrl && (
          <div className="absolute inset-0 z-0">
            <img src={eventData.event.bannerUrl} alt="Banner" className="w-full h-full object-cover opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#161616] via-[#161616]/80 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#161616] via-[#161616]/50 to-transparent"></div>
          </div>
        )}

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-end p-8 gap-6">
          <div className="flex items-center gap-6">
            {eventData?.event?.logoUrl ? (
              <img src={eventData.event.logoUrl} alt="Logo" className="w-24 h-24 object-contain rounded-2xl border-2 border-white/10 bg-black/40 p-2 shadow-xl" />
            ) : (
              <img src={Logo} alt="Logo" className="w-24 h-24 object-contain rounded-full border-2 border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.3)]" />
            )}
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-widest mb-2 border border-indigo-500/30">
                Admin Dashboard
              </span>
              <h1 className="text-4xl md:text-5xl font-black text-white mb-2 leading-tight">
                {eventData?.event?.eventTitle || "Hackathon Dashboard"}
              </h1>
              <div className="flex gap-4 text-sm font-medium text-gray-400">
                <span className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
                  <Users size={16} className="text-indigo-400" />
                  <span className="text-white font-bold">{teams.length}</span> Teams
                </span>
                <span className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
                  <Users size={16} className="text-emerald-400" />
                  <span className="text-white font-bold">{teams.reduce((acc, team) => acc + team.members.length, 0) + teams.length}</span> Participants
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 items-center justify-center">
        {/* Team Panel Link */}
        <a
          href={`https://dashoo-p.vercel.app/teampanel/${event}`}
          target="_blank"
          rel="noreferrer"
          className="px-4 py-2 bg-[#2a2a2a] hover:bg-[#333] border border-gray-700 rounded-xl text-sm font-medium transition-all flex items-center gap-2"
        >
          <span>TeamPanel</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>

        {/* Auto Payment Toggle */}
        <button
          onClick={() =>
            socket.emit("auto", {
              event,
              auto: !eventData?.event?.auto_payment_mail,
            })
          }
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-md border ${eventData?.event?.auto_payment_mail
            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/50 hover:bg-emerald-500/20"
            : "bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700"
            }`}
        >
          Auto Mail: Is {eventData?.event?.auto_payment_mail ? "ON" : "OFF"}
        </button>

        {/* Open/Close Event */}
        <button
          onClick={
            eventData?.event?.status == "open" ? closeEvent : openEvent
          }
          className={`px-4 py-2 rounded-xl text-sm font-medium shadow-md transition-all ${eventData?.event?.status == "open"
            ? "bg-red-600 hover:bg-red-700 text-white"
            : "bg-green-600 hover:bg-green-700 text-white"
            }`}
        >
          {eventData?.event?.status == "open"
            ? "Close Event"
            : "Open Event"}
        </button>

        <button
          onClick={downloadCSV}
          className="bg-[#E16254] hover:bg-[#c65248] text-white px-5 py-2 rounded-xl text-sm shadow-md transition-all flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
          CSV
        </button>
      </div>


      {
        teams.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
            {teams.map((team, index) => (
              <div
                key={team._id}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:border-indigo-500/50 hover:shadow-[0_0_20px_rgba(99,102,241,0.2)] transition-all duration-300 group flex flex-col hover:-translate-y-1"
              >
                {/* Card Header */}
                <div className="p-5 border-b border-white/10 bg-black/20 relative">
                  <div className="flex justify-between items-start mb-2">
                    {index + 1}
                    <h2
                      className="text-lg font-bold text-white truncate max-w-[70%]"
                      title={team.teamName}
                    >
                      {team.teamName}
                    </h2>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingTeam(team)}
                        className="p-2 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition-all"
                        title="Edit Team"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteTeam(team._id)}
                        className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                        title="Delete Team"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${team.verified
                        ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                        : "bg-white/5 text-gray-400 border-white/10"
                        }`}
                    >
                      {team.verified ? "Verified" : "Unverified"}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${team.payment
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                        : "bg-rose-500/20 text-rose-300 border-rose-500/30"
                        }`}
                    >
                      {team.payment ? "Paid" : "Pending"}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 space-y-4 flex-1">
                  {/* Lead Info */}
                  <img src={team.logo || "https://ui-avatars.com/api/?name=" + team.teamName} className="w-12 h-12 rounded-full border-2 border-indigo-500/30 object-cover mb-2" alt="Team Logo" />
                  <div>
                    <h3 className="text-xs uppercase font-bold text-gray-500 tracking-wider mb-2">
                      Lead Details
                    </h3>
                    <div className="space-y-1 text-sm">
                      <p className="flex justify-between">
                        <span className="text-gray-400">Name:</span>
                        <span className="text-gray-200">{team.lead.name}</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-gray-400">Email:</span>
                        <span className="text-gray-200 truncate ml-2 max-w-[150px]" title={team.lead.email}>{team.lead.email}</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-gray-400">Phone:</span>
                        <span className="text-gray-200">{team.lead.phone}</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-gray-400">College:</span>
                        <span className="text-gray-200 truncate ml-2 max-w-[150px]" title={team.lead.college}>{team.lead.college}</span>
                      </p>
                    </div>
                  </div>

                  {/* Marks & Attendance Summary */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-[#222] p-2 rounded-lg">
                    <div>
                      <span className="block text-gray-500 mb-1">Marks</span>
                      {team.marks && team.marks.length > 0 ? (
                        <div className="space-y-0.5">
                          {team.marks.map((m, idx) => (
                            <div key={idx} className="mb-2 last:mb-0">
                              <div className="flex justify-between items-center border-b border-gray-700 pb-1 mb-1">
                                <span className="text-gray-300 font-medium text-[11px]">{m.name}</span>
                                <span className="text-indigo-400 font-bold">{m.total}</span>
                              </div>
                              {m.marks && (
                                <div className="space-y-0.5 ml-1">
                                  {Object.entries(m.marks).map(([cat, val]) => (
                                    <div key={cat} className="flex justify-between items-center">
                                      <span className="text-gray-500 text-[10px]">{cat}</span>
                                      <span className="text-gray-400 text-[10px]">{val}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : <span className="text-gray-600">-</span>}
                    </div>
                    <div>
                      <span className="block text-gray-500 mb-1">Attendance</span>
                      <div className="flex gap-1">
                        {[1, 2, 3].map(i => {
                          const status = team?.lead?.attd?.[`attd_${i}`]?.status;
                          return (
                            <div
                              key={i}
                              className={`w-3 h-3 rounded-full ${status === 'Present' ? 'bg-green-500' : (status ? 'bg-red-500' : 'bg-gray-700')}`}
                              title={`Day ${i}: ${status || 'N/A'}`}
                            ></div>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Members Accordion */}
                  <div className="border-t border-gray-800 pt-3">
                    <button
                      onClick={() =>
                        setExpandedTeamId(
                          expandedTeamId === team._id ? null : team._id
                        )
                      }
                      className="flex items-center justify-between w-full text-xs font-medium text-gray-400 hover:text-white transition-colors"
                    >
                      <span>Members ({team.members.length})</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-4 w-4 transition-transform ${expandedTeamId === team._id ? "rotate-180" : ""
                          }`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>

                    {expandedTeamId === team._id && (
                      <div className="mt-2 space-y-2 animate-in slide-in-from-top-2">
                        {team.members.map((m, i) => (
                          <div
                            key={i}
                            className="text-xs bg-[#222] p-2 rounded border border-gray-800"
                          >
                            <div className="flex justify-between font-medium text-gray-300">
                              <span>{m.name}</span>
                              <span className="text-gray-500">{m.phone}</span>
                            </div>
                            <div className="text-gray-500 truncate" title={m.email}>{m.email}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Payment Detail Link */}
                  {team.paymentDetails?.imgUrl && (
                    <div className="mt-2 pt-2 border-t border-gray-800">
                      <a href={team.paymentDetails.imgUrl} target="_blank" rel="noreferrer" className="text-xs flex items-center gap-1 text-indigo-400 hover:text-indigo-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        View Payment Proof
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mb-4 opacity-20"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <p className="text-lg font-medium">No teams found yet</p>
          </div>
        )
      }

      {
        editingTeam && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#111] border border-gray-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-6 text-white">
                Edit Team Details
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-500 mb-1">
                    Team Name / Participant Name
                  </label>
                  <input
                    type="text"
                    name={editingTeam.teamName ? "teamName" : "name"}
                    value={editingTeam.teamName || editingTeam.name}
                    onChange={handleEditInputChange}
                    className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                {editingTeam.lead && (
                  <>
                    <div className="border-t border-gray-800 pt-4 mt-4">
                      <h3 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">
                        Lead Information
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-gray-500 mb-1">
                            Name
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={editingTeam.lead.name}
                            onChange={handleLeadChange}
                            className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-500 mb-1">
                            Email
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={editingTeam.lead.email}
                            onChange={handleLeadChange}
                            className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-500 mb-1">
                            Phone
                          </label>
                          <input
                            type="text"
                            name="phone"
                            value={editingTeam.lead.phone}
                            onChange={handleLeadChange}
                            className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-500 mb-1">
                            Roll No.
                          </label>
                          <input
                            type="text"
                            name="rollNumber"
                            value={editingTeam.lead.rollNumber}
                            onChange={handleLeadChange}
                            className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-sm text-gray-500 mb-1">
                            College
                          </label>
                          <input
                            type="text"
                            name="college"
                            value={editingTeam.lead.college}
                            onChange={handleLeadChange}
                            className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
                <h1>Members</h1>
                <button onClick={handleAddMember} className=" p-1 bg-green-600 rounded-lg ">Add +</button>
                {editingTeam.members.map((member, index) => (
                  <div key={index}>
                    <div className=" flex justify-between border-b border-gray-800 my-2 p-2">
                      <h1>Member {index + 1}</h1>
                      <button onClick={() => handleRemoveMember(index)} className=" p-1 bg-red-600 rounded-lg ">Remove</button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-500 mb-1">
                          Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={member.name}
                          onChange={(e) =>
                            handleMemberChange(index, e)
                          }
                          className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-500 mb-1">
                          Roll No.
                        </label>
                        <input
                          type="text"
                          name="rollNumber"
                          value={member.rollNumber}
                          onChange={(e) =>
                            handleMemberChange(index, e)
                          }
                          className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm text-gray-500 mb-1">
                          College
                        </label>
                        <input
                          type="text"
                          name="college"
                          value={member.college}
                          onChange={(e) =>
                            handleMemberChange(index, e)
                          }
                          className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-500 mb-1">
                          Branch
                        </label>
                        <input
                          type="text"
                          name="branch"
                          value={member.branch}
                          onChange={(e) =>
                            handleMemberChange(index, e)
                          }
                          className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-500 mb-1">
                          Stream
                        </label>
                        <input
                          type="text"
                          name="stream"
                          value={member.stream}
                          onChange={(e) =>
                            handleMemberChange(index, e)
                          }
                          className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-500 mb-1">
                          Year
                        </label>
                        <input
                          type="text"
                          name="year"
                          value={member.year}
                          onChange={(e) =>
                            handleMemberChange(index, e)
                          }
                          className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button
                  onClick={() => setEditingTeam(null)}
                  className="px-5 py-2 rounded-lg text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateTeam}
                  className="px-5 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
                >
                  Update Team
                </button>
              </div>
            </div>
          </div>
        )}
    </div>

  );
}

export default HackDashboard;