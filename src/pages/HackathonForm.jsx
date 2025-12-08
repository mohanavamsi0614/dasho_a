/* global cloudinary */
/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from 'react';
import api from '../lib/api';
import { useNavigate } from 'react-router-dom';

function HackthonForm() {
  const nav = useNavigate();
  const widgetRef = useRef();
  const currentSlot = useRef('');
  const [openPayment, setopenPayment] = useState(false);

  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('hackathonDraft');
    const initial = {
      eventTitle: '',
      theme: '',
      startDate: '',
      startTime: '',
      endDate: '',
      venue: '',
      cost: '',
      registrationDeadline: '',
      minTeamMembers: 1,
      maxTeamMembers: 4,
      minTeams: 1,
      maxTeams: 100,
      prize: '',
      tracks: [],
      links: [],
      description: '',
      bannerUrl: '',
      logoUrl: '',
      photo1Url: '',
      photo2Url: '',
      payments: [],
      other: []
    };
    return saved ? { ...initial, ...JSON.parse(saved) } : initial;
  });

  useEffect(() => {
    localStorage.setItem('hackathonDraft', JSON.stringify(data));
  }, [data]);

  const [trackInput, setTrackInput] = useState('');
  const [open, setopen] = useState(false);

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



  async function handleSubmit(e) {
    e.preventDefault();
    if (!data.eventTitle || !data.startDate) return alert('Please provide event name and start date');
    if (Number(data.minTeamMembers) <= 0) return alert('Minimum team members must be at least 1');
    if (Number(data.minTeamMembers) > Number(data.maxTeamMembers)) return alert('minTeamMembers cannot exceed maxTeamMembers');
    if (Number(data.minTeams) > Number(data.maxTeams)) return alert('minTeams cannot exceed maxTeams');
    if (data.cost > 0 && data.payments.length === 0) return alert('Please provide payment details');
    const payload = { ...data, type: 'hackathon', orgId: JSON.parse(localStorage.getItem('user'))._id };

    try {
      const res = await api.post('/admin/event', payload);
      localStorage.setItem("user", JSON.stringify(res.data.org));
      localStorage.removeItem('hackathonDraft');
      nav('/profile');
    } catch (err) {
      console.error('Create failed', err);
      alert('Failed to create hackathon.');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-[#ECE8E7] flex justify-center items-start py-12">
      <div className="bg-gradient-to-br from-[#0f1724] to-[#071025] border border-[#1f2937] shadow-2xl rounded-3xl w-full max-w-4xl p-8 space-y-6">
        <h2 className="text-3xl font-extrabold text-center text-gradient bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-pink-400 mb-2">
          Create Hackathon
        </h2>
        <p className="text-center text-sm text-gray-400">Configure your hackathon, team rules, tracks and assets. Create once and manage participants from the dashboard.</p>

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

          {/* Registration deadline and Team settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#ECE8E7] mb-1 font-semibold">Registration deadline</label>
              <input
                type="date"
                className="w-full bg-[#0b1220] border border-[#22303b] rounded-lg p-2 text-[#ECE8E7] focus:outline-none focus:ring-2 focus:ring-indigo-600"
                value={data.registrationDeadline}
                onChange={e => setData(prev => ({ ...prev, registrationDeadline: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[#ECE8E7] mb-1 font-semibold">Min team members</label>
                <input type="number" min={1} className="w-full bg-[#0b1220] border border-[#22303b] rounded-lg p-2 text-[#ECE8E7] focus:outline-none focus:ring-2 focus:ring-indigo-600" value={data.minTeamMembers} onChange={e => setData(prev => ({ ...prev, minTeamMembers: e.target.value }))} />
              </div>
              <div>
                <label className="block text-[#ECE8E7] mb-1 font-semibold">Max team members</label>
                <input type="number" min={1} className="w-full bg-[#0b1220] border border-[#22303b] rounded-lg p-2 text-[#ECE8E7] focus:outline-none focus:ring-2 focus:ring-indigo-600" value={data.maxTeamMembers} onChange={e => setData(prev => ({ ...prev, maxTeamMembers: e.target.value }))} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#ECE8E7] mb-1 font-semibold">Min teams</label>
              <input type="number" min={1} className="w-full bg-[#0b1220] border border-[#22303b] rounded-lg p-2 text-[#ECE8E7] focus:outline-none focus:ring-2 focus:ring-indigo-600" value={data.minTeams} onChange={e => setData(prev => ({ ...prev, minTeams: e.target.value }))} />
            </div>
            <div>
              <label className="block text-[#ECE8E7] mb-1 font-semibold">Max teams</label>
              <input type="number" min={1} className="w-full bg-[#0b1220] border border-[#22303b] rounded-lg p-2 text-[#ECE8E7] focus:outline-none focus:ring-2 focus:ring-indigo-600" value={data.maxTeams} onChange={e => setData(prev => ({ ...prev, maxTeams: e.target.value }))} />
            </div>
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
          {/* Cost */}
          <div>
            <label className="block text-[#ECE8E7] mb-1 font-semibold">Cost per team</label>
            <input
              className="w-full bg-[#1a1a1a] border border-[#919294]/40 rounded-lg p-2 text-[#ECE8E7] focus:outline-none focus:ring-2 focus:ring-[#E16254]"
              value={data.cost}
              onChange={e => setData(prev => ({ ...prev, cost: e.target.value }))}
              placeholder="Cost or entry fee (if any or else 0) "
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
                className="flex-grow bg-[#0b1220] border border-[#22303b] rounded-lg p-2 text-[#ECE8E7] focus:outline-none focus:ring-2 focus:ring-indigo-600"
                value={trackInput}
                onChange={e => setTrackInput(e.target.value)}
                placeholder="Add track (e.g., Healthcare)"
              />
              <button
                type="button"
                className="bg-indigo-600 text-white rounded-lg px-4 py-2 hover:bg-indigo-500 transition shadow"
                onClick={addTrack}
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {data.tracks.map((t, i) => (
                <div
                  key={i}
                  className="bg-[#071021] border border-[#112034] px-3 py-1 rounded-full text-sm flex items-center gap-2"
                >
                  <span className="text-gray-200">{t}</span>
                  <button type="button" onClick={() => removeTrack(i)} className="text-indigo-400 font-bold">✕</button>
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
          {/* Links */}
          <div>
            <label className="block text-[#ECE8E7] mb-2 font-semibold">Important Links</label>
            <p className="text-sm text-gray-400 mb-3">Add links to WhatsApp groups, Discord servers, or other resources.</p>
            <div className="space-y-3">
              {data.links.map((link, index) => (
                <div key={index} className="flex flex-col sm:flex-row gap-3 bg-[#0b1220] p-3 rounded-lg border border-[#22303b]">
                  <input
                    type="text"
                    placeholder="Title (e.g., WhatsApp Group)"
                    className="flex-1 bg-[#1a1a1a] border border-[#919294]/40 rounded-lg p-2 text-[#ECE8E7] focus:outline-none focus:ring-2 focus:ring-[#E16254]"
                    value={link.title || ''}
                    onChange={(e) => {
                      const newLinks = [...data.links];
                      if (typeof newLinks[index] === 'string') newLinks[index] = { title: '', url: newLinks[index] };
                      newLinks[index].title = e.target.value;
                      setData(prev => ({ ...prev, links: newLinks }));
                    }}
                  />
                  <input
                    type="text"
                    placeholder="URL (https://...)"
                    className="flex-[2] bg-[#1a1a1a] border border-[#919294]/40 rounded-lg p-2 text-[#ECE8E7] focus:outline-none focus:ring-2 focus:ring-[#E16254]"
                    value={link.url || (typeof link === 'string' ? link : '')}
                    onChange={(e) => {
                      const newLinks = [...data.links];
                      if (typeof newLinks[index] === 'string') newLinks[index] = { title: '', url: newLinks[index] };
                      newLinks[index].url = e.target.value;
                      setData(prev => ({ ...prev, links: newLinks }));
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setData(prev => ({ ...prev, links: prev.links.filter((_, i) => i !== index) }))}
                    className="text-red-400 hover:text-red-500 font-bold px-2"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setData(prev => ({ ...prev, links: [...prev.links, { title: '', url: '' }] }))}
                className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
              >
                + Add Link
              </button>
            </div>
          </div>
          {/* Payment */}
          {Number(data.cost) > 0 && (
            <div>
              <label className="block text-[#ECE8E7] mb-1 font-semibold">
                Payment Details
              </label>
              {data.payments && data.payments.length > 0 ? (
                <div className="space-y-2 mb-2">
                  {data.payments.map((payment, index) => (
                    <div key={index} className="bg-[#07101a] border border-[#112034] p-3 rounded-lg flex items-center justify-between">
                      <div>
                        <div className="text-sm text-gray-200">UPI ID: {payment.upi}</div>
                        {payment.imgUrl && (
                          <img
                            src={payment.imgUrl}
                            alt="Payment QR"
                            className="h-20 mt-2 rounded border border-[#152233]"
                          />
                        )}
                      </div>
                      <button

                        type="button"
                        className="text-red-500 font-bold"
                        onClick={() => {
                          setData(prev => ({
                            ...prev,
                            payments: prev.payments.filter((_, idx) => idx !== index)
                          }));
                        }}
                      >

                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 mb-2">No payment methods added.</p>
              )}
              <button onClick={() => { setopenPayment(true) }}>
                + Add payments
              </button>
            </div>
          )}
          {/* the other details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-100 mb-2">Custom participant fields</h3>
            <p className="text-sm text-gray-400 mb-3">Add extra fields you want participants to fill during registration (e.g., GitHub link, project idea).</p>
            <div className="flex gap-3">
              <button onClick={() => { setopen(true) }} className="bg-transparent border border-gray-700 text-gray-200 px-3 py-1 rounded hover:bg-gray-800">+ Add a field</button>
              <div className="text-sm text-gray-400">{data.other.length} fields configured</div>
            </div>
            <div className="mt-3 space-y-2">
              {data.other.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between bg-[#07101a] border border-[#112034] p-2 rounded">
                  <div>
                    <div className="text-sm text-gray-200">{item.title}</div>
                    <div className="text-xs text-gray-500">Type: {item.type}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                localStorage.setItem('hackathonDraft', JSON.stringify(data));
                alert('Draft saved');
              }}
              className="bg-[#0b1220] text-gray-200 px-4 py-2 rounded-lg hover:bg-[#07101a] transition"
            >
              Save Draft
            </button>
            <button
              type="button"
              onClick={() => setData({
                eventTitle: '', theme: '', startDate: '', startTime: '', endDate: '',
                venue: '', registrationDeadline: '', minTeamMembers: 1, maxTeamMembers: 4,
                minTeams: 1, maxTeams: 100, prize: '', tracks: [], description: '',
                bannerUrl: '', logoUrl: '', photo1Url: '', photo2Url: '', other: []
              })}
              className="bg-gray-700 text-gray-100 px-4 py-2 rounded-lg hover:bg-gray-600 transition"
            >
              Clear
            </button>
          </div>
          <div className="flex gap-3">
            <button
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-500 shadow-lg transform hover:-translate-y-0.5 transition"
              onClick={handleSubmit}
            >
              Create Hackathon
            </button>
          </div>
        </div>
      </div>
      {open && <Popup prop={{ setData, setopen }} />}
      {openPayment && <Payment_Popup prop={{ setData, setopenPayment }} />}
    </div>
  );
}

export default HackthonForm;

function Popup({ prop }) {
  const [data, setData] = useState({ title: '', type: 'text' });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => prop.setopen(false)} />
      <div className="relative bg-[#071021] border border-[#112034] text-gray-100 p-6 rounded-lg w-full max-w-md shadow-xl">
        <h3 className="text-lg font-semibold mb-3">Add custom field</h3>
        <label className="block text-sm text-gray-300 mb-1">Field title</label>
        <input type="text" placeholder="e.g., GitHub URL" className="w-full mb-3 p-2 rounded bg-[#07101a] border border-[#152233]" onChange={(e) => { setData(prev => ({ ...prev, title: e.target.value })) }} />
        <label className="block text-sm text-gray-300 mb-1">Field type</label>
        <select className="w-full mb-4 p-2 rounded bg-[#07101a] border border-[#152233]" value={data.type} onChange={(e) => { setData(prev => ({ ...prev, type: e.target.value })) }}>
          <option value="text">Text</option>
          <option value="upload">Upload</option>
        </select>
        <div className="flex justify-end gap-2">
          <button className="px-3 py-1 rounded bg-transparent border border-gray-600" onClick={() => prop.setopen(false)}>Cancel</button>
          <button className="px-3 py-1 rounded bg-indigo-600 text-white" onClick={() => {
            prop.setData((prev) => {
              const updatedOther = [...prev.other, data];
              return { ...prev, other: updatedOther };
            })
            prop.setopen(false);
          }}>Add field</button>
        </div>
      </div>
    </div>
  )
}
function Payment_Popup({ prop }) {
  const wid = useRef();
  const [data, setData] = useState({ upi: '', imgUrl: '' });

  useEffect(() => {
    if (typeof cloudinary === 'undefined') return;
    if (wid.current) return;

    const widget = cloudinary.createUploadWidget(
      {
        cloudName: 'dfseckyjx',
        uploadPreset: 'qbvu3y5j',
        multiple: false,
      },
      (error, result) => {
        if (error) console.log(error);
        if (!error && result && result.event === 'success') {
          const url = result.info.secure_url;
          console.log(url);
          setData(prev => ({ ...prev, imgUrl: url }));
        }
      }
    );
    wid.current = widget;
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => prop.setopenPayment(false)}
      />

      {/* Modal */}
      <div className="relative bg-[#071021] border border-[#112034] text-gray-100 p-6 rounded-lg w-full max-w-md shadow-xl">
        <h3 className="text-lg font-semibold mb-3">Add payment</h3>

        {/* UPI ID */}
        <label className="block text-sm text-gray-300 mb-1">UPI ID</label>
        <input
          type="text"
          placeholder="e.g., username@upi"
          className="w-full mb-3 p-2 rounded bg-[#07101a] border border-[#152233]"
          value={data.upi}
          onChange={e =>
            setData(prev => ({ ...prev, upi: e.target.value }))
          }
        />

        {/* QR Code */}
        <label className="block text-sm text-gray-300 mb-1">QR Code</label>
        <button
          type="button"
          className="mb-3 px-3 py-1 rounded bg-indigo-600 text-white"
          onClick={() => wid.current && wid.current.open()}
        >
          Upload QR
        </button>

        {data.imgUrl && (
          <div className="mb-3">
            <img
              src={data.imgUrl}
              alt="UPI QR"
              className="h-32 object-contain rounded border border-[#152233]"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button
            className="px-3 py-1 rounded bg-transparent border border-gray-600"
            onClick={() => prop.setopenPayment(false)}
          >
            Cancel
          </button>
          <button
            className="px-3 py-1 rounded bg-indigo-600 text-white"
            onClick={() => {
              prop.setData(prev => {
                const updatedPayments = [...(prev.payments || []), data];
                return { ...prev, payments: updatedPayments };
              });
              prop.setopenPayment(false);
            }}
          >
            Add payment
          </button>
        </div>
      </div>
    </div>
  );
}
