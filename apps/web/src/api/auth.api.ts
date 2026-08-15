import axiosInstance from "./axios.config";
import type { Signin, Signup , AuthResponse } from "@devdraw/shared";


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
    }
}

export default authApi;