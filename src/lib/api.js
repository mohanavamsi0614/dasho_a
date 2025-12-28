import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:6100",
})

export default api;