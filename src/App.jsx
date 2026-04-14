import { Suspense, lazy, useEffect, useState } from "react";
import {
  clearAuthTokens,
  fetchProfile,
  getStoredAccessToken,
} from "./api/auth";
import AuthPanel from "./components/AuthPanel";
import SectionTabs from "./components/SectionTabs";
import WeeklyTable from "./components/WeeklyTable";

const HistoryPanel = lazy(() => import("./components/HistoryPanel"));
const ProfilePanel = lazy(() => import("./components/ProfilePanel"));

function App() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "system");
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!getStoredAccessToken(),
  );
  const [profile, setProfile] = useState(null);
  const [profileError, setProfileError] = useState("");
  const [section, setSection] = useState("tracker");

  useEffect(() => {
    const root = document.documentElement;

    if (theme === "dark") {
      root.classList.add("dark");
    } else if (theme === "light") {
      root.classList.remove("dark");
    } else {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.toggle("dark", isDark);
    }

    if (theme === "system") {
      localStorage.removeItem("theme");
    } else {
      localStorage.setItem("theme", theme);
    }
  }, [theme]);

  useEffect(() => {
    const loadProfile = async () => {
      if (!isAuthenticated) {
        setProfile(null);
        return;
      }

      try {
        setProfileError("");
        const user = await fetchProfile();
        setProfile(user);
      } catch {
        clearAuthTokens();
        setIsAuthenticated(false);
        setProfile(null);
        setProfileError("Session expired. Please sign in again.");
      }
    };

    loadProfile();
  }, [isAuthenticated]);

  const handleAuthenticated = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    clearAuthTokens();
    setIsAuthenticated(false);
    setProfile(null);
  };

  const themeButtonClass = (mode) => {
    const isSelected = theme === mode;
    return `px-3 py-2 rounded-xl cursor-pointer border transition ${
      isSelected
        ? "bg-slate-900 text-white border-slate-900 dark:bg-slate-200 dark:text-slate-900 dark:border-slate-200"
        : "bg-slate-100 dark:bg-slate-800 border-transparent"
    }`;
  };

  const displayName =
    profile?.first_name?.trim() || profile?.username || "User";
  const avatarSrc =
    profile?.avatar_file_url ||
    profile?.avatar_url ||
    "https://via.placeholder.com/48x48.png?text=U";

  const renderSection = () => {
    if (section === "history") {
      return (
        <Suspense fallback={<div>Loading section...</div>}>
          <HistoryPanel />
        </Suspense>
      );
    }

    if (section === "profile") {
      return (
        <Suspense fallback={<div>Loading section...</div>}>
          <ProfilePanel onProfileChange={setProfile} />
        </Suspense>
      );
    }

    return <WeeklyTable />;
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-100 to-slate-200 dark:from-slate-950 dark:to-slate-900 text-black dark:text-white p-4 md:p-6 transition">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 rounded-3xl border border-slate-200/80 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur p-5 shadow-sm">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">
                Habit Tracker
              </h1>
              <p className="text-slate-500 dark:text-slate-300 mt-1">
                Keep your routines consistent and measurable.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setTheme("light")}
                className={themeButtonClass("light")}
                aria-label="Light theme"
              >
                Light
              </button>

              <button
                onClick={() => setTheme("dark")}
                className={themeButtonClass("dark")}
                aria-label="Dark theme"
              >
                Dark
              </button>

              <button
                onClick={() => setTheme("system")}
                className={themeButtonClass("system")}
                aria-label="System theme"
              >
                System
              </button>
            </div>
          </div>
        </div>

        {profileError && <p className="mb-4 text-red-500">{profileError}</p>}

        {isAuthenticated ? (
          <>
            <div className="mb-4 flex items-center justify-between gap-2 rounded-2xl border border-slate-200/80 dark:border-slate-700 bg-white/90 dark:bg-slate-900/80 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <img
                  src={avatarSrc}
                  alt="User avatar"
                  className="w-12 h-12 rounded-full object-cover border border-slate-300 dark:border-slate-600"
                />

                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-300">
                    Signed in as
                  </p>
                  <p className="font-semibold">{displayName}</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="px-3 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 cursor-pointer"
              >
                Logout
              </button>
            </div>

            <SectionTabs current={section} onChange={setSection} />

            {renderSection()}
          </>
        ) : (
          <AuthPanel onAuthenticated={handleAuthenticated} />
        )}
      </div>
    </div>
  );
}

export default App;
