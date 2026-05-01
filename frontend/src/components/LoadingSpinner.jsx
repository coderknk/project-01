const LoadingSpinner = ({ text = "Loading..." }) => (
  <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
    {text}
  </div>
);

export default LoadingSpinner;
