import { NavLink } from "react-router-dom";
import { LayoutDashboard, CheckSquare, CreditCard, RefreshCw, Menu, X, Home, BrainIcon, icons, QrCodeIcon } from "lucide-react";
import { useState } from "react";
import path from "path";

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(false);

    const navItems = [
        { path: ".", label: "event", icon: Home, end: true },
        { path: "dashboard", label: "Dashboard", icon: Home },
        { path: "attd", label: "Attendance", icon: CheckSquare },
        { path: "marks", label: "Marks", icon: LayoutDashboard },
        { path: "payment", label: "Payment", icon: CreditCard },
        { path: "update", label: "Update", icon: RefreshCw },
        { path: "problem-statements", label: "Problem Statement", icon: BrainIcon },
        { path: 'scanner', label: "Scanner", icon: QrCodeIcon }
    ];

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-gray-900/50 backdrop-blur-md rounded-lg text-white hover:bg-gray-800/50 transition-colors border border-white/10"
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <aside className={`
                fixed top-0 left-0 z-40 h-screen w-64
                bg-[#0a0a0a]/80 backdrop-blur-xl border-r border-white/10
                transition-transform duration-300 ease-in-out
                flex flex-col
                lg:translate-x-0 lg:static lg:h-screen
                ${isOpen ? "translate-x-0" : "-translate-x-full"}
            `}>
                {/* Logo / Header */}
                <div className="h-16 flex items-center px-6 border-b border-white/10">
                    <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        Event Admin
                    </span>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 py-6 px-3 space-y-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.end}
                            onClick={() => setIsOpen(false)}
                            className={({ isActive }) => `
                                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                                ${isActive
                                    ? "bg-blue-600/20 text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]"
                                    : "text-gray-400 hover:text-gray-100 hover:bg-white/5"
                                }
                            `}
                        >
                            <item.icon size={18} />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                {/* Footer or extra details */}
                <div className="p-4 border-t border-white/10">
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                            A
                        </div>
                        <div className="flex flex-col">
                            <span className="text-gray-300 font-medium">Admin User</span>
                            <span className="text-xs">Event Manager</span>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
