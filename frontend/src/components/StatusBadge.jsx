const statusStyles = {
  healthy: "border-emerald-200 bg-emerald-50 text-emerald-700",
  checking: "border-amber-200 bg-amber-50 text-amber-700",
  offline: "border-rose-200 bg-rose-50 text-rose-700",
};

export default function StatusBadge({ status }) {
  const label = status === "healthy" ? "API Online" : status === "checking" ? "Checking" : "API Offline";

  return (
    <span className={`whitespace-nowrap rounded-full border px-3 py-1 text-sm font-medium ${statusStyles[status]}`}>
      {label}
    </span>
  );
}

