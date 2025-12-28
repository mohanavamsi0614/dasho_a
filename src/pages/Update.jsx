import socket from "@/lib/socket";
import { useState } from "react";
import { useParams } from "react-router";

function Update() {
    const [update, setUpdate] = useState("");
    const { eventId } = useParams();

    const handleSubmit = () => {
        socket.emit("update", { update: update, id: eventId });
    };

    return (
        <div className="min-h-screen  flex justify-center py-10 px-4">
            <div className="w-full max-w-2xl bg-white shadow-lg rounded-2xl p-6">

                <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                    Send Update
                </h2>

                <label className="block text-gray-600 mb-2">
                    Write your update:
                </label>

                <textarea
                    value={update}
                    onChange={(e) => setUpdate(e.target.value)}
                    className="w-full text-black h-40 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 transition"
                    placeholder="Type something..."
                />

                <button
                    onClick={handleSubmit}
                    className="mt-4 bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg font-medium shadow transition"
                >
                    Submit
                </button>

                {update && (
                    <div className="mt-6">
                        <h3 className="text-lg font-medium text-gray-700 mb-2">Preview:</h3>
                        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg prose max-w-none"
                            dangerouslySetInnerHTML={{ __html: update }}
                        ></div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Update;
