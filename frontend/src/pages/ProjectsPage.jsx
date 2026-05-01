import { useEffect, useState } from "react";
import api from "../api/client";
import ErrorAlert from "../components/ErrorAlert";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../context/AuthContext";

const ProjectsPage = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", description: "", teamMembers: [] });

  const loadData = async () => {
    try {
      setLoading(true);
      const [projectRes, userRes] = await Promise.all([
        api.get("/projects"),
        api.get("/users"),
      ]);
      setProjects(projectRes.data);
      setUsers(userRes.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post("/projects", form);
      setForm({ name: "", description: "", teamMembers: [] });
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create project");
    }
  };

  const handleMemberChange = (e) => {
    const values = Array.from(e.target.selectedOptions).map((option) => option.value);
    setForm((prev) => ({ ...prev, teamMembers: values }));
  };

  const removeProject = async (id) => {
    try {
      await api.delete(`/projects/${id}`);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete project");
    }
  };

  if (loading) return <LoadingSpinner text="Loading projects..." />;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Projects</h2>
      <ErrorAlert message={error} />

      {user?.role === "admin" && (
        <form onSubmit={handleCreate} className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="font-semibold">Create Project</h3>
          <input
            className="w-full rounded border border-slate-300 px-3 py-2"
            placeholder="Project name"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            required
          />
          <textarea
            className="w-full rounded border border-slate-300 px-3 py-2"
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
          />
          <select multiple className="w-full rounded border border-slate-300 px-3 py-2" onChange={handleMemberChange}>
            {users.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name} ({u.role})
              </option>
            ))}
          </select>
          <button className="rounded bg-slate-900 px-4 py-2 text-white" type="submit">
            Create Project
          </button>
        </form>
      )}

      <div className="grid gap-3">
        {projects.map((project) => (
          <div key={project._id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold">{project.name}</h3>
                <p className="text-sm text-slate-600">{project.description || "No description"}</p>
                <p className="mt-2 text-xs text-slate-500">
                  Team: {project.teamMembers?.map((m) => m.name).join(", ") || "No members"}
                </p>
              </div>
              {user?.role === "admin" && (
                <button
                  onClick={() => removeProject(project._id)}
                  className="rounded bg-red-600 px-3 py-1 text-sm text-white"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectsPage;
