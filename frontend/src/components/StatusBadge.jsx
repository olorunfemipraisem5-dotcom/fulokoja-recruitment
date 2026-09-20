const COLORS = {
  Submitted: "bg-gray-100 text-gray-700",
  "Under Review": "bg-blue-100 text-blue-700",
  Shortlisted: "bg-amber-100 text-amber-800",
  Accepted: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-700",
};

export default function StatusBadge({ status }) {
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${COLORS[status] || "bg-gray-100 text-gray-700"}`}>
      {status}
    </span>
  );
}
