import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, Briefcase, LayoutDashboard, FileText, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Logo from "./Logo";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/");
  };

  const close = () => setMenuOpen(false);

  return (
    <header className="bg-university-green text-white shadow relative z-30">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-semibold text-lg" onClick={close}>
          <Logo size={32} />
          <span className="hidden sm:inline">FULokoja Recruitment Portal</span>
          <span className="sm:hidden">FULokoja</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-4 text-sm">
          <Link to="/jobs" className="hover:text-university-gold">
            Vacancies
          </Link>

          {!user && (
            <>
              <Link to="/login" className="hover:text-university-gold">
                Login
              </Link>
              <Link
                to="/register"
                className="bg-university-gold text-university-dark px-3 py-1.5 rounded font-medium hover:opacity-90"
              >
                Register
              </Link>
            </>
          )}

          {user && user.role === "applicant" && (
            <>
              <Link to="/dashboard" className="hover:text-university-gold">
                Dashboard
              </Link>
              <Link to="/my-applications" className="hover:text-university-gold">
                My Applications
              </Link>
              <Link to="/profile" className="hover:text-university-gold">
                Profile
              </Link>
              <span className="text-white/80">Hi, {user.fullName.split(" ")[0]}</span>
              <button onClick={handleLogout} className="hover:text-university-gold">
                Logout
              </button>
            </>
          )}

          {user && user.role === "admin" && (
            <>
              <Link to="/admin" className="hover:text-university-gold">
                Admin Dashboard
              </Link>
              <Link to="/profile" className="hover:text-university-gold">
                Profile
              </Link>
              <button onClick={handleLogout} className="hover:text-university-gold">
                Logout
              </button>
            </>
          )}
        </nav>

        {/* Mobile hamburger button */}
        <button
          className="md:hidden p-1"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          {menuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <nav className="md:hidden bg-university-dark text-white px-4 py-3 space-y-1 shadow-lg">
          <Link to="/jobs" onClick={close} className="flex items-center gap-2 py-2 text-sm">
            <Briefcase size={18} /> Vacancies
          </Link>

          {!user && (
            <>
              <Link to="/login" onClick={close} className="block py-2 text-sm">
                Login
              </Link>
              <Link to="/register" onClick={close} className="block py-2 text-sm font-medium text-university-gold">
                Register
              </Link>
            </>
          )}

          {user && user.role === "applicant" && (
            <>
              <Link to="/dashboard" onClick={close} className="flex items-center gap-2 py-2 text-sm">
                <LayoutDashboard size={18} /> Dashboard
              </Link>
              <Link to="/my-applications" onClick={close} className="flex items-center gap-2 py-2 text-sm">
                <FileText size={18} /> My Applications
              </Link>
              <Link to="/profile" onClick={close} className="flex items-center gap-2 py-2 text-sm">
                <User size={18} /> Profile
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-2 py-2 text-sm w-full text-left">
                <LogOut size={18} /> Logout
              </button>
            </>
          )}

          {user && user.role === "admin" && (
            <>
              <Link to="/admin" onClick={close} className="flex items-center gap-2 py-2 text-sm">
                <LayoutDashboard size={18} /> Admin Dashboard
              </Link>
              <Link to="/profile" onClick={close} className="flex items-center gap-2 py-2 text-sm">
                <User size={18} /> Profile
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-2 py-2 text-sm w-full text-left">
                <LogOut size={18} /> Logout
              </button>
            </>
          )}
        </nav>
      )}
    </header>
  );
}
