import { useEffect, useState, useCallback, useRef } from "react";
import {
  getWeekly,
  getTrackerMetrics,
  updateLog,
  createHabit,
  updateHabit,
  deleteHabit,
} from "../api/habits";

const toLocalIsoDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getWeekStart = () => {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  now.setDate(now.getDate() + diffToMonday);
  return toLocalIsoDate(now);
};

export const useHabits = () => {
  const [data, setData] = useState([]);
  const [dates, setDates] = useState([]);
  const [trackerMetrics, setTrackerMetrics] = useState(null);
  const [startDate, setStartDate] = useState(getWeekStart());

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const firstLoadRef = useRef(true);

  const fetchData = useCallback(async () => {
    try {
      if (firstLoadRef.current) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      setError(null);

      const [res, metrics] = await Promise.all([
        getWeekly(startDate),
        getTrackerMetrics(startDate),
      ]);

      setData(res.habits || []);
      setTrackerMetrics(metrics);

      if (res.habits?.length > 0) {
        setDates(Object.keys(res.habits[0].week));
      } else {
        setDates([]);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to load data");
    } finally {
      setLoading(false);
      setRefreshing(false);
      firstLoadRef.current = false;
    }
  }, [startDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const changeWeek = (dir) => {
    const d = new Date(`${startDate}T00:00:00`);
    const currentWeekStart = getWeekStart();

    if (dir > 0 && startDate >= currentWeekStart) {
      return;
    }

    d.setDate(d.getDate() + dir * 7);
    setStartDate(toLocalIsoDate(d));
  };

  const goToCurrentWeek = () => {
    setStartDate(getWeekStart());
  };

  const canGoNext = startDate < getWeekStart();

  const toggleStatus = (current) => {
    if (current === "pending") return "done";
    if (current === "done") return "missed";
    return "pending";
  };

  const parseApiError = (err, fallback) => {
    const data = err?.response?.data;
    if (!data) return fallback;

    if (typeof data.detail === "string") return data.detail;
    if (Array.isArray(data.status)) return data.status.join(" ");
    if (Array.isArray(data.date)) return data.date.join(" ");
    if (Array.isArray(data.days)) return data.days.join(" ");
    if (Array.isArray(data.name)) return data.name.join(" ");

    return fallback;
  };

  const isFutureDate = (value) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(`${value}T00:00:00`);
    return selected > today;
  };

  const isTodayDate = (value) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(`${value}T00:00:00`);
    return selected.getTime() === today.getTime();
  };

  const handleUpdate = async (habitId, date, currentStatus) => {
    if (currentStatus === "skip") {
      return { success: true };
    }

    try {
      const newStatus = toggleStatus(currentStatus);

      if (!isTodayDate(date)) {
        return {
          success: false,
          type: "error",
          message: "You can only update logs for today.",
        };
      }

      if (newStatus === "done" && isFutureDate(date)) {
        return {
          success: false,
          type: "error",
          message: "You cannot mark a habit as done before that date.",
        };
      }

      await updateLog(habitId, date, newStatus);
      await fetchData();

      return { success: true };
    } catch (err) {
      console.error("Update error:", err);
      return {
        success: false,
        type: "error",
        message: parseApiError(err, "Could not update habit status."),
      };
    }
  };

  const handleCreate = async (habit) => {
    try {
      await createHabit(habit);
      await fetchData();
      return { success: true };
    } catch (err) {
      console.error("Create error:", err);
      return {
        success: false,
        message: parseApiError(err, "Could not create habit."),
      };
    }
  };

  const handleEdit = async (id, habit) => {
    try {
      await updateHabit(id, habit);
      await fetchData();
      return { success: true };
    } catch (err) {
      console.error("Edit error:", err);
      return {
        success: false,
        message: parseApiError(err, "Could not update habit."),
      };
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteHabit(id);
      await fetchData();
      return { success: true };
    } catch (err) {
      console.error("Delete error:", err);
      return { success: false };
    }
  };

  return {
    data,
    dates,
    trackerMetrics,
    startDate,
    loading,
    refreshing,
    error,
    canGoNext,

    changeWeek,
    goToCurrentWeek,

    handleUpdate,
    handleCreate,
    handleEdit,
    handleDelete,
  };
};
