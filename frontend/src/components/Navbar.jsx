import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Logo from "./Logo";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="bg-university-green text-white shadow">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-semibold text-lg">
          <Logo size={32} />
          FULokoja Recruitment Portal
        </Link>

        <nav className="flex items-center gap-4 text-sm">
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
      </div>
    </header>
  );
}
