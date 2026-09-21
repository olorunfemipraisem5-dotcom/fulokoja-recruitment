import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Download, ClipboardList, Trophy } from "lucide-react";
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
  const [scoringId, setScoringId] = useState(null); // which applicant's score panel is open
  const [scoreDrafts, setScoreDrafts] = useState({}); // { appId: { EQ: 8, WE: 7, ... } }
  const [savingScoreId, setSavingScoreId] = useState(null);

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

  const openScoring = (app) => {
    setScoringId(scoringId === app._id ? null : app._id);
    if (!scoreDrafts[app._id]) {
      const initial = {};
      (job?.criteria || []).forEach((c) => {
        initial[c.code] = app.scores?.[c.code] ?? "";
      });
      setScoreDrafts((prev) => ({ ...prev, [app._id]: initial }));
    }
  };

  const updateDraft = (appId, code, value) => {
    setScoreDrafts((prev) => ({
      ...prev,
      [appId]: { ...prev[appId], [code]: value },
    }));
  };

  const handleSaveScores = async (appId) => {
    setSavingScoreId(appId);
    try {
      const draft = scoreDrafts[appId] || {};
      const scores = {};
      Object.entries(draft).forEach(([code, val]) => {
        scores[code] = Number(val) || 0;
      });
      const { data } = await api.put(`/applications/${appId}/scores`, { scores });
      setApplications((prev) =>
        prev.map((a) => (a._id === appId ? { ...a, scores: data.scores, weightedScore: data.weightedScore } : a))
      );
      setScoringId(null);
    } finally {
      setSavingScoreId(null);
    }
  };

  return (
    <AdminLayout title={job ? `Applicants: ${job.title}` : "Applicants"}>
      <div className="max-w-5xl">
        <div className="flex flex-wrap gap-2 mb-5">
          <Link
            to={`/admin/jobs/${jobId}/pairwise`}
            className="text-sm border px-3 py-1.5 rounded-lg text-university-green font-medium flex items-center gap-1.5"
          >
            <ClipboardList size={14} /> Pairwise Comparison (Set Criteria Weights)
          </Link>
          <Link
            to={`/admin/jobs/${jobId}/ranking`}
            className="text-sm border px-3 py-1.5 rounded-lg text-university-green font-medium flex items-center gap-1.5"
          >
            <Trophy size={14} /> View Applicant Ranking
          </Link>
        </div>

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
                  {app.weightedScore != null && (
                    <p className="text-xs text-university-green font-medium mt-1">
                      AHP Score: {app.weightedScore.toFixed(3)}
                    </p>
                  )}
                </div>
                <StatusBadge status={app.status} />
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-4">
                <button
                  onClick={() => handleDownload(app._id, "cv")}
                  className="text-sm border px-3 py-1.5 rounded-lg text-university-green font-medium flex items-center gap-1.5"
                >
                  <Download size={14} /> CV
                </button>
                <button
                  onClick={() => handleDownload(app._id, "coverLetter")}
                  className="text-sm border px-3 py-1.5 rounded-lg text-university-green font-medium flex items-center gap-1.5"
                >
                  <Download size={14} /> Cover Letter
                </button>
                <button
                  onClick={() => openScoring(app)}
                  className="text-sm border px-3 py-1.5 rounded-lg text-university-green font-medium"
                >
                  {scoringId === app._id ? "Close Scoring" : "Score Applicant"}
                </button>

                <select
                  value={app.status}
                  disabled={savingId === app._id}
                  onChange={(e) => handleStatusChange(app._id, e.target.value)}
                  className="text-sm border rounded-lg px-3 py-1.5 sm:ml-auto w-full sm:w-auto"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {scoringId === app._id && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm font-medium text-university-dark mb-3">
                    Score this applicant (1-10) against each criterion:
                  </p>
                  <div className="grid sm:grid-cols-3 gap-3 mb-4">
                    {(job?.criteria || []).map((c) => (
                      <div key={c.code}>
                        <label className="text-xs text-gray-500 block mb-1">
                          {c.name} ({c.code})
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={scoreDrafts[app._id]?.[c.code] ?? ""}
                          onChange={(e) => updateDraft(app._id, c.code, e.target.value)}
                          className="w-full border rounded-lg px-2 py-1.5 text-sm"
                        />
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => handleSaveScores(app._id)}
                    disabled={savingScoreId === app._id}
                    className="bg-university-green text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-60"
                  >
                    {savingScoreId === app._id ? "Saving..." : "Save Scores"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
