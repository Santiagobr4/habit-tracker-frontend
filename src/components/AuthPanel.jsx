import { useState } from "react";
import { getApiErrorMessage, login, register } from "../api/auth";

const defaultLogin = {
  username: "",
  password: "",
};

const defaultRegister = {
  username: "",
  email: "",
  password: "",
};

export default function AuthPanel({ onAuthenticated }) {
  const [mode, setMode] = useState("login");
  const [loginForm, setLoginForm] = useState(defaultLogin);
  const [registerForm, setRegisterForm] = useState(defaultRegister);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const onLogin = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await login(loginForm);
      onAuthenticated();
      setLoginForm(defaultLogin);
    } catch (error) {
      setError(
        getApiErrorMessage(error, "Invalid credentials. Please try again."),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const onRegister = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await register(registerForm);
      await login({
        username: registerForm.username,
        password: registerForm.password,
      });
      onAuthenticated();
      setRegisterForm(defaultRegister);
    } catch (error) {
      setError(
        getApiErrorMessage(
          error,
          "Could not create account. Verify the fields and try again.",
        ),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md">
      <div className="flex gap-2 mb-6">
        <button
          type="button"
          onClick={() => {
            setMode("login");
            setError("");
          }}
          className={`px-4 py-2 rounded-lg cursor-pointer ${
            mode === "login"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 dark:bg-gray-700"
          }`}
        >
          Login
        </button>

        <button
          type="button"
          onClick={() => {
            setMode("register");
            setError("");
          }}
          className={`px-4 py-2 rounded-lg cursor-pointer ${
            mode === "register"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 dark:bg-gray-700"
          }`}
        >
          Register
        </button>
      </div>

      {mode === "login" ? (
        <form onSubmit={onLogin} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            required
            value={loginForm.username}
            onChange={(event) =>
              setLoginForm((prev) => ({
                ...prev,
                username: event.target.value,
              }))
            }
            className="w-full p-2 border rounded text-black dark:text-white dark:bg-gray-700"
          />

          <input
            type="password"
            placeholder="Password"
            required
            value={loginForm.password}
            onChange={(event) =>
              setLoginForm((prev) => ({
                ...prev,
                password: event.target.value,
              }))
            }
            className="w-full p-2 border rounded text-black dark:text-white dark:bg-gray-700"
          />

          <button
            type="submit"
            disabled={submitting}
            className="w-full px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 cursor-pointer"
          >
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
      ) : (
        <form onSubmit={onRegister} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            required
            value={registerForm.username}
            onChange={(event) =>
              setRegisterForm((prev) => ({
                ...prev,
                username: event.target.value,
              }))
            }
            className="w-full p-2 border rounded text-black dark:text-white dark:bg-gray-700"
          />

          <input
            type="email"
            placeholder="Email"
            required
            value={registerForm.email}
            onChange={(event) =>
              setRegisterForm((prev) => ({
                ...prev,
                email: event.target.value,
              }))
            }
            className="w-full p-2 border rounded text-black dark:text-white dark:bg-gray-700"
          />

          <input
            type="password"
            placeholder="Password"
            required
            minLength={8}
            value={registerForm.password}
            onChange={(event) =>
              setRegisterForm((prev) => ({
                ...prev,
                password: event.target.value,
              }))
            }
            className="w-full p-2 border rounded text-black dark:text-white dark:bg-gray-700"
          />

          <button
            type="submit"
            disabled={submitting}
            className="w-full px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 cursor-pointer"
          >
            {submitting ? "Creating account..." : "Create account"}
          </button>
        </form>
      )}

      {error && <p className="text-sm text-red-500 mt-4">{error}</p>}
    </div>
  );
}
