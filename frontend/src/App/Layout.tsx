import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";

export default function Layout() {
    return (
        <div className="min-h-screen flex flex-col bg-bg">
            <Navbar />
            <main className = "flex-1 container mx-auto px-4 py-6">
                <Outlet />
            </main>

            <footer className="text-center bg-surface/80 z-50 backdrop-blur py-4 my-auto border-t border-white/10">
                <p>&copy; Vintage Resort {new Date().getFullYear()}</p>
            </footer>

        </div>
    )
}