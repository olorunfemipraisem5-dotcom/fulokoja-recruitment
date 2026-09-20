import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Logo from "./Logo";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: "🏠" },
  { to: "/jobs", label: "Browse Vacancies", icon: "🔍" },
  { to: "/my-applications", label: "My Applications", icon: "📄" },
  { to: "/profile", label: "Profile", icon: "👤" },
];

export default function ApplicantLayout({ children, title, headerAction }) {
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
      <aside className="w-64 bg-white border-r flex-shrink-0 hidden md:flex md:flex-col">
        <div className="flex items-center gap-2 px-5 py-5 border-b">
          <Logo size={36} />
          <p className="font-semibold text-university-dark">FULokoja Portal</p>
        </div>
        <nav className="flex-1 py-4">
          {NAV_ITEMS.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-5 py-2.5 text-sm ${
                  active
                    ? "bg-university-green/10 text-university-green font-medium border-r-2 border-university-green"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t">
          <p className="text-sm font-medium text-university-dark">{user?.fullName}</p>
          <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-600 mt-2 flex items-center gap-2">
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 bg-gray-50">
        {title && (
          <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
            <h1 className="text-xl font-bold text-university-dark">{title}</h1>
            {headerAction}
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
