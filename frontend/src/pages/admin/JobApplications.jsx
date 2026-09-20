import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axios";
import StatusBadge from "../../components/StatusBadge";
import AdminLayout from "../../components/AdminLayout";

const STATUS_OPTIONS = ["Submitted", "Under Review", "Shortlisted", "Rejected", "Accepted"];

export default function JobApplications() {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  const load = () => {
    Promise.all([api.get(`/jobs/${jobId}`), api.get(`/applications?jobId=${jobId}`)])
      .then(([jobRes, appsRes]) => {
        setJob(jobRes.data);
        setApplications(appsRes.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, [jobId]);

  const handleStatusChange = async (appId, status) => {
    setSavingId(appId);
    try {
      await api.put(`/applications/${appId}/status`, { status });
      setApplications((prev) => prev.map((a) => (a._id === appId ? { ...a, status } : a)));
    } finally {
      setSavingId(null);
    }
  };

  const handleDownload = async (appId, type) => {
    const res = await api.get(`/applications/${appId}/document/${type}`, { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${type}-${appId}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <AdminLayout title={job ? `Applicants: ${job.title}` : "Applicants"}>
      <div className="max-w-5xl">
        {loading && <p className="text-gray-600">Loading...</p>}
        {!loading && applications.length === 0 && (
          <p className="text-gray-600">No applications received for this posting yet.</p>
        )}

        <div className="space-y-4">
          {applications.map((app) => (
            <div key={app._id} className="bg-white border rounded-xl p-5">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <p className="font-semibold text-university-dark">{app.applicant?.fullName}</p>
                  <p className="text-sm text-gray-500">{app.applicant?.email}</p>
                  {app.applicant?.phone && <p className="text-sm text-gray-500">{app.applicant.phone}</p>}
                  <p className="text-xs text-gray-400 mt-1">
                    Submitted {new Date(app.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <StatusBadge status={app.status} />
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-4">
                <button
                  onClick={() => handleDownload(app._id, "cv")}
                  className="text-sm border px-3 py-1.5 rounded-lg text-university-green font-medium"
                >
                  Download CV
                </button>
                <button
                  onClick={() => handleDownload(app._id, "coverLetter")}
                  className="text-sm border px-3 py-1.5 rounded-lg text-university-green font-medium"
                >
                  Download Cover Letter
                </button>

                <select
                  value={app.status}
                  disabled={savingId === app._id}
                  onChange={(e) => handleStatusChange(app._id, e.target.value)}
                  className="text-sm border rounded-lg px-3 py-1.5 ml-auto"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
