import socket from "@/lib/socket";
import api from "../lib/api";
import { useEffect, useState } from "react";
import { useParams } from "react-router";

function HackAttd() {
  const { event } = useParams();
  const [eventData, setEventData] = useState();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currAttd, setCurrAttd] = useState("");
  const [activeAttd, setActiveAttd] = useState()

  useEffect(() => {
    fetchData();
    socket.emit("join", event)
  }, [event]);

  const fetchData = () => {
    api.get("/admin/event/" + event).then((res) => {
      setEventData(res.data.event);
      setTeams(res.data.event_og);
      setActiveAttd(res.data.event.currAttd)
      if (res.data.event.attd && res.data.event.attd.length > 0) {
        setCurrAttd(res.data.event.currAttd || res.data.event.attd[0]);
      }
      setLoading(false);
    });
  };

  const handleCreateAttd = () => {
    api
      .post("/admin/hack/attd/create/" + event)
      .then((res) => {
        setEventData(res.data.event);
        const newSessions = res.data.event.attd;
        if (newSessions && newSessions.length > 0) {
          setCurrAttd(newSessions[newSessions.length - 1]);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleTeamSubmit = async (team) => {
    if (!team.lead.attd[currAttd].status && team.members.every(member => !member.attd[currAttd].status)) {
      alert("Please mark attendance for whole team")
      return
    }
    try {
      socket.emit("attd", { event, team: team._id, lead: team.lead, members: team.members })
      alert(`Attendance for ${team.teamName} submitted successfully!`);
    } catch (err) {
      console.error("Failed to submit attendance", err);
      alert("Failed to submit attendance. Please try again.");
    }
  };
  const handleAttd = async (status, attd) => {
    if (status == "open") {
      socket.emit("changeAttd", attd, event)
    }
    else {
      socket.emit("changeAttd", "", event)
    }
  }

  socket.on("currAttd", (id) => {
    console.log(id)
    setActiveAttd(id)
  })


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-poppins pb-20">
      {/* Sticky Top Bar */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                {eventData?.name} Attendance
              </h1>
            </div>

            <div className="flex items-center gap-3 overflow-x-auto max-w-full pb-2 md:pb-0 hide-scrollbar">
              <div className="flex bg-gray-100 rounded-lg p-1 border border-gray-200">
                {eventData?.attd?.map((session) => (
                  <div
                    key={session}
                    onClick={() => setCurrAttd(session)}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${currAttd === session
                      ? "bg-white text-red-600 shadow-sm ring-1 ring-gray-200"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-200"
                      }`}
                  >
                    {session}
                  </div>
                ))}
              </div>

              <button
                onClick={handleCreateAttd}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2 whitespace-nowrap"
              >
                <span>+</span> New Session
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-8">
        {/* Session Status Card */}
        {currAttd && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-3 h-3 rounded-full ${currAttd === activeAttd ? "bg-green-500 animate-pulse" : "bg-gray-300"}`}></div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Session: {currAttd}</h2>
                <p className="text-sm text-gray-500">
                  Status: <span className={`font-medium ${currAttd === activeAttd ? "text-green-600" : "text-gray-500"}`}>
                    {currAttd === activeAttd ? "Live & Accepting Attendance" : "Closed"}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {currAttd === activeAttd ? (
                <button
                  onClick={() => handleAttd("close", currAttd)}
                  className="px-6 py-2 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full bg-red-600"></span>
                  Close Session
                </button>
              ) : (
                <button
                  onClick={() => handleAttd("open", currAttd)}
                  className="px-6 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                  Start Session
                </button>
              )}
            </div>
          </div>
        )}

        {!eventData?.attd || eventData.attd.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-xl bg-white">
            <p className="text-xl text-gray-500 font-medium">
              No attendance sessions found
            </p>
            <button
              onClick={handleCreateAttd}
              className="mt-4 text-red-600 hover:text-red-700 font-medium underline"
            >
              Create your first session
            </button>
          </div>
        ) : (
          <div className="space-y-12">
            {teams.map((team) => (
              <div key={team._id} className="space-y-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-gray-800">{team.teamName}</h2>
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-medium border border-gray-200">
                      {team.members.length + 1} Members
                    </span>
                  </div>
                  <button
                    onClick={() => handleTeamSubmit(team)}
                    className="bg-gray-900 hover:bg-black text-white px-6 py-2 rounded-lg font-medium transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                  >
                    <span>Save / Submit</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Lead Card */}
                  <MemberCard
                    member={team.lead}
                    isLead={true}
                    sessions={eventData.attd}
                    currAttd={currAttd}
                    teamId={team._id}
                    eventId={event}
                    teamData={team} // Pass full team data for updates
                    setTeams={setTeams} // To update local state
                  />

                  {/* Members Cards */}
                  {team.members.map(member => (
                    <MemberCard
                      key={member._id}
                      member={member}
                      isLead={false}
                      sessions={eventData.attd}
                      currAttd={currAttd}
                      teamId={team._id}
                      eventId={event}
                      teamData={team}
                      setTeams={setTeams}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MemberCard({ member, isLead, sessions, currAttd, teamId, eventId, teamData, setTeams }) {
  const [viewImage, setViewImage] = useState(null);

  const updateAttendance = async (sessionName, status) => {

    const updatedTeam = JSON.parse(JSON.stringify(teamData)); // Deep clone
    let targetMember;

    if (isLead) {
      targetMember = updatedTeam.lead;
    } else {
      targetMember = updatedTeam.members.find(m => m._id === member._id);
    }

    if (!targetMember) return;
    if (!targetMember.attd) targetMember.attd = {};

    const currentSessionData = targetMember.attd[sessionName] || {};
    const currentStatus = currentSessionData.status;
    const newStatus = currentStatus === status ? null : status;

    if (newStatus) {
      targetMember.attd[sessionName] = { ...currentSessionData, status: newStatus };
    } else {
      const { status: _, ...rest } = currentSessionData;
      targetMember.attd[sessionName] = rest;
    }

    // Update Global State (to reflect across UI if needed, though mostly local)
    setTeams(prevTeams => prevTeams.map(t => t._id === teamId ? updatedTeam : t));

    // Send to Backend
    try {
      await api.post(
        `/admin/hack/attd/${eventId}/${teamId}`,
        {
          lead: updatedTeam.lead,
          members: updatedTeam.members,
        }
      );
    } catch (err) {
      console.error("Failed to sync attendance", err);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold border border-gray-300">
              {member.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{member.name}</h3>
              <p className="text-xs text-gray-500">{member.email || "No Email"}</p>
            </div>
          </div>
          {isLead ? (
            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded border border-red-200">LEAD</span>
          ) : (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded border border-gray-200">MEM</span>
          )}
        </div>

        <div className="p-4 flex-1">
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Attendance Sessions</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {sessions.map(session => {
              const sessionData = member.attd?.[session] || {};
              const status = sessionData.status;
              const proofImg = sessionData.img;
              const isCurrent = currAttd === session;

              return (
                <div
                  key={session}
                  className={`relative rounded-lg border flex flex-col overflow-hidden transition-all ${isCurrent
                    ? "border-red-300 ring-2 ring-red-100 shadow-sm"
                    : "border-gray-200 hover:border-gray-300"
                    }`}
                >
                  {/* Header */}
                  <div className={`px-2 py-1 text-[10px] font-bold text-center border-b ${isCurrent ? "bg-red-50 text-red-700 border-red-100" : "bg-gray-50 text-gray-500 border-gray-100"
                    }`}>
                    {session}
                  </div>

                  {/* Image Area - Large Square */}
                  <div className="aspect-square bg-gray-100 relative group">
                    {proofImg ? (
                      <>
                        <img
                          src={proofImg}
                          alt="Proof"
                          className="w-full h-full object-cover cursor-pointer"
                          onClick={() => setViewImage(proofImg)}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-[10px]">No Photo</span>
                      </div>
                    )}

                    {/* Overlay Status Badge (if marked) */}
                    {status && (
                      <div className={`absolute top-1 right-1 px-1.5 py-0.5 rounded text-[10px] font-bold shadow-sm ${status === "Present" ? "bg-green-500 text-white" : "bg-red-500 text-white"
                        }`}>
                        {status === "Present" ? "P" : "A"}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex border-t border-gray-200 divide-x divide-gray-200">
                    <button
                      onClick={() => updateAttendance(session, "Present")}
                      className={`flex-1 py-2 flex items-center justify-center hover:bg-green-50 transition-colors ${status === "Present" ? "bg-green-50 text-green-600" : "text-gray-400"
                        }`}
                      title="Mark Present"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <button
                      onClick={() => updateAttendance(session, "Absent")}
                      className={`flex-1 py-2 flex items-center justify-center hover:bg-red-50 transition-colors ${status === "Absent" ? "bg-red-50 text-red-600" : "text-gray-400"
                        }`}
                      title="Mark Absent"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {viewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setViewImage(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh] w-full flex flex-col items-center">
            <button
              className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors"
              onClick={() => setViewImage(null)}
            >
              ✕
            </button>
            <img src={viewImage} alt="Full Proof" className="max-w-full max-h-[85vh] rounded-lg shadow-2xl border border-gray-800" />
          </div>
        </div>
      )}
    </>
  );
}

export default HackAttd;