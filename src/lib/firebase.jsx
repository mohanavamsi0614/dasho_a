/* global cloudinary */
// firebase.jsx
import api from "./api";
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const firebaseConfig = {
  apiKey: "AIzaSyAlx6nKoPwrMuI-VGsaIgUza4iCG5MDsCU",
  authDomain: "dasho-84421.firebaseapp.com",
  projectId: "dasho-84421",
  storageBucket: "dasho-84421.firebasestorage.app",
  messagingSenderId: "763118217493",
  appId: "1:763118217493:web:e94e3cd616ca04b8c5a11c",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

function Google() {
  const [newOrg, setNewOrg] = useState(false);
  const wid = useRef();
  const nav = useNavigate();

  const [data, setData] = useState({
    orgName: "",
    orgType: "",
    website: "",
    address: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    description: "",
    imgUrl: "",
    links: [],
  });

  const [currentLink, setCurrentLink] = useState({ title: "", url: "" });
  const [email, setEmail] = useState("")

  const addLink = () => {
    if (currentLink.title && currentLink.url) {
      setData((prev) => ({
        ...prev,
        links: [...(prev.links || []), currentLink],
      }));
      setCurrentLink({ title: "", url: "" });
    }
  };

  const removeLink = (index) => {
    setData((prev) => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index),
    }));
  };

  useEffect(() => {
    if (typeof cloudinary === "undefined") return;
    if (wid.current) return;
    let myWidget = cloudinary.createUploadWidget(
      {
        cloudName: "dfseckyjx",
        uploadPreset: "qbvu3y5j",
        multiple: false,
        folder: "org_logos",
      },
      (error, result) => {
        if (!error && result && result.event === "success") {
          setData((prev) => ({ ...prev, imgUrl: result.info.secure_url }));
        }
      }
    );
    wid.current = myWidget;
  }, []);

  const provider = new GoogleAuthProvider();

  const reg = () => {
    api
      .post("/admin/register", data)
      .then((res) => {
        localStorage.setItem("user", JSON.stringify(res.data.org));
        nav("/profile");
      })
      .catch(() => alert("Registration failed"));
  };

  const Sign = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        const user = result.user;
        api
          .post("/admin/auth", { email: user.email })
          .then((res) => {
            setEmail(user.email);
            if (res.data.newOrg) setNewOrg(true);
            else {
              localStorage.setItem("user", JSON.stringify(res.data.org));
              nav("/profile");
            }
          });
      })
      .catch(() => alert("Google sign-in failed"));
  };

  return (
    <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-lg mx-auto">
      {newOrg ? (
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold text-center text-gray-800">
            Organization Registration
          </h2>

          {[
            { label: "Organization name*", key: "orgName" },
            { label: "Organization type", key: "orgType" },
            { label: "Website", key: "website" },
            { label: "Contact email*", key: "email", type: "email" },
            { label: "Address / Location", key: "address" },
            { label: "Contact person", key: "contactName" },
            { label: "Contact phone", key: "contactPhone" },
          ].map((item) => (
            <div key={item.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {item.label}
              </label>
              <input
                type={item.type || "text"}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-red-300"
                value={data[item.key]}
                onChange={(e) =>
                  setData((prev) => ({ ...prev, [item.key]: e.target.value }))
                }
              />
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Short description
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-red-300"
              rows="3"
              value={data.description}
              onChange={(e) =>
                setData((prev) => ({ ...prev, description: e.target.value }))
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Links
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Title"
                className="w-1/3 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-red-300"
                value={currentLink.title}
                onChange={(e) =>
                  setCurrentLink({ ...currentLink, title: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="URL"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-red-300"
                value={currentLink.url}
                onChange={(e) =>
                  setCurrentLink({ ...currentLink, url: e.target.value })
                }
              />
              <button
                type="button"
                onClick={addLink}
                className="bg-gray-700 text-white px-3 py-2 rounded-lg hover:bg-gray-800"
              >
                Add
              </button>
            </div>
            <ul className="space-y-2">
              {data.links?.map((link, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center bg-gray-50 p-2 rounded-lg border border-gray-200"
                >
                  <span className="text-gray-800 font-medium">
                    {link.title} -{" "}
                    <span className="text-gray-500 font-normal text-sm">
                      {link.url}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => removeLink(index)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => wid.current && wid.current.open()}
              className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800"
            >
              Upload Logo
            </button>
            {data.imgUrl ? (
              <img
                src={data.imgUrl}
                alt="org logo"
                className="h-16 w-16 rounded-lg object-cover"
              />
            ) : (
              <p className="text-gray-500 text-sm">No logo uploaded</p>
            )}
          </div>

          <div className="flex justify-between mt-4">
            <button
              onClick={reg}
              className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg font-medium"
            >
              Submit
            </button>
            <button
              onClick={() => setNewOrg(false)}
              className="border border-gray-300 px-5 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">Welcome!</h2>
          <p className="text-gray-600">
            Sign in with Google to register or manage your organization.
          </p>
          <button
            onClick={Sign}
            className="bg-red-500 hover:bg-red-600 text-white font-medium px-6 py-3 rounded-lg transition-all shadow-md"
          >
            Sign in with Google
          </button>
        </div>
      )}
    </div>
  );
}

export default Google;
