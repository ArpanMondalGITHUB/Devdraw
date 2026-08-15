import { useAuth } from "../../context/auth.context";

export const Home = () =>{
      const {user} = useAuth();
    
    return(
        <div className="text-2xl text-red-400 ">Welocome{user?.name}
        </div>
    )
}