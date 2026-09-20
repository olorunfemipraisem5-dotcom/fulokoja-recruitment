import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import api from "../../api/axios";
import AdminLayout from "../../components/AdminLayout";

const STATUS_ORDER = ["Submitted", "Under Review", "Shortlisted", "Rejected", "Accepted"];

export default function AdminDashboard() {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/jobs?all=true"), api.get("/applications")])
      .then(([jobsRes, appsRes]) => {
        setJobs(jobsRes.data);
        setApplications(appsRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const openJobs = jobs.filter((j) => j.status === "open").length;
  const counts = {
    Submitted: applications.filter((a) => a.status === "Submitted").length,
    "Under Review": applications.filter((a) => a.status === "Under Review").length,
    Shortlisted: applications.filter((a) => a.status === "Shortlisted").length,
    Accepted: applications.filter((a) => a.status === "Accepted").length,
  };

  const monthlyData = (() => {
    const buckets = {};
    applications.forEach((a) => {
      const d = new Date(a.createdAt);
      const key = d.toLocaleString("default", { month: "short", year: "2-digit" });
      buckets[key] = (buckets[key] || 0) + 1;
    });
    return Object.entries(buckets).map(([month, count]) => ({ month, count }));
  })();

  const statusData = STATUS_ORDER.map((status) => ({
    status,
    count: applications.filter((a) => a.status === status).length,
  }));

  const recentApplications = [...applications]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <AdminLayout title="Recruitment Overview">
      {loading ? (
        <p className="text-gray-600">Loading dashboard...</p>
      ) : (
        <>
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-gray-500">Federal University Lokoja — Recruitment Portal</p>
            <Link
              to="/admin/jobs"
              className="bg-university-green text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90"
            >
              + Create Vacancy
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard label="Open Vacancies" value={openJobs} color="bg-blue-50 text-university-green" icon="📋" />
            <StatCard label="Total Applications" value={applications.length} color="bg-purple-50 text-purple-600" icon="👥" />
            <StatCard label="Awaiting Review" value={counts.Submitted + counts["Under Review"]} color="bg-amber-50 text-amber-600" icon="👁️" />
            <StatCard label="Shortlisted" value={counts.Shortlisted} color="bg-pink-50 text-pink-600" icon="⭐" />
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white border rounded-xl p-5">
              <h2 className="font-semibold text-university-dark mb-4">Applications Over Time</h2>
              {monthlyData.length === 0 ? (
                <p className="text-sm text-gray-400">No applications yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" fontSize={12} />
                    <YAxis allowDecimals={false} fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#2563EB" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="bg-white border rounded-xl p-5">
              <h2 className="font-semibold text-university-dark mb-4">Application Status Distribution</h2>
              {applications.length === 0 ? (
                <p className="text-sm text-gray-400">No applications yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={statusData} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" allowDecimals={false} fontSize={12} />
                    <YAxis type="category" dataKey="status" fontSize={12} width={90} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#60A5FA" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="bg-white border rounded-xl p-5 mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-university-dark">Recent Applications</h2>
            </div>
            {recentApplications.length === 0 ? (
              <p className="text-sm text-gray-400">No applications submitted yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="py-2">Applicant</th>
                    <th className="py-2">Position</th>
                    <th className="py-2">Date</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentApplications.map((a) => (
                    <tr key={a._id} className="border-b last:border-0">
                      <td className="py-2">{a.applicant?.fullName}</td>
                      <td className="py-2">{a.job?.title}</td>
                      <td className="py-2 text-gray-500">{new Date(a.createdAt).toLocaleDateString()}</td>
                      <td className="py-2">{a.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <h2 className="font-semibold text-university-dark mb-3">Job Postings</h2>
          <div className="space-y-3">
            {jobs.map((job) => {
              const jobApps = applications.filter((a) => a.job?._id === job._id);
              return (
                <Link
                  to={`/admin/jobs/${job._id}/applications`}
                  key={job._id}
                  className="bg-white border rounded-lg p-4 flex items-center justify-between hover:shadow-sm"
                >
                  <div>
                    <p className="font-medium text-university-dark">{job.title}</p>
                    <p className="text-sm text-gray-500">
                      {job.department} · {job.status === "open" ? "Open" : "Closed"}
                    </p>
                  </div>
                  <span className="text-sm text-gray-600">{jobApps.length} applicant(s)</span>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </AdminLayout>
  );
}

function StatCard({ label, value, color, icon }) {
  return (
    <div className="bg-white border rounded-xl p-4 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-lg flex items-center justify-center text-lg ${color}`}>{icon}</div>
      <div>
        <p className="text-2xl font-bold text-university-dark">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}
