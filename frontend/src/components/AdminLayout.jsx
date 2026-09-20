import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Logo from "./Logo";

const NAV_ITEMS = [
  { to: "/admin", label: "Dashboard", icon: "🏠" },
  { to: "/admin/jobs", label: "Vacancies", icon: "📋" },
  { to: "/profile", label: "Profile", icon: "👤" },
];

export default function AdminLayout({ children, title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      {/* Sidebar */}
      <aside className="w-64 bg-university-dark text-white flex-shrink-0 hidden md:flex md:flex-col">
        <div className="flex items-center gap-2 px-5 py-5 border-b border-white/10">
          <Logo size={36} />
          <div>
            <p className="font-semibold leading-tight">FUL Admin</p>
            <p className="text-xs text-white/50 leading-tight">Recruitment System</p>
          </div>
        </div>
        <nav className="flex-1 py-4">
          {NAV_ITEMS.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-5 py-2.5 text-sm ${
                  active ? "bg-university-green text-white" : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-white/10">
          <p className="text-sm font-medium">{user?.fullName}</p>
          <p className="text-xs text-white/50 mb-3">Recruitment Officer</p>
          <button
            onClick={handleLogout}
            className="text-sm text-white/70 hover:text-white flex items-center gap-2"
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 bg-gray-50">
        {title && (
          <div className="bg-white border-b px-6 py-4">
            <h1 className="text-xl font-bold text-university-dark">{title}</h1>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
