import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Trophy, SlidersHorizontal } from "lucide-react";
import api from "../../api/axios";
import AdminLayout from "../../components/AdminLayout";

const DECISION_COLORS = {
  Recommended: "bg-green-100 text-green-700",
  Considered: "bg-amber-100 text-amber-800",
  "Not Recommended": "bg-red-100 text-red-700",
};

export default function RankingDashboard() {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [criteria, setCriteria] = useState([]);
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showSensitivity, setShowSensitivity] = useState(false);
  const [adjustedWeights, setAdjustedWeights] = useState([]);
  const [sensitivityResult, setSensitivityResult] = useState(null);
  const [runningSensitivity, setRunningSensitivity] = useState(false);
  const [baseWeights, setBaseWeights] = useState([]);

  const load = () => {
    Promise.all([api.get(`/jobs/${jobId}`), api.get(`/ahp/${jobId}/ranking`), api.get(`/ahp/${jobId}/matrix`)])
      .then(([jobRes, rankingRes, matrixRes]) => {
        setJob(jobRes.data);
        setCriteria(rankingRes.data.criteria);
        setRanking(rankingRes.data.ranking);
        if (matrixRes.data.result) {
          setBaseWeights(matrixRes.data.result.weights);
          setAdjustedWeights(matrixRes.data.result.weights);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, [jobId]);

  const handleRunSensitivity = async () => {
    setRunningSensitivity(true);
    try {
      const { data } = await api.post(`/ahp/${jobId}/sensitivity`, { adjustedWeights });
      setSensitivityResult(data.comparison);
    } finally {
      setRunningSensitivity(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Applicant Ranking">
        <p className="text-gray-600">Loading...</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={job ? `Applicant Ranking: ${job.title}` : "Applicant Ranking"}>
      <div className="max-w-5xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link to={`/admin/jobs/${jobId}/applications`} className="text-sm text-university-green font-medium">
            &larr; Back to Applicants
          </Link>
          <div className="flex gap-2">
            <Link
              to={`/admin/jobs/${jobId}/pairwise`}
              className="text-sm border px-3 py-1.5 rounded-lg text-university-green font-medium"
            >
              Edit Criteria Weights
            </Link>
            <button
              onClick={() => setShowSensitivity((v) => !v)}
              className="text-sm border px-3 py-1.5 rounded-lg text-university-green font-medium flex items-center gap-1.5"
            >
              <SlidersHorizontal size={14} /> Sensitivity Analysis
            </button>
          </div>
        </div>

        {ranking.length === 0 ? (
          <div className="bg-white border rounded-xl p-6 text-sm text-gray-500">
            No applicants have been scored yet for this vacancy. Score applicants from the Applicants page
            first, then return here to see the ranking.
          </div>
        ) : (
          <div className="bg-white border rounded-xl p-5">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="py-2">Rank</th>
                    <th className="py-2">Applicant</th>
                    {criteria.map((c) => (
                      <th key={c.code} className="py-2">{c.code}</th>
                    ))}
                    <th className="py-2">Weighted Score</th>
                    <th className="py-2">Decision</th>
                  </tr>
                </thead>
                <tbody>
                  {ranking.map((r, index) => (
                    <tr key={r._id} className="border-b last:border-0">
                      <td className="py-2 font-medium">
                        {index === 0 ? (
                          <span className="flex items-center gap-1 text-amber-500">
                            <Trophy size={14} /> 1
                          </span>
                        ) : (
                          index + 1
                        )}
                      </td>
                      <td className="py-2">{r.applicant?.fullName}</td>
                      {criteria.map((c) => (
                        <td key={c.code} className="py-2 text-gray-500">{r.scores[c.code] ?? "-"}</td>
                      ))}
                      <td className="py-2 font-semibold">{r.weightedScore?.toFixed(3)}</td>
                      <td className="py-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${DECISION_COLORS[r.decision] || ""}`}>
                          {r.decision}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {showSensitivity && (
          <div className="bg-white border rounded-xl p-5">
            <h2 className="font-semibold text-university-dark mb-1">Sensitivity Analysis</h2>
            <p className="text-sm text-gray-500 mb-4">
              Adjust a criterion's weight below to see how the ranking would change. This does not save —
              it only simulates the effect of different priorities.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mb-5">
              {criteria.map((c, i) => (
                <div key={c.code}>
                  <label className="text-sm text-gray-700 flex justify-between mb-1">
                    <span>{c.name} ({c.code})</span>
                    <span className="font-medium">{(adjustedWeights[i] * 100).toFixed(1)}%</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={adjustedWeights[i] || 0}
                    onChange={(e) => {
                      const next = [...adjustedWeights];
                      next[i] = parseFloat(e.target.value);
                      setAdjustedWeights(next);
                    }}
                    className="w-full"
                  />
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 items-center mb-5">
              <button
                onClick={handleRunSensitivity}
                disabled={runningSensitivity}
                className="bg-university-green text-white px-5 py-2.5 rounded-lg font-medium hover:opacity-90 disabled:opacity-60"
              >
                {runningSensitivity ? "Running..." : "Run Sensitivity Analysis"}
              </button>
              <button
                onClick={() => setAdjustedWeights(baseWeights)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Reset to original weights
              </button>
            </div>

            {sensitivityResult && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[600px]">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="py-2">Applicant</th>
                      <th className="py-2">Original Rank</th>
                      <th className="py-2">Original Score</th>
                      <th className="py-2">Adjusted Rank</th>
                      <th className="py-2">Adjusted Score</th>
                      <th className="py-2">Rank Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sensitivityResult.map((row) => (
                      <tr key={row.name} className="border-b last:border-0">
                        <td className="py-2">{row.name}</td>
                        <td className="py-2">{row.originalRank}</td>
                        <td className="py-2">{row.originalScore?.toFixed(3)}</td>
                        <td className="py-2">{row.adjustedRank}</td>
                        <td className="py-2">{row.adjustedScore?.toFixed(3)}</td>
                        <td className="py-2 text-gray-500">{row.rankChange}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
