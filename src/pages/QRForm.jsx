/* global cloudinary */
/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function QRForm() {
  const nav = useNavigate();
  const widgetRef = useRef();
  const currentSlot = useRef("");

  const [data, setData] = useState({
    eventTitle: "",
    shortTitle: "",
    startDate: "",
    startTime: "",
    endDate: "",
    venue: "",
    address: "",
    capacity: "",
    ticketPrice: "",
    description: "",
    segments: [],
    bannerUrl: "",
    logoUrl: "",
    photo1Url: "",
    photo2Url: "",
    type: "qr",
    other: []
  });

  const [segmentInput, setSegmentInput] = useState("");
  const [openOther, setOpenOther] = useState(false);

  useEffect(() => {
    if (typeof cloudinary === "undefined") {
      console.warn(
        "Cloudinary not found on window. Include Cloudinary script in index.html"
      );
      return;
    }
    if (widgetRef.current) return;

    const widget = cloudinary.createUploadWidget(
      {
        cloudName: "dfseckyjx",
        uploadPreset: "qbvu3y5j",
        multiple: false,
        maxFiles: 1,
      },
      (error, result) => {
        if (!error && result && result.event === "success") {
          const url = result.info.secure_url;
          const slot = currentSlot.current;
          if (slot) setData((prev) => ({ ...prev, [slot]: url }));
        } else if (error) {
          console.error("Cloudinary upload error", error);
          alert("Image upload failed. See console for details.");
        }
      }
    );

    widgetRef.current = widget;
  }, []);

  const openUpload = (slot) => {
    if (!widgetRef.current) return alert("Upload widget not ready");
    currentSlot.current = slot;
    widgetRef.current.open();
  };

  const addSegment = () => {
    const v = segmentInput.trim();
    if (!v || data.segments.includes(v)) return;
    setData((prev) => ({ ...prev, segments: [...prev.segments, v] }));
    setSegmentInput("");
  };

  const removeSegment = (idx) =>
    setData((prev) => ({
      ...prev,
      segments: prev.segments.filter((_, i) => i !== idx),
    }));

  async function handleSubmit(e) {
    e.preventDefault();
    if (!data.eventTitle || !data.startDate)
      return alert("Please provide event title and start date");

    const user = (() => {
      try {
        return JSON.parse(localStorage.getItem("user")) || {};
      } catch {
        return {};
      }
    })();
    const orgId = user._id || user.orgId || null;

    const slug = (s = "") =>
      String(s)
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
        .replace(/-+/g, "-");

    const eventId = `${slug(
      user.orgName || user.name || orgId || "org"
    )}-${slug(data.eventTitle)}`;

    const payload = {
      ...data,
      capacity: Number(data.capacity) || 0,
      ticketPrice: Number(data.ticketPrice) || 0,
      segments: data.segments.map((s) => String(s).trim()).filter(Boolean),
      orgId,
      by: orgId,
      eventId,
    };

    try {
      const res = await axios.post("http://localhost:6100/admin/event", payload);
      if (res.data.org)
        localStorage.setItem("user", JSON.stringify(res.data.org));
      nav("/profile");
    } catch (err) {
      console.error("Event creation failed", err);
      alert("Event creation failed. See console for details.");
    }
  }

  return (
    <div className="min-h-screen bg-black text-[#ECE8E7] py-10 px-6">
      <form
        onSubmit={handleSubmit}
        className="max-w-3xl mx-auto bg-[#111] p-8 rounded-2xl shadow-lg border border-[#919294]/40"
      >
        <h2 className="text-3xl font-bold mb-6 text-center">Create QR Event</h2>

        {/* Event Title */}
        <div className="space-y-2 mb-5">
          <label className="font-semibold text-sm text-[#919294]">
            Event Title *
          </label>
          <input
            value={data.eventTitle}
            onChange={(e) =>
              setData((p) => ({ ...p, eventTitle: e.target.value }))
            }
            placeholder="Event name"
            className="w-full bg-[#1a1a1a] border border-[#919294]/30 p-3 rounded-lg focus:outline-none focus:border-[#E16254]"
          />
        </div>

        {/* Short Title */}
        <div className="space-y-2 mb-5">
          <label className="font-semibold text-sm text-[#919294]">
            Short Title / Slug
          </label>
          <input
            value={data.shortTitle}
            onChange={(e) =>
              setData((p) => ({ ...p, shortTitle: e.target.value }))
            }
            placeholder="Short code"
            className="w-full bg-[#1a1a1a] border border-[#919294]/30 p-3 rounded-lg"
          />
        </div>

        {/* Dates */}
        <div className="grid sm:grid-cols-3 gap-4 mb-5">
          <div>
            <label className="text-sm text-[#919294]">Start Date *</label>
            <input
              type="date"
              value={data.startDate}
              onChange={(e) =>
                setData((p) => ({ ...p, startDate: e.target.value }))
              }
              className="w-full bg-[#1a1a1a] border border-[#919294]/30 p-3 rounded-lg"
            />
          </div>
          <div>
            <label className="text-sm text-[#919294]">Start Time</label>
            <input
              type="time"
              value={data.startTime}
              onChange={(e) =>
                setData((p) => ({ ...p, startTime: e.target.value }))
              }
              className="w-full bg-[#1a1a1a] border border-[#919294]/30 p-3 rounded-lg"
            />
          </div>
          <div>
            <label className="text-sm text-[#919294]">End Date</label>
            <input
              type="date"
              value={data.endDate}
              onChange={(e) =>
                setData((p) => ({ ...p, endDate: e.target.value }))
              }
              className="w-full bg-[#1a1a1a] border border-[#919294]/30 p-3 rounded-lg"
            />
          </div>
        </div>

        {/* Venue */}
        <div className="space-y-2 mb-5">
          <label className="text-sm text-[#919294]">Venue / Place</label>
          <input
            value={data.venue}
            onChange={(e) => setData((p) => ({ ...p, venue: e.target.value }))}
            placeholder="Venue name"
            className="w-full bg-[#1a1a1a] border border-[#919294]/30 p-3 rounded-lg"
          />
        </div>

        {/* Address */}
        <div className="space-y-2 mb-5">
          <label className="text-sm text-[#919294]">Address</label>
          <input
            value={data.address}
            onChange={(e) => setData((p) => ({ ...p, address: e.target.value }))}
            placeholder="City, State, Country"
            className="w-full bg-[#1a1a1a] border border-[#919294]/30 p-3 rounded-lg"
          />
        </div>

        {/* Capacity + Ticket */}
        <div className="grid sm:grid-cols-2 gap-4 mb-5">
          <div>
            <label className="text-sm text-[#919294]">Capacity</label>
            <input
              type="number"
              value={data.capacity}
              onChange={(e) =>
                setData((p) => ({ ...p, capacity: e.target.value }))
              }
              placeholder="Expected attendees"
              className="w-full bg-[#1a1a1a] border border-[#919294]/30 p-3 rounded-lg"
            />
          </div>
          <div>
            <label className="text-sm text-[#919294]">Ticket Price</label>
            <input
              type="number"
              value={data.ticketPrice}
              onChange={(e) =>
                setData((p) => ({ ...p, ticketPrice: e.target.value }))
              }
              placeholder="0 for free"
              className="w-full bg-[#1a1a1a] border border-[#919294]/30 p-3 rounded-lg"
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2 mb-5">
          <label className="text-sm text-[#919294]">Description</label>
          <textarea
            rows={3}
            value={data.description}
            onChange={(e) =>
              setData((p) => ({ ...p, description: e.target.value }))
            }
            placeholder="Short description or agenda"
            className="w-full bg-[#1a1a1a] border border-[#919294]/30 p-3 rounded-lg"
          />
        </div>

        {/* Segments */}
        <div className="space-y-2 mb-5">
          <label className="text-sm text-[#919294]">Segments / Tags</label>
          <div className="flex gap-2">
            <input
              value={segmentInput}
              onChange={(e) => setSegmentInput(e.target.value)}
              placeholder="Add a tag (e.g., workshop)"
              className="flex-1 bg-[#1a1a1a] border border-[#919294]/30 p-3 rounded-lg"
            />
            <button
              type="button"
              onClick={addSegment}
              className="bg-[#E16254] text-white px-4 rounded-lg hover:bg-red-700 transition"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {data.segments.map((s, i) => (
              <div
                key={i}
                className="bg-[#E16254]/20 px-3 py-1 rounded-full text-sm flex items-center gap-2"
              >
                <span>{s}</span>
                <button
                  type="button"
                  onClick={() => removeSegment(i)}
                  className="text-[#E16254] hover:text-red-500"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Image Uploads */}
        <div className="mb-6">
          <h3 className="font-semibold mb-3 text-[#ECE8E7]">
            Upload Images (up to 4)
          </h3>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              ["bannerUrl", "Banner (1200x400)"],
              ["logoUrl", "Logo (square)"],
              ["photo1Url", "Photo 1"],
              ["photo2Url", "Photo 2"],
            ].map(([slot, label]) => (
              <div key={slot}>
                <p className="text-xs text-[#919294]">{label}</p>
                <div className="flex gap-3 items-center mt-2">
                  <button
                    type="button"
                    onClick={() => openUpload(slot)}
                    className="bg-[#E16254] text-white text-sm px-4 py-2 rounded-lg hover:bg-red-700 transition"
                  >
                    Upload
                  </button>
                  {data[slot] ? (
                    <img
                      src={data[slot]}
                      alt={slot}
                      className="h-12 w-12 object-cover rounded-lg border border-[#919294]/40"
                    />
                  ) : (
                    <div className="text-xs text-[#919294]">No image</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Fields */}
        <div className="space-y-2 mb-5">
          <label className="text-sm text-[#919294]">Custom participant fields</label>
          <div className="flex gap-3 items-center">
            <div className="flex-1 flex flex-wrap gap-2">
              {data.other && data.other.length ? (
                data.other.map((f, i) => (
                  <div
                    key={i}
                    className="bg-[#22303b] px-3 py-1 rounded-full text-sm flex items-center gap-2"
                  >
                    <span>{f.title} ({f.type})</span>
                    <button
                      type="button"
                      onClick={() =>
                        setData((p) => ({ ...p, other: p.other.filter((_, j) => j !== i) }))
                      }
                      className="text-red-400 hover:text-red-500"
                    >
                      ✕
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-xs text-[#919294]">No custom fields</div>
              )}
            </div>
            <button
              type="button"
              onClick={() => setOpenOther(true)}
              className="bg-[#4f46e5] text-white px-3 py-2 rounded-lg hover:bg-indigo-600 transition"
            >
              + Add field
            </button>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 justify-end mt-6">
          <button
            type="submit"
            className="bg-[#E16254] px-6 py-2 rounded-lg text-white font-semibold hover:bg-red-700 transition"
          >
            Create Event
          </button>
          <button
            type="button"
            onClick={() => {
              localStorage.setItem("draftEvent", JSON.stringify(data));
              alert("Draft saved locally");
            }}
            className="border border-[#919294]/50 px-6 py-2 rounded-lg hover:bg-[#1a1a1a]"
          >
            Save Draft
          </button>
          <button
            type="button"
            onClick={() =>
              setData({
                eventTitle: "",
                shortTitle: "",
                startDate: "",
                startTime: "",
                endDate: "",
                venue: "",
                address: "",
                capacity: "",
                ticketPrice: "",
                description: "",
                segments: [],
                bannerUrl: "",
                logoUrl: "",
                photo1Url: "",
                photo2Url: "",
                other: [],
              })
            }
            className="border border-[#E16254]/60 text-[#E16254] px-6 py-2 rounded-lg hover:bg-[#E16254]/10"
          >
            Clear
          </button>
        </div>
      </form>
      {openOther && <Popup prop={{ setData, setOpenOther }} />}
    </div>
  );
}

function Popup({ prop }) {
  const [field, setField] = useState({ title: '', type: 'text' });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={() => prop.setOpenOther(false)} />
      <div className="relative bg-[#0b1220] border border-[#22303b] text-gray-100 p-6 rounded-lg w-full max-w-md shadow-xl">
        <h3 className="text-lg font-semibold mb-3">Add custom field</h3>
        <label className="block text-sm text-gray-300 mb-1">Field title</label>
        <input type="text" placeholder="e.g., GitHub URL" className="w-full mb-3 p-2 rounded bg-[#07101a] border border-[#152233]" value={field.title} onChange={(e) => setField(prev => ({ ...prev, title: e.target.value }))} />
        <label className="block text-sm text-gray-300 mb-1">Field type</label>
        <select className="w-full mb-4 p-2 rounded bg-[#07101a] border border-[#152233]" value={field.type} onChange={(e) => setField(prev => ({ ...prev, type: e.target.value }))}>
          <option value="text">Text</option>
          <option value="upload">Upload</option>
        </select>
        <div className="flex justify-end gap-2">
          <button className="px-3 py-1 rounded bg-transparent border border-gray-600" onClick={() => prop.setOpenOther(false)}>Cancel</button>
          <button className="px-3 py-1 rounded bg-indigo-600 text-white" onClick={() => {
            if (!field.title) return alert('Please provide a title');
            prop.setData(prev => ({ ...prev, other: [...(prev.other || []), field] }));
            prop.setOpenOther(false);
          }}>Add field</button>
        </div>
      </div>
    </div>
  );
}

export default QRForm;
