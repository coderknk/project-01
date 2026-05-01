import { useEffect, useMemo, useState } from "react";
import api from "../api/client";
import ErrorAlert from "../components/ErrorAlert";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../context/AuthContext";

const statusOptions = ["todo", "in-progress", "done"];

const TasksPage = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ projectId: "", assignedTo: "", status: "" });
  const [form, setForm] = useState({
    title: "",
    description: "",
    assignedTo: "",
    projectId: "",
    status: "todo",
    dueDate: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.projectId) params.append("projectId", filters.projectId);
    if (filters.assignedTo && user?.role === "admin") params.append("assignedTo", filters.assignedTo);
    if (filters.status) params.append("status", filters.status);
    return params.toString();
  }, [filters, user?.role]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [taskRes, projectRes, userRes] = await Promise.all([
        api.get(`/tasks${queryString ? `?${queryString}` : ""}`),
        api.get("/projects"),
        api.get("/users"),
      ]);
      setTasks(taskRes.data);
      setProjects(projectRes.data);
      setUsers(userRes.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [queryString]);

  const createTask = async (e) => {
    e.preventDefault();
    try {
      await api.post("/tasks", form);
      setForm({
        title: "",
        description: "",
        assignedTo: "",
        projectId: "",
        status: "todo",
        dueDate: "",
      });
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create task");
    }
  };

  const updateStatus = async (taskId, status) => {
    try {
      await api.patch(`/tasks/${taskId}/status`, { status });
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status");
    }
  };

  const isOverdue = (task) => task.status !== "done" && new Date(task.dueDate) < new Date();

  if (loading) return <LoadingSpinner text="Loading tasks..." />;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Task Management</h2>
      <ErrorAlert message={error} />

      <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-3">
        <select
          className="rounded border border-slate-300 px-3 py-2"
          value={filters.projectId}
          onChange={(e) => setFilters((prev) => ({ ...prev, projectId: e.target.value }))}
        >
          <option value="">All Projects</option>
          {projects.map((project) => (
            <option key={project._id} value={project._id}>{project.name}</option>
          ))}
        </select>

        {user?.role === "admin" && (
          <select
            className="rounded border border-slate-300 px-3 py-2"
            value={filters.assignedTo}
            onChange={(e) => setFilters((prev) => ({ ...prev, assignedTo: e.target.value }))}
          >
            <option value="">All Users</option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>{u.name}</option>
            ))}
          </select>
        )}

        <select
          className="rounded border border-slate-300 px-3 py-2"
          value={filters.status}
          onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
        >
          <option value="">All Statuses</option>
          {statusOptions.map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>

      {user?.role === "admin" && (
        <form onSubmit={createTask} className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-2">
          <input className="rounded border border-slate-300 px-3 py-2" placeholder="Title" value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} required />
          <input className="rounded border border-slate-300 px-3 py-2" type="date" value={form.dueDate} onChange={(e) => setForm((prev) => ({ ...prev, dueDate: e.target.value }))} required />
          <textarea className="rounded border border-slate-300 px-3 py-2 md:col-span-2" placeholder="Description" value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} />
          <select className="rounded border border-slate-300 px-3 py-2" value={form.projectId} onChange={(e) => setForm((prev) => ({ ...prev, projectId: e.target.value }))} required>
            <option value="">Select Project</option>
            {projects.map((project) => <option key={project._id} value={project._id}>{project.name}</option>)}
          </select>
          <select className="rounded border border-slate-300 px-3 py-2" value={form.assignedTo} onChange={(e) => setForm((prev) => ({ ...prev, assignedTo: e.target.value }))} required>
            <option value="">Assign User</option>
            {users.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
          </select>
          <button className="rounded bg-slate-900 px-4 py-2 text-white md:col-span-2" type="submit">Create Task</button>
        </form>
      )}

      <div className="grid gap-3">
        {tasks.map((task) => (
          <div key={task._id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold">{task.title}</h3>
                <p className="text-sm text-slate-600">{task.description || "No description"}</p>
                <p className="text-xs text-slate-500">Project: {task.projectId?.name}</p>
                <p className="text-xs text-slate-500">Assigned to: {task.assignedTo?.name}</p>
                <p className={`text-xs ${isOverdue(task) ? "text-red-600" : "text-slate-500"}`}>
                  Due: {new Date(task.dueDate).toLocaleDateString()} {isOverdue(task) ? "(Overdue)" : ""}
                </p>
              </div>
              <select
                className="rounded border border-slate-300 px-2 py-1 text-sm"
                value={task.status}
                onChange={(e) => updateStatus(task._id, e.target.value)}
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TasksPage;
