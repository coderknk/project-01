const StatsCard = ({ label, value }) => (
  <div className="rounded-lg bg-white p-4 shadow-sm border border-slate-200">
    <p className="text-sm text-slate-500">{label}</p>
    <p className="mt-2 text-2xl font-semibold text-slate-800">{value}</p>
  </div>
);

export default StatsCard;
