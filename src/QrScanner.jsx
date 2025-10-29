import React, { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import axios from "axios";
import { useParams } from "react-router";

const QRScanner = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const { event } = useParams();
  const [qrResult, setQrResult] = useState("");
  const [cameraActive, setCameraActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (cameraActive) {
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: "environment" } })
        .then((stream) => {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute("playsinline", true);
          videoRef.current.play();
          requestAnimationFrame(scanFrame);
        })
        .catch((err) => console.error("Camera error:", err));
    } else {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    }
  }, [cameraActive]);

  const scanFrame = () => {
    if (!cameraActive) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      const ctx = canvas.getContext("2d");
      canvas.height = video.videoHeight;
      canvas.width = video.videoWidth;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, canvas.width, canvas.height);

      if (code) {
        setLoading(true);
        axios
          .get(code.data)
          .then((res) => {
            setQrResult(res.data.user);
            setCameraActive(false);
            setStatus("verified");
          })
          .catch(() => {
            setStatus("not-found");
            setCameraActive(false);
          })
          .finally(() => setLoading(false));
        return;
      }
    }
    requestAnimationFrame(scanFrame);
  };

  const handleCheck = async (type) => {
    setLoading(true);
    try {
      await axios.post(`https://dasho-backend.onrender.com/admin/event/qr/${event}`, {
        userId: qrResult._id,
        status: type,
        time: new Date().getTime(),
      });
      setStatus(type);
      setQrResult("");
      setCameraActive(true);
    } catch {
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setCameraActive(true);
    setQrResult("");
    setStatus("");
  };

  const InfoRow = ({ label, value }) => (
    <div className="flex justify-between text-sm text-gray-400 mb-1">
      <span>{label}</span>
      <span className="font-semibold text-gray-200">{value}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-[#ECE8E7] p-4">
      <div className="bg-[#121212] border border-[#919294] rounded-2xl shadow-lg p-6 w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-6 text-[#E16254]">
          Student Verification
        </h2>

        {/* Video Scanner */}
        {cameraActive && (
          <div className="mb-6">
            <video
              ref={videoRef}
              className="w-full rounded-xl border border-[#E16254]/40 shadow-lg"
            />
            <canvas ref={canvasRef} className="hidden" />
            <p className="mt-3 text-sm text-gray-400">
              📷 Point the camera at a QR code
            </p>
          </div>
        )}

        {/* Loader */}
        {loading && (
          <div className="flex flex-col items-center my-6">
            <div className="animate-spin w-10 h-10 border-4 border-gray-600 border-t-[#E16254] rounded-full" />
            <p className="mt-3 text-[#E16254] font-medium">Processing...</p>
          </div>
        )}

        {/* QR Result */}
        {qrResult && !loading && (
          <div className="bg-[#1a1a1a] border border-[#E16254]/50 rounded-xl p-5 shadow-lg">
            <div className="text-2xl mb-2">✅</div>
            <h3 className="text-lg font-semibold text-[#E16254] mb-3">
              Student Verified
            </h3>
            <InfoRow label="Name" value={qrResult.name} />
            <InfoRow label="Slip Number" value={qrResult.regnumber} />
            <InfoRow label="Phone" value={qrResult.phonenumber} />

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => handleCheck("checkin")}
                disabled={loading}
                className="flex-1 bg-[#E16254] hover:bg-[#c94d44] text-white font-medium py-2 rounded-lg transition disabled:bg-gray-600"
              >
                Check In
              </button>
              <button
                onClick={() => handleCheck("checkout")}
                disabled={loading}
                className="flex-1 bg-[#E16254] hover:bg-[#c94d44] text-white font-medium py-2 rounded-lg transition disabled:bg-gray-600"
              >
                Check Out
              </button>
            </div>
          </div>
        )}

        {/* Status messages */}
        {status === "not-found" && !loading && (
          <div className="bg-red-900/30 border border-red-600 rounded-xl p-4 mt-4">
            ❌ <span className="font-semibold">Student not found</span>
          </div>
        )}
        {status === "error" && !loading && (
          <div className="bg-yellow-900/30 border border-yellow-600 rounded-xl p-4 mt-4">
            ⚠️ <span className="font-semibold">Error verifying student</span>
          </div>
        )}

        {/* Back Button */}
        {!cameraActive && !loading && (
          <button
            onClick={handleBack}
            className="mt-6 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg text-[#ECE8E7] transition"
          >
            ← Back
          </button>
        )}
      </div>

      <p className="mt-6 text-sm text-gray-500">
        Scan a student QR code to verify their identity.
      </p>
    </div>
  );
};

export default QRScanner;
