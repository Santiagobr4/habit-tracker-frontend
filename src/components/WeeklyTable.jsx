import { useState } from "react";
import { useHabits } from "../hooks/useHabits";
import HabitRow from "./HabitRow";
import HabitModal from "./HabitModal";
import ConfirmDialog from "./ConfirmDialog";
import TrackerInsights from "./TrackerInsights";
import Toast from "./Toast";

export default function WeeklyTable() {
  const {
    data,
    dates,
    trackerMetrics,
    loading,
    error,
    changeWeek,
    handleUpdate,
    handleCreate,
    handleEdit,
    handleDelete,
  } = useHabits();

  const [showModal, setShowModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [toast, setToast] = useState(null);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white/90 dark:bg-slate-900/80 dark:border-slate-700 p-6 shadow-sm">
        Loading habits...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 text-red-500 dark:bg-red-950/40 dark:border-red-700 p-6 shadow-sm">
        {error}
      </div>
    );
  }

  const handleSubmit = async (habitData) => {
    let res;

    if (editingHabit) {
      res = await handleEdit(editingHabit.habit_id, habitData);
      if (res.success) {
        setToast({ message: "Habit updated successfully", type: "success" });
      } else {
        setToast({
          message: res.message || "Could not update habit",
          type: "error",
        });
      }
    } else {
      res = await handleCreate(habitData);
      if (res.success) {
        setToast({ message: "Habit created successfully", type: "success" });
      } else {
        setToast({
          message: res.message || "Could not create habit",
          type: "error",
        });
      }
    }

    if (res?.success) {
      setShowModal(false);
      setEditingHabit(null);
    }

    return res;
  };

  const confirmDelete = async () => {
    const res = await handleDelete(deleteId);

    if (res.success) {
      setToast({ message: "Habit deleted", type: "success" });
    }

    setDeleteId(null);
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/90 dark:bg-slate-900/80 dark:border-slate-700 p-6 shadow-sm">
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <h2 className="text-xl font-semibold">Weekly tracking</h2>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setEditingHabit(null);
              setShowModal(true);
            }}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-slate-200 dark:text-slate-900 hover:opacity-90 cursor-pointer"
          >
            New habit
          </button>

          <div className="flex items-center gap-1 rounded-xl border border-slate-300 dark:border-slate-600 p-1 bg-slate-100/70 dark:bg-slate-800/70">
            <button
              onClick={() => changeWeek(-1)}
              className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
            >
              ←
            </button>

            <button
              onClick={() => changeWeek(1)}
              className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
            >
              →
            </button>
          </div>
        </div>
      </div>

      <table className="w-full text-center border-separate border-spacing-y-2">
        <thead>
          <tr>
            <th className="text-left px-3 py-2 min-w-52 text-slate-500 text-sm font-medium">
              Habit
            </th>

            {dates.map((d) => (
              <th
                key={d}
                className="w-12 cursor-default text-slate-500 text-sm font-medium py-2"
              >
                {d.slice(5)}
              </th>
            ))}

            <th className="text-slate-500 text-sm font-medium">Streak</th>
            <th className="text-slate-500 text-sm font-medium">Actions</th>
          </tr>
        </thead>

        <tbody>
          {data.map((habit) => (
            <HabitRow
              key={habit.habit_id}
              habit={habit}
              dates={dates}
              onUpdate={async (...args) => {
                const result = await handleUpdate(...args);
                if (!result?.success) {
                  setToast({
                    message: result?.message || "Could not update habit status",
                    type: result?.type || "error",
                  });
                }
              }}
              onEdit={(h) => {
                setEditingHabit(h);
                setShowModal(true);
              }}
              onDelete={(h) => setDeleteId(h.habit_id)}
            />
          ))}
        </tbody>
      </table>

      {(showModal || editingHabit) && (
        <HabitModal
          key={`${editingHabit?.habit_id ?? "new"}-${showModal ? "open" : "closed"}`}
          open={showModal || !!editingHabit}
          onClose={() => {
            setShowModal(false);
            setEditingHabit(null);
          }}
          onSubmit={handleSubmit}
          initialData={editingHabit}
        />
      )}

      <ConfirmDialog
        open={!!deleteId}
        text="Are you sure you want to delete this habit?"
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
      />

      <Toast
        message={toast?.message}
        type={toast?.type}
        onClose={() => setToast(null)}
      />

      <TrackerInsights metrics={trackerMetrics} />
    </div>
  );
}
