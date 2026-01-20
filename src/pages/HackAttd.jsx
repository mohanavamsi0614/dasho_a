import socket from "@/lib/socket";
import api from "../lib/api";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { Check, X, Plus, Image as ImageIcon, Search, ChevronRight, User, Shield, CameraOff } from "lucide-react";

function HackAttd() {
  const { event } = useParams();
  const [eventData, setEventData] = useState();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currAttd, setCurrAttd] = useState("");
  const [activeAttd, setActiveAttd] = useState();

  const [selectedTeam, setSelectedTeam] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewImage, setViewImage] = useState(null);

  useEffect(() => {
    fetchData();
    socket.emit("join", event);
  }, [event]);

  useEffect(() => {
    socket.on("currAttd", (id) => {
      console.log("Current session updated:", id);
      setActiveAttd(id);
    });

    return () => {
      socket.off("currAttd");
    };
  }, []);

  const fetchData = () => {
    api.get("/admin/event/" + event).then((res) => {
      setEventData(res.data.event);
      setTeams(res.data.event_og || []);
      setActiveAttd(res.data.event.currAttd);

      const sessions = res.data.event.attd || [];
      if (sessions.length > 0) {
        setCurrAttd(sessions[sessions.length - 1]); // Default to latest session
      }

      // Auto-select first team
      if (res.data.event_og && res.data.event_og.length > 0) {
        setSelectedTeam(res.data.event_og[0]);
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

  const handleSessionToggle = (status, attd) => {
    if (status === "open") {
      socket.emit("changeAttd", attd, event);
    } else {
      socket.emit("changeAttd", "", event);
    }
  };

  const updateAttendance = async (teamId, memberId, status) => {
    setTeams(prevTeams => prevTeams.map(t => {
      if (t._id !== teamId) return t;

      const updatedTeam = { ...t };

      const updatePerson = (p) => {
        if (!p.attd) p.attd = {};
        const currentSessionData = p.attd[currAttd] || {};
        const currentStatus = currentSessionData.status; // "Present" | "Absent"

        // Toggle logic: if clicking same status, unset it.
        const newStatus = currentStatus === status ? null : status;

        if (newStatus) {
          p.attd[currAttd] = { ...currentSessionData, status: newStatus };
        } else {
          const { status: _, ...rest } = currentSessionData;
          p.attd[currAttd] = rest;
        }
      };

      if (updatedTeam.lead._id === memberId || (updatedTeam.lead.name === memberId)) {
        updatePerson(updatedTeam.lead);
      } else {
        updatedTeam.members = updatedTeam.members.map(m => {
          if (m._id === memberId || m.name === memberId) {
            updatePerson(m);
          }
          return m;
        });
      }

      return updatedTeam;
    }));

    if (selectedTeam && selectedTeam._id === teamId) {
    }
  };

  const activeTeamData = teams.find(t => t._id === selectedTeam?._id) || selectedTeam;

  const handleTeamSubmit = async () => {
    if (!activeTeamData) return;
    try {
      socket.emit("attd", { event, team: activeTeamData._id, lead: activeTeamData.lead, members: activeTeamData.members });
      alert(`Attendance for ${activeTeamData.teamName} submitted!`);
    } catch (err) {
      console.error("Failed to submit attendance", err);
      alert("Failed to submit attendance.");
    }
  };

  const handleNextTeam = () => {
    const filtered = getFilteredTeams();
    const idx = filtered.findIndex(t => t._id === activeTeamData?._id);
    if (idx !== -1 && idx < filtered.length - 1) {
      setSelectedTeam(filtered[idx + 1]);
    } else if (filtered.length > 0) {
      setSelectedTeam(filtered[0]); // Loop or stop? Marks loops.
    }
  };

  const getFilteredTeams = () => {
    return teams.filter(t => t.teamName.toLowerCase().includes(searchTerm.toLowerCase()));
  };

  const getTeamStatusColor = (team) => {
    const checkPerson = (p) => {
      const s = p.attd?.[currAttd]?.status;
      return s === "Present" || s === "Absent";
    };

    const leadDone = checkPerson(team.lead);
    const membersDone = team.members.every(checkPerson);

    if (leadDone && membersDone) return "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]";
    if (!leadDone && !membersDone) return "bg-gray-700";
    if (team.members.length != 0) return "bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.6)]";
    return "bg-gray-700";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-poppins bg-[#050505] text-white p-4 sm:p-6 overflow-hidden selection:bg-indigo-500/30">

      {/* Subtle nice background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[100px]" />
      </div>

      {/* Header & Session Selector */}
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-4 mb-6 p-4 rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-lg">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            Attendance
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <div className={`w-2 h-2 rounded-full ${currAttd === activeAttd ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">
              {currAttd === activeAttd ? "Live Instance" : "Offline"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-black/20 p-1.5 rounded-full border border-white/5 overflow-x-auto max-w-full scrollbar-hide">
          {eventData?.attd?.map((session) => (
            <button
              key={session}
              onClick={() => setCurrAttd(session)}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${currAttd === session
                ? "bg-white text-black shadow-[0_2px_10px_rgba(255,255,255,0.2)]"
                : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
            >
              {session}
            </button>
          ))}
          <button
            onClick={handleCreateAttd}
            className="ml-2 w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 flex items-center justify-center transition-all"
            title="Create New Session"
          >
            <Plus size={16} />
          </button>
        </div>

        <div>
          {currAttd && (
            <button
              onClick={() => handleSessionToggle(currAttd === activeAttd ? "close" : "open", currAttd)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border shadow-lg ${currAttd === activeAttd
                ? "bg-green-500 text-black border-green-400 hover:bg-green-400 shadow-green-500/20"
                : "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20"
                }`}
            >
              {currAttd === activeAttd ? "Stop Session" : "Start Session"}
            </button>
          )}
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)] min-h-[600px]">
        {/* Left Sidebar: Team List */}
        <div className="lg:col-span-3 flex flex-col gap-4 bg-white/[0.02] backdrop-blur-xl border border-white/10 p-4 rounded-3xl h-full flex-grow overflow-hidden">
          <div className="relative">
            <input
              type="text"
              placeholder="Search teams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 pl-11 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-gray-600"
            />
            <Search className="h-4 w-4 absolute left-4 top-3.5 text-gray-500" />
          </div>

          <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
            {getFilteredTeams().map(team => {
              const isSelected = activeTeamData?._id === team._id;
              const statusColor = getTeamStatusColor(team);

              return (
                <div
                  key={team._id}
                  onClick={() => setSelectedTeam(team)}
                  className={`p-3.5 rounded-2xl cursor-pointer transition-all border flex justify-between items-center group relative overflow-hidden ${isSelected
                    ? "bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-900/40"
                    : "bg-transparent border-transparent hover:bg-white/5"
                    }`}
                >
                  <div className="overflow-hidden z-10">
                    <p className={`text-sm font-bold truncate ${isSelected ? "text-white" : "text-gray-300 group-hover:text-white"}`}>{team.teamName}</p>
                    <p className={`text-[11px] truncate ${isSelected ? "text-indigo-200" : "text-gray-500"}`}>{team.lead.name}</p>
                  </div>
                  <div className={`h-2.5 w-2.5 min-w-[10px] rounded-full ${statusColor} ml-3 ring-2 ring-black/20`}></div>
                </div>
              )
            })}
            {getFilteredTeams().length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 text-gray-600 gap-2">
                <Search size={24} />
                <p className="text-xs">No teams found</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Attendance Details */}
        <div className="lg:col-span-9 flex flex-col bg-white/[0.02] backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-3xl relative overflow-hidden h-full">
          {activeTeamData ? (
            <>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-6 border-b border-white/5 gap-4">
                <div>
                  <h2 className="text-4xl font-black text-white mb-2 tracking-tight">{activeTeamData.teamName}</h2>
                  <div className="flex items-center gap-3 text-sm text-gray-400">
                    <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 font-mono text-xs">{activeTeamData.members.length + 1} Members</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Shield size={12} className="text-emerald-400" /> {activeTeamData.lead.college}</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleTeamSubmit}
                    className="px-6 py-2.5 rounded-xl font-bold bg-white text-black shadow-lg hover:bg-gray-200 active:scale-95 transition-all text-sm flex items-center gap-2"
                  >
                    <Check size={16} /> Sync Attendance
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4 pb-4">
                {/* Lead Row */}
                <MemberRow
                  member={activeTeamData.lead}
                  role="Lead"
                  idx={0}
                  currAttd={currAttd}
                  onUpdate={updateAttendance}
                  teamId={activeTeamData._id}
                  setViewImage={setViewImage}
                  allSessions={eventData?.attd || []}
                />

                {/* Members Rows */}
                {activeTeamData.members.map((member, idx) => (
                  <MemberRow
                    key={idx}
                    member={member}
                    role="Member"
                    idx={idx + 1}
                    currAttd={currAttd}
                    onUpdate={updateAttendance}
                    teamId={activeTeamData._id}
                    setViewImage={setViewImage}
                    allSessions={eventData?.attd || []}
                  />
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-white/5 flex justify-end">
                <button
                  onClick={handleNextTeam}
                  className="px-8 py-3 rounded-2xl font-bold bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 group"
                >
                  Next Team <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-600">
              <User size={48} className="mb-4 opacity-20" />
              <p className="font-medium text-lg">Select a team to begin</p>
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {viewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-2xl p-4 animate-in fade-in duration-200"
          onClick={() => setViewImage(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh] w-full flex flex-col items-center justify-center">
            <button
              className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors border border-white/10"
              onClick={() => setViewImage(null)}
            >
              <X size={20} />
            </button>
            <img src={viewImage} alt="Full Proof" className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl border border-white/10" />
            <p className="text-gray-400 mt-4 text-sm font-mono">Evidence Preview</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Extracted Member Row Component for cleanliness
function MemberRow({ member, role, idx, currAttd, onUpdate, teamId, setViewImage, allSessions }) {
  return (
    <div className="bg-white/[0.03] p-4 rounded-2xl border border-white/5 hover:border-white/10 transition-all hover:bg-white/[0.05] group">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold text-white shadow-inner ${role === "Lead"
            ? "bg-gradient-to-br from-amber-500 to-orange-600"
            : "bg-white/10 text-gray-400"
            }`}>
            {role === "Lead" ? "L" : idx}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-bold text-lg text-gray-200">{member.name}</p>
              {role === "Lead" && <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/20 text-[10px] font-bold uppercase">LEAD</span>}
            </div>
            <p className="text-xs text-gray-500 font-mono">{member.email || member.rollNumber || "No ID"}</p>
          </div>
        </div>

        <AttendanceActions
          member={member}
          currAttd={currAttd}
          onUpdate={(status) => onUpdate(teamId, member._id || member.name, status)}
          setViewImage={setViewImage}
          allSessions={allSessions}
        />
      </div>
    </div>
  )
}

function AttendanceActions({ member, currAttd, onUpdate, setViewImage, allSessions }) {
  const sessionData = member.attd?.[currAttd] || {};
  const status = sessionData.status;
  const proofImg = sessionData.img;

  // Get previous sessions with images
  const prevImages = allSessions
    .filter(s => s !== currAttd && member.attd?.[s]?.img)
    .reverse() // Show newest first
    .slice(0, 3); // Max 3 reference images

  return (
    <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
      {/* Reference Images from Previous Sessions */}
      {prevImages.length > 0 && (
        <div className="flex items-center -space-x-2 mr-2 px-2 border-r border-white/10">
          {prevImages.map((session, i) => (
            <div
              key={session}
              onClick={() => setViewImage(member.attd[session].img)}
              className="h-8 w-8 rounded-full overflow-hidden border-2 border-[#1a1a1a] cursor-pointer hover:scale-110 hover:z-10 transition-all relative z-0"
              title={`Ref: ${session}`}
            >
              <img src={member.attd[session].img} alt="Ref" className="h-full w-full object-cover" />
            </div>
          ))}
        </div>
      )}

      {/* Current Session Proof or Missing Placeholder */}
      {proofImg ? (
        <div
          onClick={() => setViewImage(proofImg)}
          className="group/img relative h-12 w-12 rounded-xl overflow-hidden border border-white/10 cursor-pointer shadow-lg hover:shadow-indigo-500/20 transition-all"
          title="Current Session Proof"
        >
          <img src={proofImg} alt="Proof" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 transition-colors flex items-center justify-center">
            <ImageIcon size={16} className="text-white opacity-0 group-hover/img:opacity-100 transition-opacity drop-shadow-md" />
          </div>
        </div>
      ) : (
        <div className="h-12 w-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center group/noimg cursor-default" title="No Proof Available">
          <CameraOff size={18} className="text-gray-600 group-hover/noimg:text-gray-500 transition-colors" />
        </div>
      )}

      <div className="flex bg-black/40 rounded-xl p-1 border border-white/10 shadow-inner">
        <button
          onClick={() => onUpdate("Present")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${status === "Present"
            ? "bg-gradient-to-tr from-green-600 to-emerald-500 text-white shadow-lg shadow-green-900/40"
            : "text-gray-500 hover:text-white hover:bg-white/5"
            }`}
        >
          <Check size={14} strokeWidth={3} /> <span className="hidden md:inline">Present</span>
        </button>
        <button
          onClick={() => onUpdate("Absent")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${status === "Absent"
            ? "bg-gradient-to-tr from-red-600 to-rose-500 text-white shadow-lg shadow-red-900/40"
            : "text-gray-500 hover:text-white hover:bg-white/5"
            }`}
        >
          <X size={14} strokeWidth={3} /> <span className="hidden md:inline">Absent</span>
        </button>
      </div>
    </div>
  );
}

export default HackAttd;