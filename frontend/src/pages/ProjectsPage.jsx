import { useEffect, useState } from "react";
import api from "../api/client";
import ErrorAlert from "../components/ErrorAlert";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../context/AuthContext";
import { apiBaseUrl } from "../config.js";

const ProjectsPage = () => {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "" });
  const [memberForm, setMemberForm] = useState({});

  const loadData = async () => {
    try {
      setLoading(true);
      const [teamRes, userRes] = await Promise.all([
        api.get(`${apiBaseUrl}/teams`),
        api.get(`${apiBaseUrl}/users`),
      ]);
      setTeams(teamRes.data.data.teams);
      setUsers(userRes.data.data.users);
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
      await api.post(`${apiBaseUrl}/teams`, form);
      setForm({ name: "" });
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create project");
    }
  };

  const addMember = async (teamId) => {
    try {
      const selectedUserId = memberForm[teamId];
      if (!selectedUserId) return;
      await api.post(`${apiBaseUrl}/teams/${teamId}/members`, { userId: selectedUserId, memberRole: "member" });
      setMemberForm((prev) => ({ ...prev, [teamId]: "" }));
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add member");
    }
  };

  const removeMember = async (teamId, userId) => {
    try {
      await api.delete(`/teams/${teamId}/members/${userId}`);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove member");
    }
  };

  if (loading) return <LoadingSpinner text="Loading projects..." />;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Teams</h2>
      <ErrorAlert message={error} />

      {user?.role === "admin" && (
        <form onSubmit={handleCreate} className="p-4 bg-white rounded-lg border-slate-200 shadow-sm space-y-3 border">
          <h3 className="font-semibold">Create Team</h3>
          <input
            className="px-3 py-2 w-full border-slate-300 rounded border"
            placeholder="Team name"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            required
          />
          <button className="px-4 py-2 text-white bg-slate-900 rounded" type="submit">
            Create Team
          </button>
        </form>
      )}

      <div className="grid gap-3">
        {teams.map((team) => (
          <div key={team._id} className="p-4 bg-white rounded-lg border-slate-200 shadow-sm border">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">{team.name}</h3>
                <p className="mt-2 text-xs text-slate-500">Members</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {team.members?.map((member) => (
                    <span key={member._id} className="px-2 py-1 text-xs text-slate-700 bg-slate-100 rounded-full">
                      {member.userId?.name} ({member.memberRole})
                    </span>
                  ))}
                </div>
              </div>
              {user?.role === "admin" && (
                <div className="flex flex-col gap-2 min-w-56">
                  <select
                    className="px-3 py-2 border-slate-300 rounded border"
                    value={memberForm[team._id] || ""}
                    onChange={(e) => setMemberForm((prev) => ({ ...prev, [team._id]: e.target.value }))}
                  >
                    <option value="">Select user to add</option>
                    {users.map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => addMember(team._id)}
                    className="px-3 py-1 text-sm text-white bg-slate-900 rounded"
                  >
                    Add member
                  </button>
                  {team.members?.map((member) => (
                    <button
                      key={member._id}
                      type="button"
                      onClick={() => removeMember(team._id, member.userId?._id)}
                      className="px-3 py-1 text-xs text-white bg-red-600 rounded"
                    >
                      Remove {member.userId?.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectsPage;
