import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import ApplicantLayout from "../components/ApplicantLayout";
import StatusBadge from "../components/StatusBadge";

export default function ApplicantDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/applications/mine")
      .then((res) => setApplications(res.data))
      .finally(() => setLoading(false));
  }, []);

  const counts = {
    total: applications.length,
    underReview: applications.filter((a) => a.status === "Under Review").length,
    shortlisted: applications.filter((a) => a.status === "Shortlisted").length,
    accepted: applications.filter((a) => a.status === "Accepted").length,
  };

  // Simple profile completeness based on the fields we actually collect
  const profileFields = [user?.fullName, user?.email, user?.phone];
  const filledFields = profileFields.filter(Boolean).length;
  const profileCompletion = Math.round((filledFields / profileFields.length) * 100);

  // Notifications derived from real application status/history (no separate notifications system yet)
  const notifications = [...applications]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 4)
    .map((a) => ({
      id: a._id,
      text:
        a.status === "Submitted"
          ? `Your application for ${a.job?.title} has been received.`
          : `Your application for ${a.job?.title} is now "${a.status}".`,
      date: a.updatedAt,
    }));

  const recentApplications = [...applications]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <ApplicantLayout
      title={`Welcome back, ${user?.fullName?.split(" ")[0] || ""}`}
      headerAction={
        <button
          onClick={() => navigate("/jobs")}
          className="bg-university-green text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90"
        >
          Browse Vacancies
        </button>
      }
    >
      {loading ? (
        <p className="text-gray-600">Loading your dashboard...</p>
      ) : (
        <>
          {/* Profile completion */}
          <div className="bg-white border rounded-xl p-5 mb-6">
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium text-university-dark">Profile Completion</p>
              <span className="text-sm font-semibold text-university-green">{profileCompletion}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
              <div
                className="bg-university-green h-2 rounded-full transition-all"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">Complete your profile to improve your application quality.</p>
              <button onClick={() => navigate("/profile")} className="text-xs font-medium text-university-green">
                Complete Profile
              </button>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard label="Applications Submitted" value={counts.total} color="bg-blue-50 text-university-green" icon="📄" />
            <StatCard label="Under Review" value={counts.underReview} color="bg-amber-50 text-amber-600" icon="👁️" />
            <StatCard label="Shortlisted" value={counts.shortlisted} color="bg-pink-50 text-pink-600" icon="⭐" />
            <StatCard label="Accepted" value={counts.accepted} color="bg-green-50 text-green-600" icon="✅" />
          </div>

          {/* Recent applications */}
          <div className="bg-white border rounded-xl p-5 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-university-dark">Recent Applications</h2>
              <button onClick={() => navigate("/my-applications")} className="text-xs font-medium text-university-green">
                View all
              </button>
            </div>
            {recentApplications.length === 0 ? (
              <p className="text-sm text-gray-400">You haven't applied to any positions yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="py-2">Position</th>
                    <th className="py-2">Date Applied</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentApplications.map((a) => (
                    <tr key={a._id} className="border-b last:border-0">
                      <td className="py-2">{a.job?.title}</td>
                      <td className="py-2 text-gray-500">{new Date(a.createdAt).toLocaleDateString()}</td>
                      <td className="py-2">
                        <StatusBadge status={a.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Notifications */}
          <div className="bg-white border rounded-xl p-5">
            <h2 className="font-semibold text-university-dark mb-3">Recent Notifications</h2>
            {notifications.length === 0 ? (
              <p className="text-sm text-gray-400">No notifications yet.</p>
            ) : (
              <ul className="space-y-3">
                {notifications.map((n) => (
                  <li key={n.id} className="text-sm border-b last:border-0 pb-3 last:pb-0">
                    <p className="text-gray-700">{n.text}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{new Date(n.date).toLocaleString()}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </ApplicantLayout>
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
