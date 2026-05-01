import { useEffect, useState } from "react";
import api from "../api/client";
import ErrorAlert from "../components/ErrorAlert";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../context/AuthContext";

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
        api.get("/teams"),
        api.get("/users"),
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
      await api.post("/teams", form);
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
      await api.post(`/teams/${teamId}/members`, { userId: selectedUserId, memberRole: "member" });
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
        <form onSubmit={handleCreate} className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="font-semibold">Create Team</h3>
          <input
            className="w-full rounded border border-slate-300 px-3 py-2"
            placeholder="Team name"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            required
          />
          <button className="rounded bg-slate-900 px-4 py-2 text-white" type="submit">
            Create Team
          </button>
        </form>
      )}

      <div className="grid gap-3">
        {teams.map((team) => (
          <div key={team._id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">{team.name}</h3>
                <p className="mt-2 text-xs text-slate-500">Members</p>
                <div className="mt-1 flex flex-wrap gap-2">
                  {team.members?.map((member) => (
                    <span key={member._id} className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700">
                      {member.userId?.name} ({member.memberRole})
                    </span>
                  ))}
                </div>
              </div>
              {user?.role === "admin" && (
                <div className="flex min-w-56 flex-col gap-2">
                  <select
                    className="rounded border border-slate-300 px-3 py-2"
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
                    className="rounded bg-slate-900 px-3 py-1 text-sm text-white"
                  >
                    Add member
                  </button>
                  {team.members?.map((member) => (
                    <button
                      key={member._id}
                      type="button"
                      onClick={() => removeMember(team._id, member.userId?._id)}
                      className="rounded bg-red-600 px-3 py-1 text-xs text-white"
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
