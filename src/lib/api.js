import axios from "axios";

const api = axios.create({
    baseURL: "https://dasho-backend-t28v.onrender.com",
})

export default api;