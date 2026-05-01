import { useEffect, useState } from "react";
import api from "../api/client";
import ErrorAlert from "../components/ErrorAlert";
import LoadingSpinner from "../components/LoadingSpinner";
import StatsCard from "../components/StatsCard";
import { apiBaseUrl } from "../config.js";


const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await api.get(`${apiBaseUrl}/tasks/dashboard/stats`);
        setStats(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Dashboard</h2>
      <ErrorAlert message={error} />
      {stats && (
        <div className="grid gap-4 md:grid-cols-3">
          <StatsCard label="Total Tasks" value={stats.totalTasks} />
          <StatsCard label="In Progress" value={stats.inProgressTasks} />
          <StatsCard label="Completed Tasks" value={stats.completedTasks} />
          <StatsCard label="Overdue Tasks" value={stats.overdueTasks} />
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
