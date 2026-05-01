import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [theme, setTheme] = useState(() => localStorage.getItem("ethara_theme") || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("ethara_theme", theme);
  }, [theme]);

  const navLinks = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/teams", label: "Teams" },
    { to: "/tasks", label: "Team Tasks" },
    { to: "/my-tasks", label: "My Tasks" },
  ];

  return (
    <header className="border-b border-slate-200/60 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div>
          <h1 className="text-lg font-bold tracking-wide text-slate-900">ETHARA.AI</h1>
          <p className="text-xs text-slate-500">Logged in as {user?.role}</p>
        </div>
        <nav className="flex items-center gap-3">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`rounded px-3 py-1 text-sm ${
                location.pathname === link.to
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <button
            type="button"
            onClick={() => setTheme((prev) => (prev === "light" ? "dark" : "light"))}
            className="rounded border border-slate-300 px-3 py-1 text-sm text-slate-700 hover:bg-slate-100"
          >
            {theme === "light" ? "Dark" : "Light"}
          </button>
          <button
            type="button"
            onClick={logout}
            className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
          >
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
