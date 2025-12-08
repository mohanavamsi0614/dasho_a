import { io } from "socket.io-client";

const socket = io("http://localhost:6100");

export default socket;