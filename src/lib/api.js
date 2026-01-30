import axios from "axios";

const api = axios.create({
    baseURL: "https://dasho-backend-3amp.onrender.com",
})

export default api;