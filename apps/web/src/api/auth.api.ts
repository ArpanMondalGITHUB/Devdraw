import axiosInstance from "./axios.config";
import { type Signin, type Signup , type AuthResponse,type User } from "@devdraw/shared";


const authApi = {
    signup: async (data:Signup) : Promise<AuthResponse> => {
        const response = await axiosInstance.post<AuthResponse>("/api/v1/auth/signup",data,{
            withCredentials:true
        });
        return response.data;
    },
    signin: async (data:Signin) : Promise<AuthResponse> => {
        const response = await axiosInstance.post<AuthResponse>("/api/v1/auth/signin",data,{
            withCredentials:true
        });
        return response.data;
    },
    refresh: async () : Promise<{ accessToken:string }> => {
        const response = await axiosInstance.post("/api/v1/auth/refresh-token");
        return response.data;
    },
    me: async (accessToken:string) : Promise<{user:User}> => {
        const response = await axiosInstance.get("/api/v1/auth/me",{
            headers:{Authorization:`Bearer ${accessToken}`},
        });
        return response.data;
    },
    logout: async () => axiosInstance.post("/api/v1/auth/logout"),
}

export default authApi;