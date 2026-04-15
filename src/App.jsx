import { Suspense, lazy, useEffect, useState } from "react";
import {
  clearAuthTokens,
  fetchProfile,
  getStoredAccessToken,
} from "./api/auth";
import AuthPanel from "./components/AuthPanel";
import LoadingSpinner from "./components/LoadingSpinner";
import SectionTabs from "./components/SectionTabs";
import WeeklyTable from "./components/WeeklyTable";
import defaultAvatar from "./assets/default-avatar.svg";

const HistoryPanel = lazy(() => import("./components/HistoryPanel"));
const RankingPanel = lazy(() => import("./components/RankingPanel"));
const ProfilePanel = lazy(() => import("./components/ProfilePanel"));

function App() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "system");
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!getStoredAccessToken(),
  );
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
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
    let isCancelled = false;

    const loadProfile = async () => {
      if (!isAuthenticated) {
        if (!isCancelled) {
          setProfile(null);
        }
        return;
      }

      try {
        if (!isCancelled) {
          setProfileError("");
        }
        const user = await fetchProfile();
        if (!isCancelled) {
          setProfile(user);
        }
      } catch {
        if (!isCancelled) {
          clearAuthTokens();
          setIsAuthenticated(false);
          setProfile(null);
          setProfileError("Session expired. Please sign in again.");
        }
      }
    };

    loadProfile();

    return () => {
      isCancelled = true;
    };
  }, [isAuthenticated]);

  const handleAuthenticated = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    clearAuthTokens();
    setIsAuthenticated(false);
    setProfile(null);
    setShowLogoutConfirm(false);
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
  const avatarSrc = profile?.avatar_file_url || defaultAvatar;
  const todayLabel = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "long",
    day: "numeric",
  }).format(new Date());

  const renderSection = () => {
    if (section === "history") {
      return (
        <Suspense fallback={<LoadingSpinner label="Loading section..." />}>
          <HistoryPanel />
        </Suspense>
      );
    }

    if (section === "profile") {
      return (
        <Suspense fallback={<LoadingSpinner label="Loading section..." />}>
          <ProfilePanel onProfileChange={setProfile} />
        </Suspense>
      );
    }

    if (section === "ranking") {
      return (
        <Suspense fallback={<LoadingSpinner label="Loading section..." />}>
          <RankingPanel />
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

              <div className="flex items-center gap-3">
                <p className="text-sm text-slate-500 dark:text-slate-300">
                  {todayLabel}
                </p>
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="px-3 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 cursor-pointer"
                >
                  Logout
                </button>
              </div>
            </div>

            <SectionTabs current={section} onChange={setSection} />

            <div key={section} className="fade-in">
              {renderSection()}
            </div>

            {showLogoutConfirm && (
              <div className="fixed inset-0 bg-slate-900/45 backdrop-blur-sm flex items-center justify-center z-50 px-3">
                <div className="w-full max-w-sm rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-xl">
                  <h3 className="text-lg font-semibold">Confirm logout</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-300 mt-2">
                    Are you sure you want to close your session?
                  </p>
                  <div className="mt-5 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowLogoutConfirm(false)}
                      className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="px-3 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 cursor-pointer"
                    >
                      Yes, logout
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <AuthPanel onAuthenticated={handleAuthenticated} />
        )}
      </div>
    </div>
  );
}

export default App;
