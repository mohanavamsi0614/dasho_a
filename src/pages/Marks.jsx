import { useState, useEffect } from "react"
import { useParams } from "react-router"
import api from "../lib/api"

function Marks() {
    const eventId = useParams().event
    const [event, setevent] = useState([])
    const [teams, setteams] = useState([])
    const [team, setteam] = useState(teams[0] || {})
    const [loading, setloading] = useState(true)
    const [rounds, setRounds] = useState([])
    const [open, setopen] = useState(false)
    const [round, setround] = useState({})
    const [marks, setmarks] = useState([])

    useEffect(() => {
        api.get("/admin/event/" + eventId).then((res) => {
            setevent(res.data.event)
            setteams(res.data.event_og)
            setteam(teams[0] || {})
            console.log(res.data)

            setRounds(res.data.event.rounds)
            setround(res.data.event.rounds[0] || {})
            setloading(false)

        })
    }, [])
    console.log(team)
    useEffect(() => {
        if (team.marks && team.marks[round.name]) {
            setmarks(team.marks[round.name])
        } else {
            setmarks({})
        }
    }, [team, round])

    const handleCreateRound = () => {
        setopen(true)
    }

    const handleDeleteRound = (round) => {
        setRounds((prev) => prev.filter((r) => r.name !== round.name))
    }
    const handelSubmit = () => {
        api.post("/admin/marks/" + eventId + "/" + team._id, { marks: { ...marks, name: round.name } }).then((res) => {
            setmarks({})
            console.log(res.data)
        })
    }

    return (
        <div className="min-h-screen bg-background text-foreground p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold tracking-tight">Marks Management</h1>
                    {rounds && rounds.length > 0 && (
                        <button
                            onClick={handleCreateRound}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md transition-colors font-medium"
                        >
                            Create Round
                        </button>
                    )}
                </div>

                {(!rounds || rounds.length === 0) && (
                    <div className="flex flex-col items-center justify-center h-[50vh] gap-4 border-2 border-dashed border-muted rounded-lg bg-card/50">
                        <h1 className="text-xl font-semibold text-muted-foreground">No Rounds Found</h1>
                        <button
                            onClick={handleCreateRound}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md transition-colors font-medium"
                        >
                            Create Round
                        </button>
                    </div>
                )}

                {rounds && rounds.length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Left Column: Rounds List */}
                        <div className="lg:col-span-4 space-y-4">
                            <h2 className="text-xl font-semibold">Rounds</h2>
                            <div className="flex flex-col gap-3">
                                {rounds.map((r, index) => (
                                    <div
                                        key={index}
                                        onClick={() => setround(r)}
                                        className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${round.name === r.name
                                            ? "bg-primary text-primary-foreground border-primary shadow-md"
                                            : "bg-card text-card-foreground border-border hover:bg-accent hover:text-accent-foreground"
                                            }`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <h3 className="font-semibold text-lg">{r.name}</h3>
                                            {round.name === r.name && (
                                                <span className="bg-primary-foreground/20 px-2 py-1 rounded text-xs font-medium">Selected</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right Column: Details & Marks */}
                        <div className="lg:col-span-8 space-y-8">
                            {/* Round Details */}
                            {round && round.name && (
                                <div className="bg-card text-card-foreground border rounded-lg shadow-sm p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-2xl font-bold">{round.name} Details</h2>
                                        <div className="text-sm text-muted-foreground">
                                            Total Points: <span className="font-semibold text-foreground">{round.total}</span>
                                        </div>
                                    </div>

                                    <div className="grid gap-3">
                                        {round.catogary && round.catogary.map((cat, index) => (
                                            <div key={index} className="flex justify-between items-center p-3 bg-muted/50 rounded-md border border-transparent hover:border-border transition-colors">
                                                <span className="font-medium">{cat.title}</span>
                                                <span className="bg-background px-3 py-1 rounded border text-sm font-mono">{cat.marks} pts</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Team Marks Entry */}
                            {team && team.teamName && round && round.name && (
                                <div className="bg-card text-card-foreground border rounded-lg shadow-sm p-6">
                                    <div className="flex justify-between items-center mb-6 border-b pb-4">
                                        <div>
                                            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Scoring Team</h3>
                                            <h2 className="text-2xl font-bold text-primary">{team.teamName}</h2>
                                        </div>
                                        <div className="text-right">
                                            <button
                                                onClick={() => setteam(teams[teams.indexOf(team) + 1] || teams[0])}
                                                className="text-sm bg-secondary text-secondary-foreground hover:bg-secondary/80 px-3 py-1.5 rounded-md transition-colors"
                                            >
                                                Skip / Next Team →
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-6">
                                        {round.catogary && round.catogary.map((cat, index) => (
                                            <div key={index} className="grid grid-cols-12 gap-4 items-center">
                                                <div className="col-span-8">
                                                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                        {cat.title} <span className="text-muted-foreground text-xs">({cat.marks} pts)</span>
                                                    </label>
                                                </div>
                                                <div className="col-span-4">
                                                    <input
                                                        type="number"
                                                        max={cat.marks}
                                                        onChange={(e) => {
                                                            setmarks({ ...marks, [cat.title]: e.target.value })
                                                        }}
                                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                        placeholder="0"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex justify-end pt-4 border-t">
                                        <button className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-2.5 rounded-md transition-colors font-medium shadow-sm"
                                            onClick={handelSubmit}
                                        >
                                            Submit Scores
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {open && <Popup setRound={setRounds} setClose={setopen} rounds={rounds} eventId={eventId} />}
            </div>
        </div>
    )
}

function Popup({ setRound, setClose, rounds, eventId }) {
    const [catogary, setCatogary] = useState([])
    const [roundName, setRoundName] = useState("")

    const handelcreateround = () => {
        const newRound = { name: roundName, catogary, total: catogary.reduce((total, cat) => total + Number(cat.marks), 0) }
        api.post("/admin/hackthon/round/create/" + eventId, { round: newRound }).then((res) => {
            console.log(res.data)
        })
        setRound([...rounds, newRound])
        setClose(false)
    }

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-background border rounded-lg p-6 w-full max-w-md shadow-lg animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Create New Round</h2>
                    <button onClick={() => setClose(false)} className="text-muted-foreground hover:text-foreground">✕</button>
                </div>

                <div className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none">Round Name</label>
                        <input
                            placeholder="e.g. Ideation Phase"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            onChange={(e) => setRoundName(e.target.value)}
                            value={roundName}
                        />
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-medium leading-none">Scoring Categories</label>
                            <button
                                onClick={() => setCatogary([...catogary, { title: "", marks: 0 }])}
                                className="text-xs bg-secondary text-secondary-foreground hover:bg-secondary/80 px-2.5 py-1.5 rounded-md transition-colors font-medium"
                            >
                                + Add Category
                            </button>
                        </div>

                        <div className="max-h-[240px] overflow-y-auto space-y-2 pr-1 -mr-1">
                            {catogary.length === 0 && (
                                <div className="text-center py-4 text-sm text-muted-foreground border border-dashed rounded-md">
                                    No categories added yet.
                                </div>
                            )}
                            {catogary.map((cat, index) => (
                                <div key={index} className="flex gap-2 items-center group">
                                    <input
                                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                        placeholder="Category Title"
                                        value={cat.title}
                                        onChange={(e) => setCatogary(catogary.map((c, i) => i === index ? { ...c, title: e.target.value } : c))}
                                    />
                                    <input
                                        className="flex h-9 w-20 rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-center"
                                        placeholder="Pts"
                                        type="number"
                                        value={cat.marks}
                                        onChange={(e) => setCatogary(catogary.map((c, i) => i === index ? { ...c, marks: e.target.value } : c))}
                                    />
                                    <button
                                        onClick={() => setCatogary(catogary.filter((_, i) => i !== index))}
                                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 p-2 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                                        title="Remove"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-between items-center py-3 border-t border-b bg-muted/20 -mx-6 px-6">
                        <span className="font-semibold text-sm">Total Points</span>
                        <span className="font-bold text-lg text-primary">{catogary.reduce((total, cat) => total + Number(cat.marks), 0)}</span>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            onClick={() => setClose(false)}
                            className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-md transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handelcreateround}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2 rounded-md transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!roundName || catogary.length === 0}
                        >
                            Save Round
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default Marks