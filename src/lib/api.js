import axios from "axios";

const api = axios.create({
    baseURL: "https://dasho-backend.onrender.com",
})

export default api;