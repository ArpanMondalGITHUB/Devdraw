import axios from "axios";
import {config} from "../config/config"

const axiosInstance = axios.create({
    baseURL: config.apiUrl,
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true,
});

export default axiosInstance;