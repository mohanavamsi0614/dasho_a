import { useNavigate } from "react-router-dom";

function Profile() {
  const nav = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || {};

  const orgName = user.orgName || user.name || "";
  const orgType = user.orgType || "";
  const website = user.website || "";
  const address = user.address || "";
  const contactName = user.contactName || "";
  const contactEmail = user.contactEmail || user.email || "";
  const contactPhone = user.contactPhone || user.phone || "";
  const description = user.description || user.bio || "";
  const imgUrl = user.imgUrl || "";
  const events = user.events || [];

  if (!orgName) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-gray-200">
        <p className="text-lg">
          No organization data available. Please register your organization from{" "}
          <a href="/auth" className="text-red-400 underline hover:text-red-500">
            auth page
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-gray-200 px-6 py-10">
      <div className="max-w-6xl mx-auto">
        {/* Org Info Section */}
        <div className="bg-[#111] rounded-2xl shadow-lg p-6 flex flex-col md:flex-row gap-6 items-start border border-gray-800">
          <div className="flex-shrink-0">
            {imgUrl ? (
              <img
                src={imgUrl}
                alt={orgName}
                className="w-32 h-32 rounded-xl object-cover border border-gray-700"
              />
            ) : (
              <div className="w-32 h-32 bg-gray-800 rounded-xl flex items-center justify-center text-gray-500">
                No Logo
              </div>
            )}
          </div>

          <div className="flex-1">
            <h1 className="text-3xl font-semibold text-white">{orgName}</h1>
            {orgType && (
              <p className="text-sm text-gray-400 mt-1">{orgType}</p>
            )}
            {website && (
              <a
                href={website}
                target="_blank"
                rel="noreferrer"
                className="text-red-400 hover:text-red-500 mt-1 block"
              >
                {website}
              </a>
            )}
            {address && (
              <p className="text-sm text-gray-400 mt-1">{address}</p>
            )}

            <div className="mt-4">
              <h2 className="text-xl font-medium text-white mb-2">
                Contact Information
              </h2>
              <p>{contactName}</p>
              <p>{contactEmail}</p>
              {contactPhone && <p>{contactPhone}</p>}
            </div>

            {description && (
              <div className="mt-4">
                <h2 className="text-xl font-medium text-white mb-2">
                  About / Description
                </h2>
                <p className="text-gray-400 whitespace-pre-wrap">
                  {description}
                </p>
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => nav("/auth")}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-white transition-all"
              >
                Edit Registration
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem("user");
                  nav("/auth");
                }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-800 rounded-lg text-gray-200 transition-all"
              >
                Logout / Re-register
              </button>
            </div>
          </div>
        </div>

        {/* Events Section */}
        <div className="mt-10">
          <h2 className="text-2xl font-semibold text-white mb-6">
            Our Events
          </h2>
          {events.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event, index) => (
                <div
                  key={index}
                  className="bg-[#111] border border-gray-800 rounded-xl p-5 shadow-md hover:shadow-red-500/10 transition-all"
                >
                  {event.bannerUrl && (
                    <img
                      src={event.bannerUrl}
                      alt={event.eventTitle}
                      className="w-full h-40 object-cover rounded-lg mb-4"
                    />
                  )}
                  <h3 className="text-xl font-semibold text-white mb-1">
                    {event.eventTitle || "Unnamed Event"}
                  </h3>
                  <p className="text-sm text-gray-400 mb-3 capitalize">
                    {event.type}
                  </p>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                    {event.description || "No description available."}
                  </p>

                  <div className="flex gap-3">
                    {event.type === "qr" ? (
                      <>
                        <button
                          onClick={() => nav(`/qr/scanner/${event._id.$oid || event._id}`)}
                          className="px-3 py-2 bg-red-500 hover:bg-red-600 rounded-md text-white text-sm"
                        >
                          QR Scanner
                        </button>
                        <button
                          onClick={() => nav(`/dashboard/qr/${event._id.$oid || event._id}`)}
                          className="px-3 py-2 bg-gray-800 hover:bg-gray-900 rounded-md text-gray-200 text-sm"
                        >
                          Dashboard
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => nav(`/attd/${event._id.$oid || event._id}`)}
                          className="px-3 py-2 bg-red-500 hover:bg-red-600 rounded-md text-white text-sm"
                        >
                          Attendance
                        </button>
                        <button
                          onClick={() => nav(`/dashboard/hack/${event._id.$oid || event._id}`)}
                          className="px-3 py-2 bg-gray-800 hover:bg-gray-900 rounded-md text-gray-200 text-sm"
                        >
                          Dashboard
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No events added yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
