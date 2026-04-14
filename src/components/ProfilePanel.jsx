import { useEffect, useState } from "react";
import { fetchProfile, getApiErrorMessage, updateProfile } from "../api/auth";
import defaultAvatar from "../assets/default-avatar.svg";
import LoadingSpinner from "./LoadingSpinner";

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "non_binary", label: "Non-binary" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

const initialForm = {
  first_name: "",
  last_name: "",
  email: "",
  birth_date: "",
  weight_kg: "",
  gender: "prefer_not_to_say",
};

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

export default function ProfilePanel({ onProfileChange }) {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [previewObjectUrl, setPreviewObjectUrl] = useState("");

  useEffect(() => {
    let isCancelled = false;

    const loadProfile = async () => {
      try {
        if (!isCancelled) {
          setLoading(true);
          setError("");
        }
        const profile = await fetchProfile();
        const remoteAvatar = profile.avatar_file_url || "";
        if (!isCancelled) {
          setForm({
            first_name: profile.first_name || "",
            last_name: profile.last_name || "",
            email: profile.email || "",
            birth_date: profile.birth_date || "",
            weight_kg: profile.weight_kg || "",
            gender: profile.gender || "prefer_not_to_say",
          });
          setAvatarPreview(remoteAvatar);
        }
      } catch (requestError) {
        if (!isCancelled) {
          setError(getApiErrorMessage(requestError, "Could not load profile."));
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (previewObjectUrl) {
        URL.revokeObjectURL(previewObjectUrl);
      }
    };
  }, [previewObjectUrl]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      let payload;
      const shouldReloadAfterSave = Boolean(avatarFile || removeAvatar);

      if (avatarFile) {
        const multipart = new FormData();
        multipart.append("first_name", form.first_name || "");
        multipart.append("last_name", form.last_name || "");
        multipart.append("email", form.email || "");
        multipart.append("gender", form.gender || "prefer_not_to_say");
        multipart.append("remove_avatar", "false");

        if (form.birth_date) {
          multipart.append("birth_date", form.birth_date);
        }

        if (form.weight_kg !== "") {
          multipart.append("weight_kg", form.weight_kg);
        }

        multipart.append("avatar", avatarFile);
        payload = multipart;
      } else {
        payload = {
          ...form,
          remove_avatar: removeAvatar,
          weight_kg: form.weight_kg === "" ? null : form.weight_kg,
          birth_date: form.birth_date || null,
        };
      }

      const updatedProfile = await updateProfile(payload);
      setSuccess("Profile updated successfully.");
      setAvatarFile(null);
      setRemoveAvatar(false);
      setAvatarPreview(updatedProfile.avatar_file_url || "");
      onProfileChange?.(updatedProfile);

      if (shouldReloadAfterSave) {
        window.location.reload();
      }
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Could not update profile."));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white/90 dark:bg-slate-900/80 dark:border-slate-700 p-6 shadow-sm">
        <LoadingSpinner label="Loading profile..." />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/90 dark:bg-slate-900/80 dark:border-slate-700 p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-5">Profile</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/60">
          <img
            src={avatarPreview || defaultAvatar}
            alt="Profile"
            className="w-20 h-20 rounded-full object-cover border border-slate-300 dark:border-slate-600"
          />

          <div className="flex-1 space-y-2">
            <div>
              <label className="block text-sm mb-1 text-slate-500 dark:text-slate-300">
                Upload photo (JPG, PNG, WEBP - max 2MB)
              </label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => {
                  setError("");
                  setSuccess("");
                  const file = event.target.files?.[0];
                  if (!file) {
                    setAvatarFile(null);
                    return;
                  }

                  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
                    setError("Avatar must be a JPG, PNG, or WEBP image.");
                    event.target.value = "";
                    return;
                  }

                  if (file.size > MAX_IMAGE_BYTES) {
                    setError("Avatar image must be 2MB or smaller.");
                    event.target.value = "";
                    return;
                  }

                  setAvatarFile(file);
                  setRemoveAvatar(false);
                  if (previewObjectUrl) {
                    URL.revokeObjectURL(previewObjectUrl);
                  }
                  const url = URL.createObjectURL(file);
                  setPreviewObjectUrl(url);
                  setAvatarPreview(url);
                }}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-2"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                setAvatarFile(null);
                setRemoveAvatar(true);
                setAvatarPreview("");
                if (previewObjectUrl) {
                  URL.revokeObjectURL(previewObjectUrl);
                  setPreviewObjectUrl("");
                }
              }}
              className="w-full sm:w-auto px-3 py-2 rounded-lg border border-red-300 text-red-600 dark:border-red-700 dark:text-red-400 text-sm hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer"
            >
              Remove current photo
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1 text-slate-500 dark:text-slate-300">
              First name
            </label>
            <input
              type="text"
              value={form.first_name}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, first_name: event.target.value }))
              }
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-2"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-slate-500 dark:text-slate-300">
              Last name
            </label>
            <input
              type="text"
              value={form.last_name}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, last_name: event.target.value }))
              }
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-2"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-slate-500 dark:text-slate-300">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, email: event.target.value }))
              }
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-2"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-slate-500 dark:text-slate-300">
              Birth date
            </label>
            <input
              type="date"
              value={form.birth_date}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, birth_date: event.target.value }))
              }
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-2"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-slate-500 dark:text-slate-300">
              Weight (kg)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.weight_kg}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, weight_kg: event.target.value }))
              }
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-2"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-slate-500 dark:text-slate-300">
              Gender
            </label>
            <select
              value={form.gender}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, gender: event.target.value }))
              }
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-2"
            >
              {GENDER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
        {success && <p className="text-sm text-green-600">{success}</p>}

        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-slate-900 text-white dark:bg-slate-200 dark:text-slate-900 hover:opacity-90 disabled:opacity-60 cursor-pointer"
          >
            {saving ? "Saving..." : "Save profile"}
          </button>
        </div>
      </form>
    </div>
  );
}
