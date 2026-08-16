import { useNavigate } from "react-router-dom";
import authApi from "../../api/auth.api";
import { useAuth } from "../../context/auth.context";

export const Home = () =>{
      const {user,clearAuth} = useAuth();
      const navigate = useNavigate()
      
    
    const logout = async() =>{
        await authApi.logout();
        clearAuth();
        navigate("/");
    }

    return(
        <div className="text-2xl bg-amber-300 items-center ">Welocome{user?.name}
        <div className="h-5 w-10 bg-red-400 " onClick={logout}></div>
        </div>
    )
}