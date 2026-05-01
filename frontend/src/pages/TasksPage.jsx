import { useEffect, useMemo, useState } from "react";
import api from "../api/client";
import ErrorAlert from "../components/ErrorAlert";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../context/AuthContext";
import { apiBaseUrl } from "../config";

const statusOptions = ["todo", "in-progress", "done"];
const priorityOptions = ["low", "medium", "high"];

const TasksPage = ({ view = "team" }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ teamId: "", assigneeId: "", status: "", priority: "" });
  const [form, setForm] = useState({
    title: "",
    description: "",
    assigneeId: "",
    teamId: "",
    status: "todo",
    priority: "medium",
    dueDate: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.append("view", view);
    if (filters.teamId) params.append("teamId", filters.teamId);
    if (filters.assigneeId && user?.role === "admin") params.append("assigneeId", filters.assigneeId);
    if (filters.status) params.append("status", filters.status);
    if (filters.priority) params.append("priority", filters.priority);
    return params.toString();
  }, [filters, user?.role, view]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [taskRes, teamRes, userRes] = await Promise.all([
        api.get(`${apiBaseUrl}/tasks${queryString ? `?${queryString}` : ""}`),
        api.get(`${apiBaseUrl}/teams`),
        api.get(`${apiBaseUrl}/users`),
      ]);
      setTasks(taskRes.data.data.tasks);
      setTeams(teamRes.data.data.teams);
      setUsers(userRes.data.data.users);
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
      await api.post(`${apiBaseUrl}/tasks`, form);
      setForm({
        title: "",
        description: "",
        assigneeId: "",
        teamId: "",
        status: "todo",
        priority: "medium",
        dueDate: "",
      });
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create task");
    }
  };

  const updateStatus = async (taskId, status) => {
    try {
      await api.patch(`${apiBaseUrl}/tasks/${taskId}`, { status });
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status");
    }
  };

  const isOverdue = (task) => task.status !== "done" && new Date(task.dueDate) < new Date();

  if (loading) return <LoadingSpinner text="Loading tasks..." />;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">{view === "mine" ? "My Tasks" : "Team Tasks"}</h2>
      <ErrorAlert message={error} />

      <div className="grid gap-3 p-4 bg-white rounded-lg border-slate-200 shadow-sm border md:grid-cols-4">
        <select
          className="px-3 py-2 border-slate-300 rounded border"
          value={filters.teamId}
          onChange={(e) => setFilters((prev) => ({ ...prev, teamId: e.target.value }))}
        >
          <option value="">All Teams</option>
          {teams.map((team) => (
            <option key={team._id} value={team._id}>{team.name}</option>
          ))}
        </select>

        {user?.role === "admin" && (
          <select
            className="px-3 py-2 border-slate-300 rounded border"
            value={filters.assigneeId}
            onChange={(e) => setFilters((prev) => ({ ...prev, assigneeId: e.target.value }))}
          >
            <option value="">All Users</option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>{u.name}</option>
            ))}
          </select>
        )}

        <select
          className="px-3 py-2 border-slate-300 rounded border"
          value={filters.status}
          onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
        >
          <option value="">All Statuses</option>
          {statusOptions.map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>

        <select
          className="px-3 py-2 border-slate-300 rounded border"
          value={filters.priority}
          onChange={(e) => setFilters((prev) => ({ ...prev, priority: e.target.value }))}
        >
          <option value="">All Priorities</option>
          {priorityOptions.map((priority) => (
            <option key={priority} value={priority}>{priority}</option>
          ))}
        </select>
      </div>

      {user?.role === "admin" && (
        <form onSubmit={createTask} className="grid gap-3 p-4 bg-white rounded-lg border-slate-200 shadow-sm border md:grid-cols-2">
          <input className="px-3 py-2 border-slate-300 rounded border" placeholder="Title" value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} required />
          <input className="px-3 py-2 border-slate-300 rounded border" type="date" value={form.dueDate} onChange={(e) => setForm((prev) => ({ ...prev, dueDate: e.target.value }))} required />
          <textarea className="px-3 py-2 border-slate-300 rounded border md:col-span-2" placeholder="Description" value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} />
          <select className="px-3 py-2 border-slate-300 rounded border" value={form.teamId} onChange={(e) => setForm((prev) => ({ ...prev, teamId: e.target.value }))} required>
            <option value="">Select Team</option>
            {teams.map((team) => <option key={team._id} value={team._id}>{team.name}</option>)}
          </select>
          <select className="px-3 py-2 border-slate-300 rounded border" value={form.assigneeId} onChange={(e) => setForm((prev) => ({ ...prev, assigneeId: e.target.value }))} required>
            <option value="">Assign User</option>
            {users.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
          </select>
          <select className="px-3 py-2 border-slate-300 rounded border md:col-span-2" value={form.priority} onChange={(e) => setForm((prev) => ({ ...prev, priority: e.target.value }))}>
            {priorityOptions.map((priority) => <option key={priority} value={priority}>{priority}</option>)}
          </select>
          <button className="px-4 py-2 text-white bg-slate-900 rounded md:col-span-2" type="submit">Create Task</button>
        </form>
      )}

      <div className="grid gap-3">
        {tasks.map((task) => (
          <div key={task._id} className="p-4 bg-white rounded-lg border-slate-200 shadow-sm border">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold">{task.title}</h3>
                <p className="text-sm text-slate-600">{task.description || "No description"}</p>
                <p className="text-xs text-slate-500">Team: {task.teamId?.name}</p>
                <p className="text-xs text-slate-500">Assigned to: {task.assigneeId?.name}</p>
                <p className="text-xs text-slate-500">Priority: {task.priority}</p>
                <p className={`text-xs ${isOverdue(task) ? "text-red-600" : "text-slate-500"}`}>
                  Due: {new Date(task.dueDate).toLocaleDateString()} {isOverdue(task) ? "(Overdue)" : ""}
                </p>
              </div>
              <select
                className="px-2 py-1 text-sm border-slate-300 rounded border"
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
