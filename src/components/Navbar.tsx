import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { Menu, X, Sparkles, Tv, MapPin, Users } from "lucide-react";
import ThemeSwitcher from "./ThemeSwitcher";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
      isActive
        ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.15)]"
        : "text-theme-muted hover:text-theme border border-transparent bg-theme-hover"
    }`;

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-theme mb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <div className="flex-shrink-0 flex items-center">
            <Link
              to="/"
              className="flex items-center gap-2 group text-2xl font-extrabold tracking-tight text-theme"
            >
              <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-indigo-400 bg-clip-text text-transparent group-hover:from-indigo-400 group-hover:to-emerald-400 transition-all duration-500">
                Rick & Morty
              </span>
              <span className="text-xs uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 shadow-sm">
                <Sparkles className="w-3 h-3 text-indigo-400 animate-pulse" /> Wiki
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <NavLink to="/" className={navLinkClass}>
              <Users className="w-4 h-4" />
              Characters
            </NavLink>
            <NavLink to="/episodes" className={navLinkClass}>
              <Tv className="w-4 h-4" />
              Episodes
            </NavLink>
            <NavLink to="/location" className={navLinkClass}>
              <MapPin className="w-4 h-4" />
              Location
            </NavLink>
            <ThemeSwitcher />
          </div>

          <div className="flex md:hidden items-center gap-2">
            <ThemeSwitcher />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-theme-muted hover:text-theme bg-theme-hover focus:outline-none transition-colors"
              aria-expanded={isOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div
          className="md:hidden border-t border-theme backdrop-blur-xl"
          style={{ backgroundColor: "var(--mobile-nav-bg)" }}
        >
          <div className="px-2 pt-2 pb-4 space-y-1 sm:px-3">
            <NavLink
              to="/"
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                  isActive
                    ? "bg-indigo-600/20 text-indigo-400 border-l-4 border-indigo-500"
                    : "text-theme-muted hover:text-theme bg-theme-hover"
                }`
              }
            >
              <Users className="w-5 h-5" />
              Characters
            </NavLink>
            <NavLink
              to="/episodes"
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                  isActive
                    ? "bg-indigo-600/20 text-indigo-400 border-l-4 border-indigo-500"
                    : "text-theme-muted hover:text-theme bg-theme-hover"
                }`
              }
            >
              <Tv className="w-5 h-5" />
              Episodes
            </NavLink>
            <NavLink
              to="/location"
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                  isActive
                    ? "bg-indigo-600/20 text-indigo-400 border-l-4 border-indigo-500"
                    : "text-theme-muted hover:text-theme bg-theme-hover"
                }`
              }
            >
              <MapPin className="w-5 h-5" />
              Location
            </NavLink>
          </div>
        </div>
      )}
    </nav>
  );
}
