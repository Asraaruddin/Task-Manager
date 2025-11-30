// src/pages/Dashboard.jsx
import React, { useEffect, useRef, useState } from "react";
import API from "../api/api"; // your configured axios instance
import {
  FiEdit,
  FiTrash2,
  FiLogOut,
  FiSearch,
  FiUser,
  FiMail,
  FiCheckCircle,
  FiChevronDown,
  FiFilter,
} from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/**
 * Responsive Dashboard.jsx
 * - Mobile-first responsive layout (stacks on small screens, inline on md+)
 * - Priority selection + filter fixed
 * - Filter menu closes after selection (and when clicking outside)
 * - Profile menu toggle on click (stable)
 * - Save button is aligned, not floating (uses responsive layout)
 *
 * Requirements:
 * - Tailwind CSS available in the project
 * - API axios instance configured at ../api/api
 * - token in localStorage ("token") and user optionally in localStorage ("user")
 */

export default function Dashboard() {
  const token = localStorage.getItem("token") || "";
  const localUser = JSON.parse(localStorage.getItem("user") || "null");

  const [user, setUser] = useState(localUser);
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);

  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("Low"); // new task priority
  const [editingTask, setEditingTask] = useState(null);

  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState("All");
  const [filterDate, setFilterDate] = useState("");

  const [showPriorityMenu, setShowPriorityMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const [completedTasks, setCompletedTasks] = useState([]);

  // Refs for outside click detection
  const priorityRef = useRef(null);
  const filterRef = useRef(null);
  const profileRef = useRef(null);

  // ---------------------------
  // Fetch tasks (and optional profile)
  // ---------------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user && token) {
          try {
            const resProfile = await API.get("/auth/profile", {
              headers: { Authorization: `Bearer ${token}` },
            });
            setUser(resProfile.data);
            localStorage.setItem("user", JSON.stringify(resProfile.data));
          } catch {
            // ignore if profile endpoint not present
          }
        }

        const res = await API.get("/tasks", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.data || [];
        setTasks(data);
        setFilteredTasks(data);
        setCompletedTasks(data.filter((t) => t.completed));
      } catch (err) {
        console.error("Load tasks error:", err);
        toast.error("Failed to load tasks (backend offline?)");
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------
  // Outside click + Esc to close menus
  // ---------------------------
  useEffect(() => {
    const onDocClick = (e) => {
      if (priorityRef.current && !priorityRef.current.contains(e.target)) {
        setShowPriorityMenu(false);
      }
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setShowFilterMenu(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };

    const onEsc = (e) => {
      if (e.key === "Escape") {
        setShowPriorityMenu(false);
        setShowFilterMenu(false);
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  // ---------------------------
  // Search + Filter logic
  // ---------------------------
  useEffect(() => {
    let data = [...tasks];

    // search (title or description)
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(
        (t) =>
          (t.title || "").toLowerCase().includes(q) ||
          (t.description || "").toLowerCase().includes(q)
      );
    }

    // filterPriority
    if (filterPriority && filterPriority !== "All") {
      data = data.filter((t) => (t.priority || "Low") === filterPriority);
    }

    // filterDate (exact date match)
    if (filterDate) {
      data = data.filter((t) => {
        const d = t.createdAt ? new Date(t.createdAt) : new Date();
        const fd = new Date(filterDate);
        return (
          d.getFullYear() === fd.getFullYear() &&
          d.getMonth() === fd.getMonth() &&
          d.getDate() === fd.getDate()
        );
      });
    }

    setFilteredTasks(data);
  }, [tasks, search, filterPriority, filterDate]);

  // ---------------------------
  // Save (create or update)
  // ---------------------------
  const saveTask = async () => {
    if (!title.trim()) {
      toast.error("Task title required!");
      return;
    }

    const body = {
      title: title.trim(),
      description: editingTask ? editingTask.description : "",
      priority,
      createdAt: editingTask ? editingTask.createdAt || new Date() : new Date(),
    };

    try {
      let res;
      if (editingTask) {
        res = await API.put(`/tasks/${editingTask._id}`, body, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        res = await API.post("/tasks", body, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      const newTask = res.data;
      const updatedTasks = editingTask
        ? tasks.map((t) => (t._id === newTask._id ? newTask : t))
        : [...tasks, newTask];

      setTasks(updatedTasks);
      setCompletedTasks(updatedTasks.filter((t) => t.completed));
      setEditingTask(null);
      setTitle("");
      setPriority("Low");
      toast.success(editingTask ? "Task updated!" : "Task added!");
      setShowPriorityMenu(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save task");
    }
  };

  // ---------------------------
  // Delete
  // ---------------------------
  const deleteTask = async (id) => {
    try {
      await API.delete(`/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updated = tasks.filter((t) => t._id !== id);
      setTasks(updated);
      setCompletedTasks(updated.filter((t) => t.completed));
      toast.success("Task deleted");
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    }
  };

  // ---------------------------
  // Toggle complete
  // ---------------------------
  const toggleComplete = async (task) => {
    try {
      const res = await API.put(
        `/tasks/${task._id}`,
        { completed: !task.completed },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updated = tasks.map((t) => (t._id === task._id ? res.data : t));
      setTasks(updated);
      setCompletedTasks(updated.filter((t) => t.completed));
    } catch (err) {
      console.error(err);
      toast.error("Could not update task");
    }
  };

  // ---------------------------
  // Start editing
  // ---------------------------
  const startEdit = (task) => {
    setEditingTask(task);
    setTitle(task.title || "");
    setPriority(task.priority || "Low");
    setShowPriorityMenu(false);
    setShowFilterMenu(false);
  };

  // ---------------------------
  // Cancel editing
  // ---------------------------
  const cancelEdit = () => {
    setEditingTask(null);
    setTitle("");
    setPriority("Low");
  };

  // ---------------------------
  // Logout
  // ---------------------------
  const handleLogout = () => {
    localStorage.clear();
    toast.success("Logged out!");
    setTimeout(() => (window.location.href = "/"), 800);
  };

  // ---------------------------
  // helper: formatted date
  // ---------------------------
  const fmtDate = (d) => {
    try {
      return new Date(d).toLocaleDateString();
    } catch {
      return "";
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <ToastContainer position="top-center" />

      {/* NAVBAR */}
      <nav className="bg-white shadow px-4 md:px-6 py-3 md:py-4 flex flex-col md:flex-row md:justify-between md:items-center gap-3 md:gap-0">
        <div className="flex-1">
          <h1 className="text-xl md:text-2xl font-semibold text-gray-800">
            Welcome back, {user?.name ?? "User"}!
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {completedTasks.length} completed • {tasks.length} total
          </p>
        </div>

        {/* Profile - toggle on click */}
        <div className="relative mt-2 md:mt-0" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu((s) => !s)}
            className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg shadow-sm"
            aria-label="Profile"
          >
            {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
          </button>

          <div
            className={`absolute right-0 mt-3 transition-all duration-150 ${
              showProfileMenu ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2"
            } bg-white shadow-xl border rounded-xl w-56 p-3 z-50`}
          >
            <p className="flex items-center gap-2 text-gray-700 mb-1 text-sm">
              <FiUser /> <span className="font-medium">{user?.name ?? "-"}</span>
            </p>
            <p className="flex items-center gap-2 text-gray-700 mb-3 text-sm">
              <FiMail /> <span className="text-xs">{user?.email ?? "-"}</span>
            </p>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full justify-center border border-red-500 text-red-500 py-2 rounded-lg hover:bg-red-50"
            >
              <FiLogOut /> Logout
            </button>
          </div>
        </div>
      </nav>

      {/* MAIN */}
      <div className="max-w-5xl mx-auto mt-6 px-4 md:px-6 pb-12">
        {/* ADD / EDIT TASK */}
        <div className="bg-white p-4 md:p-5 rounded-xl shadow mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-800">
                {editingTask ? "Update Task" : "Add Task"}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Add a title, pick priority and save. On mobile these stack vertically.
              </p>
            </div>

            {editingTask && (
              <div className="self-start md:self-auto">
                <button onClick={cancelEdit} className="text-sm text-gray-500 hover:underline">
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* INPUT ROW - responsive */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            {/* Title - takes most space */}
            <div className="md:col-span-7">
              <input
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-200 outline-none"
                placeholder="Task title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Priority */}
            <div className="md:col-span-3 flex items-center">
              <div className="relative w-full" ref={priorityRef}>
                <button
                  onClick={() => setShowPriorityMenu((s) => !s)}
                  className="w-full px-4 py-2 bg-gray-100 rounded-lg flex items-center justify-between gap-2 border"
                  aria-haspopup="true"
                  aria-expanded={showPriorityMenu}
                >
                  <span className={priority === "High" ? "text-red-600" : "text-gray-800"}>
                    {priority}
                  </span>
                  <FiChevronDown />
                </button>

                {showPriorityMenu && (
                  <div className="absolute right-0 mt-2 bg-white shadow rounded-lg w-full z-40">
                    {["High", "Low"].map((p) => (
                      <div
                        key={p}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setPriority(p);
                          setShowPriorityMenu(false);
                        }}
                      >
                        {p}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Save button */}
            <div className="md:col-span-2">
              <button
                onClick={saveTask}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>

        {/* SEARCH + FILTERS */}
        <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
          <div className="flex items-center bg-gray-50 border rounded-lg px-3 py-2 flex-1">
            <FiSearch className="text-gray-500 mr-2" />
            <input
              className="w-full outline-none bg-transparent text-sm"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Unified filter button - anchored to right on md+ */}
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setShowFilterMenu((s) => !s)}
              className="border rounded-lg px-3 py-2 flex items-center gap-2 bg-white"
              aria-haspopup="true"
              aria-expanded={showFilterMenu}
            >
              <FiFilter /> <span className="hidden md:inline">Filters</span>
            </button>

            {showFilterMenu && (
              <div className="absolute right-0 mt-2 bg-white shadow-lg border rounded-lg w-64 p-4 z-40">
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select
                  className="w-full border rounded-lg px-3 py-2 mb-3 text-sm"
                  value={filterPriority}
                  onChange={(e) => {
                    setFilterPriority(e.target.value);
                    // close after selection for quick mobile UX
                    setShowFilterMenu(false);
                  }}
                >
                  <option value="All">All</option>
                  <option value="High">High</option>
                  <option value="Low">Low</option>
                </select>

                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  value={filterDate}
                  onChange={(e) => {
                    setFilterDate(e.target.value);
                    // leave open so user can pick apply/clear, but we allow auto-close if desired
                  }}
                />

                <div className="flex justify-end gap-2 mt-3">
                  <button
                    onClick={() => {
                      setFilterPriority("All");
                      setFilterDate("");
                      setShowFilterMenu(false);
                      toast.success("Filters cleared");
                    }}
                    className="px-3 py-1 text-sm border rounded"
                  >
                    Clear
                  </button>
                  <button onClick={() => setShowFilterMenu(false)} className="px-3 py-1 text-sm bg-blue-600 text-white rounded">
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* TASK LIST */}
        <h2 className="text-xl font-semibold mb-3">Tasks</h2>

        {filteredTasks.length === 0 ? (
          <p className="text-gray-500 text-center">No tasks found.</p>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <div key={task._id} className="bg-white border rounded-xl shadow p-4 flex flex-col md:flex-row justify-between items-start gap-3">
                <div className="flex items-start gap-3 w-full">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleComplete(task)}
                    className="mt-1 w-5 h-5"
                    aria-label="Mark complete"
                  />

                  <div className="flex-1">
                    <h3 className={`text-lg font-semibold ${task.completed ? "line-through text-gray-500" : ""}`}>
                      {task.title}
                    </h3>

                    <div className="flex gap-3 mt-2 items-center flex-wrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-lg ${
                          (task.priority || "Low") === "High" ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
                        }`}
                      >
                        {(task.priority || "Low")}
                      </span>

                      <span className="text-sm text-gray-600">{fmtDate(task.createdAt)}</span>

                      {task.description && <p className="text-sm text-gray-700 mt-2 md:mt-0">{task.description}</p>}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-2 md:mt-0">
                  <button
                    title="Edit"
                    onClick={() => startEdit(task)}
                    className="p-2 rounded-md hover:bg-gray-100"
                  >
                    <FiEdit className="text-blue-600" size={18} />
                  </button>

                  <button
                    title="Delete"
                    onClick={() => deleteTask(task._id)}
                    className="p-2 rounded-md hover:bg-gray-100"
                  >
                    <FiTrash2 className="text-red-600" size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* COMPLETED TASKS */}
        {completedTasks.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-semibold mb-3">Completed Tasks ({completedTasks.length})</h2>

            <div className="space-y-3">
              {completedTasks.map((t) => (
                <div key={t._id} className="bg-green-50 border border-green-300 rounded-lg p-4 flex items-center gap-3">
                  <FiCheckCircle className="text-green-600" size={20} />
                  <span className="line-through text-gray-600">{t.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
