import { useContext, useEffect, useState, createContext} from "react";
import type { User } from "./api";
import { setAuthToken } from "./api";
import { Navigate, useLocation } from "react-router-dom";


export type AuthContextValue = {
    user: User | null
    token: string | null
    login: (u: User, token: string) => void
    logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)


export  function AuthProvider({ children }: { children: React.ReactNode}) {
    const [user, setUser] = useState<User | null>(() => { 
     const raw = localStorage.getItem("user")
     if (!raw || raw === "undefined" || raw === "null") return null
     try {
        return JSON.parse(raw) as User
     } catch (err) {
        console.warn("Failed to parse stored user:", err)
        localStorage.removeItem("user")
        return null
     }
     })
    
    const [token, setToken] = useState<string | null>(() => {
        const t = localStorage.getItem("token")
        return t && t.length > 0 ? t : null
    })

    useEffect(() => {
     setAuthToken(token ?? null) 
    }, [token])


   function login(u: User, t: string): void {
        setUser(u)
        setToken(t)
        localStorage.setItem("user", JSON.stringify(u))
        localStorage.setItem("token", t)
        setAuthToken(t)
    }
   
   function logout(): void {
        setUser(null)
        setToken(null)
        localStorage.removeItem("user")
        localStorage.removeItem("token")
        setAuthToken(null)
    }
  
    const value: AuthContextValue = { 
        user, 
        token, 
        login, 
        logout
        
    }
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    
}
  
    export function useAuth(): AuthContextValue {
        const contx = useContext(AuthContext)
        if(!contx){
          throw new Error("useAuth must be used within an AuthProvider")
        }
        
        return contx

        }

        
    export function RequireAuth({ children }: { children: React.ReactNode}){
        const { token }= useAuth()
        const location = useLocation()

        if(!token) {
            const redirect = encodeURIComponent(location.pathname + location.search)
        return  <Navigate to={`/login?redirect=${redirect}`} replace />
    }
        return <>{children}</>
}





