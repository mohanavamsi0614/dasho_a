import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

function Layout() {
    return (
        <div className="flex min-h-screen bg-[#030712] text-white">
            <Sidebar />
            <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden transition-all duration-300">
                <main className="flex-1 w-full bg-[#030712]">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
export default Layout