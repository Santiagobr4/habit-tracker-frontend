import api from "./index";

export const getWeekly = async (date) => {
  const res = await api.get(`/habits/weekly/?start_date=${date}`);
  return res.data;
};

export const getHistory = async ({ days = 90 } = {}) => {
  const res = await api.get(`/habits/history/?days=${days}`);
  return res.data;
};

export const getTrackerMetrics = async (startDate) => {
  const query = startDate ? `?start_date=${startDate}` : "";
  const res = await api.get(`/habits/tracker-metrics/${query}`);
  return res.data;
};

export const getLeaderboard = async () => {
  const res = await api.get("/habits/leaderboard/");
  return res.data;
};

export const updateLog = async (habitId, date, status) => {
  await api.post("/logs/", { habit: habitId, date, status });
};

export const createHabit = async (habit) => {
  await api.post("/habits/", habit);
};

export const updateHabit = async (id, data) => {
  await api.patch(`/habits/${id}/`, data);
};

export const deleteHabit = async (id) => {
  await api.delete(`/habits/${id}/`);
};
