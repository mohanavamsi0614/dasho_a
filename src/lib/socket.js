import { io } from "socket.io-client";

const socket = io("https://dasho-backend.onrender.com/");

export default socket;