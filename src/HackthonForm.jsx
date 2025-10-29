import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function HackthonForm() {
  const nav = useNavigate();
  const widgetRef = useRef();
  const currentSlot = useRef('');

  const [data, setData] = useState({
    eventTitle: '',
    theme: '',
    startDate: '',
    startTime: '',
    endDate: '',
    venue: '',
    registrationDeadline: '',
    minTeamMembers: 1,
    maxTeamMembers: 4,
    minTeams: 1,
    maxTeams: 100,
    prize: '',
    tracks: [],
    description: '',
    bannerUrl: '',
    logoUrl: '',
    photo1Url: '',
    photo2Url: ''
  });

  const [trackInput, setTrackInput] = useState('');

  useEffect(() => {
    if (typeof cloudinary === 'undefined') return;
    if (widgetRef.current) return;

    const widget = cloudinary.createUploadWidget(
      {
        cloudName: 'dfseckyjx',
        uploadPreset: 'qbvu3y5j',
        multiple: false
      },
      (error, result) => {
        if (!error && result && result.event === 'success') {
          const url = result.info.secure_url;
          const slot = currentSlot.current;
          if (slot) setData(prev => ({ ...prev, [slot]: url }));
        }
      }
    );
    widgetRef.current = widget;
  }, []);

  const openUpload = (slot) => {
    if (!widgetRef.current) return alert('Upload widget not ready');
    currentSlot.current = slot;
    widgetRef.current.open();
  };

  const addTrack = () => {
    const v = trackInput.trim();
    if (!v) return;
    if (data.tracks.includes(v)) return setTrackInput('');
    setData(prev => ({ ...prev, tracks: [...prev.tracks, v] }));
    setTrackInput('');
  };

  const removeTrack = (i) => {
    setData(prev => ({ ...prev, tracks: prev.tracks.filter((_, idx) => idx !== i) }));
  };

  const loadDraft = () => {
    const d = localStorage.getItem('hackathonDraft');
    if (!d) return;
    try {
      const parsed = JSON.parse(d);
      setData(prev => ({ ...prev, ...parsed }));
    } catch (e) {}
  };

  useEffect(() => { loadDraft(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!data.eventTitle || !data.startDate) return alert('Please provide event name and start date');
    if (Number(data.minTeamMembers) <= 0) return alert('Minimum team members must be at least 1');
    if (Number(data.minTeamMembers) > Number(data.maxTeamMembers)) return alert('minTeamMembers cannot exceed maxTeamMembers');
    if (Number(data.minTeams) > Number(data.maxTeams)) return alert('minTeams cannot exceed maxTeams');

    const payload = { ...data, type: 'hackathon', orgId: JSON.parse(localStorage.getItem('user'))._id };

    try {
      const res = await axios.post('https://dasho-backend.onrender.com/admin/event', payload);
      localStorage.setItem("user", JSON.stringify(res.data.org));
      localStorage.removeItem('hackathonDraft');
      nav('/profile');
    } catch (err) {
      console.error('Create failed', err);
      alert('Failed to create hackathon.');
    }
  }

  return (
    <div className="min-h-screen bg-black text-[#ECE8E7] flex justify-center items-center py-12">
      <form
        onSubmit={handleSubmit}
        className="bg-[#121212] border border-[#919294]/40 shadow-lg rounded-2xl w-full max-w-3xl p-8 space-y-6"
      >
        <h2 className="text-3xl font-bold text-center text-[#E16254] mb-6">
          Create Hackathon
        </h2>

        {/* Basic Details */}
        <div className="space-y-4">
          <div>
            <label className="block text-[#ECE8E7] mb-1 font-semibold">Event Name *</label>
            <input
              className="w-full bg-[#1a1a1a] border border-[#919294]/40 rounded-lg p-2 text-[#ECE8E7] focus:outline-none focus:ring-2 focus:ring-[#E16254]"
              value={data.eventTitle}
              onChange={e => setData(prev => ({ ...prev, eventTitle: e.target.value }))}
              placeholder="Hackathon name"
            />
          </div>

          <div>
            <label className="block text-[#ECE8E7] mb-1 font-semibold">Theme</label>
            <input
              className="w-full bg-[#1a1a1a] border border-[#919294]/40 rounded-lg p-2 text-[#ECE8E7] focus:outline-none focus:ring-2 focus:ring-[#E16254]"
              value={data.theme}
              onChange={e => setData(prev => ({ ...prev, theme: e.target.value }))}
              placeholder="e.g., AI for Good"
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              ['Start Date *', 'startDate', 'date'],
              ['Start Time', 'startTime', 'time'],
              ['End Date', 'endDate', 'date'],
            ].map(([label, key, type]) => (
              <div key={key}>
                <label className="block text-[#ECE8E7] mb-1 font-semibold">{label}</label>
                <input
                  type={type}
                  className="w-full bg-[#1a1a1a] border border-[#919294]/40 rounded-lg p-2 text-[#ECE8E7] focus:outline-none focus:ring-2 focus:ring-[#E16254]"
                  value={data[key]}
                  onChange={e => setData(prev => ({ ...prev, [key]: e.target.value }))}
                />
              </div>
            ))}
          </div>

          {/* Venue */}
          <div>
            <label className="block text-[#ECE8E7] mb-1 font-semibold">Venue</label>
            <input
              className="w-full bg-[#1a1a1a] border border-[#919294]/40 rounded-lg p-2 text-[#ECE8E7] focus:outline-none focus:ring-2 focus:ring-[#E16254]"
              value={data.venue}
              onChange={e => setData(prev => ({ ...prev, venue: e.target.value }))}
              placeholder="Venue or online link"
            />
          </div>

          {/* Prize */}
          <div>
            <label className="block text-[#ECE8E7] mb-1 font-semibold">Prize (Summary)</label>
            <input
              className="w-full bg-[#1a1a1a] border border-[#919294]/40 rounded-lg p-2 text-[#ECE8E7] focus:outline-none focus:ring-2 focus:ring-[#E16254]"
              value={data.prize}
              onChange={e => setData(prev => ({ ...prev, prize: e.target.value }))}
              placeholder="Prizes and rewards"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[#ECE8E7] mb-1 font-semibold">Description / Rules</label>
            <textarea
              rows="4"
              className="w-full bg-[#1a1a1a] border border-[#919294]/40 rounded-lg p-2 text-[#ECE8E7] focus:outline-none focus:ring-2 focus:ring-[#E16254]"
              value={data.description}
              onChange={e => setData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe rules, judging criteria, and schedule"
            />
          </div>

          {/* Tracks */}
          <div>
            <label className="block text-[#ECE8E7] mb-1 font-semibold">Tracks</label>
            <div className="flex gap-2">
              <input
                className="flex-grow bg-[#1a1a1a] border border-[#919294]/40 rounded-lg p-2 text-[#ECE8E7] focus:outline-none focus:ring-2 focus:ring-[#E16254]"
                value={trackInput}
                onChange={e => setTrackInput(e.target.value)}
                placeholder="Add track (e.g., Healthcare)"
              />
              <button
                type="button"
                className="bg-[#E16254] text-white rounded-lg px-4 py-2 hover:bg-[#c65045] transition"
                onClick={addTrack}
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {data.tracks.map((t, i) => (
                <div
                  key={i}
                  className="bg-[#2a2a2a] px-3 py-1 rounded-full text-sm flex items-center gap-2"
                >
                  <span>{t}</span>
                  <button type="button" onClick={() => removeTrack(i)} className="text-[#E16254] font-bold">✕</button>
                </div>
              ))}
            </div>
          </div>

          {/* Images */}
          <div>
            <label className="block text-[#ECE8E7] font-semibold mb-2">Images (Banner, Logo, Photos)</label>
            <div className="grid sm:grid-cols-2 gap-4">
              {['bannerUrl', 'logoUrl', 'photo1Url', 'photo2Url'].map((key, i) => (
                <div key={i} className="border border-[#919294]/40 bg-[#1a1a1a] rounded-lg p-3 flex flex-col items-center text-center">
                  <button
                    type="button"
                    className="bg-[#E16254] text-white px-3 py-1 rounded-lg hover:bg-[#c65045] mb-2 transition"
                    onClick={() => openUpload(key)}
                  >
                    Upload {key.replace('Url', '')}
                  </button>
                  {data[key] ? (
                    <img src={data[key]} alt={key} className="h-20 object-cover rounded-lg" />
                  ) : (
                    <div className="text-[#919294] text-sm">No image</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={() => {
              localStorage.setItem('hackathonDraft', JSON.stringify(data));
              alert('Draft saved');
            }}
            className="bg-[#2a2a2a] text-[#ECE8E7] px-4 py-2 rounded-lg hover:bg-[#3a3a3a]"
          >
            Save Draft
          </button>
          <button
            type="button"
            onClick={() =>
              setData({
                eventTitle: '', theme: '', startDate: '', startTime: '', endDate: '',
                venue: '', registrationDeadline: '', minTeamMembers: 1, maxTeamMembers: 4,
                minTeams: 1, maxTeams: 100, prize: '', tracks: [], description: '',
                bannerUrl: '', logoUrl: '', photo1Url: '', photo2Url: ''
              })
            }
            className="bg-[#E16254] text-white px-4 py-2 rounded-lg hover:bg-[#c65045]"
          >
            Clear
          </button>
          <button
            type="submit"
            className="bg-[#E16254] text-white px-4 py-2 rounded-lg hover:bg-[#c65045]"
          >
            Create Hackathon
          </button>
        </div>
      </form>
    </div>
  );
}

export default HackthonForm;
