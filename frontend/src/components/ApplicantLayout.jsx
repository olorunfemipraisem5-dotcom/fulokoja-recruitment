import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Search, FileText, User, LogOut, Menu } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Logo from "./Logo";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/jobs", label: "Browse Vacancies", icon: Search },
  { to: "/my-applications", label: "My Applications", icon: FileText },
  { to: "/profile", label: "Profile", icon: User },
];

export default function ApplicantLayout({ children, title, headerAction }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const SidebarContent = (
    <>
      <div className="flex items-center gap-2 px-5 py-5 border-b">
        <Logo size={36} />
        <p className="font-semibold text-university-dark">FULokoja Portal</p>
      </div>
      <nav className="flex-1 py-4">
        {NAV_ITEMS.map((item) => {
          const active = location.pathname === item.to;
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-5 py-2.5 text-sm ${
                active
                  ? "bg-university-green/10 text-university-green font-medium border-r-2 border-university-green"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t">
        <p className="text-sm font-medium text-university-dark">{user?.fullName}</p>
        <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-600 mt-2 flex items-center gap-2">
          <LogOut size={16} /> Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      {/* Desktop sidebar */}
      <aside className="w-64 bg-white border-r flex-shrink-0 hidden md:flex md:flex-col">
        {SidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white flex flex-col">{SidebarContent}</aside>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 bg-gray-50 min-w-0">
        {title && (
          <div className="bg-white border-b px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button
                className="md:hidden p-1 -ml-1 text-university-dark flex-shrink-0"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
              >
                <Menu size={24} />
              </button>
              <h1 className="text-lg sm:text-xl font-bold text-university-dark truncate">{title}</h1>
            </div>
            {headerAction && <div className="flex-shrink-0">{headerAction}</div>}
          </div>
        )}
        <div className="p-4 sm:p-6">{children}</div>
      </div>
    </div>
  );
}
