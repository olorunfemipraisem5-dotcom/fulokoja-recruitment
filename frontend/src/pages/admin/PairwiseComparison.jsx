import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import api from "../../api/axios";
import AdminLayout from "../../components/AdminLayout";

const SAATY_STRENGTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

const getPairValue = (direction, strength) => {
  if (direction === "equal") return 1;
  return direction === "first" ? strength : 1 / strength;
};

const getPairState = (value) => {
  if (value === 1) return { direction: "equal", strength: 1 };
  if (value > 1) return { direction: "first", strength: Math.round(value) };
  return { direction: "second", strength: Math.round(1 / value) };
};

export default function PairwiseComparison() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [criteria, setCriteria] = useState([]);
  const [matrix, setMatrix] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.get(`/jobs/${jobId}`), api.get(`/ahp/${jobId}/matrix`)])
      .then(([jobRes, matrixRes]) => {
        setJob(jobRes.data);
        const c = matrixRes.data.criteria;
        setCriteria(c);
        if (matrixRes.data.matrix) {
          setMatrix(matrixRes.data.matrix);
          setResult(matrixRes.data.result);
        } else {
          // Initialize an identity matrix (all 1s = "equally important") as a starting point
          setMatrix(c.map((_, i) => c.map((__, j) => (i === j ? 1 : 1))));
        }
      })
      .finally(() => setLoading(false));
  }, [jobId]);

  const updateCell = (i, j, value) => {
    const newMatrix = matrix.map((row) => [...row]);
    newMatrix[i][j] = value;
    newMatrix[j][i] = 1 / value; // reciprocal, enforced automatically
    setMatrix(newMatrix);
  };

  const handleCompute = async () => {
    setError("");
    setSaving(true);
    try {
      const { data } = await api.post(`/ahp/${jobId}/matrix`, { matrix });
      setResult({
        weights: data.weights,
        lambdaMax: data.lambdaMax,
        CI: data.CI,
        RI: data.RI,
        CR: data.CR,
        consistent: data.consistent,
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to compute weights.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Pairwise Comparison">
        <p className="text-gray-600">Loading...</p>
      </AdminLayout>
    );
  }

  const chartData = result
    ? criteria.map((c, i) => ({ name: c.name, weight: result.weights[i] }))
    : [];

  return (
    <AdminLayout title={job ? `Pairwise Comparison: ${job.title}` : "Pairwise Comparison"}>
      <div className="w-full max-w-6xl space-y-4 sm:space-y-6">
        <Link to={`/admin/jobs/${jobId}/applications`} className="text-sm text-university-green font-medium">
          &larr; Back to Applicants
        </Link>

        <div className="bg-white border rounded-xl p-3 sm:p-5 overflow-hidden">
          <h2 className="font-semibold text-university-dark mb-1">Criteria for this vacancy</h2>
          <p className="text-sm text-gray-500 mb-4">
            Compare each pair of criteria using Saaty's 1-9 scale: how much more important is the row
            criterion than the column criterion? The reciprocal is filled in automatically.
          </p>

          {error && <div className="bg-red-50 text-red-700 text-sm p-3 rounded mb-4">{error}</div>}

          {/* Compact pairwise cards: only unique comparisons are shown. */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {criteria.map((rowCrit, i) =>
              criteria.map((colCrit, j) => {
                if (i >= j) return null;
                return (
                  <div
                    key={`${rowCrit.code}-${colCrit.code}`}
                    className="border border-gray-200 rounded-lg p-3 sm:p-4 bg-gray-50/50"
                  >
                    <div className="flex flex-col gap-3">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">
                          Comparison
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-university-dark">
                          <span>{rowCrit.name}</span>
                          <span className="text-gray-400 font-normal">vs</span>
                          <span>{colCrit.name}</span>
                        </div>
                      </div>

                      {(() => {
                        const pair = getPairState(matrix[i]?.[j] ?? 1);
                        return (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs font-medium text-gray-600" htmlFor={`direction-${i}-${j}`}>
                                Which is more important?
                              </label>
                              <select
                                id={`direction-${i}-${j}`}
                                value={pair.direction}
                                onChange={(e) => {
                                  const direction = e.target.value;
                                  // Leaving "equal" starts at strength 2; with strength 1 the value would stay 1
const strength = direction === "equal" ? 1 : Math.max(pair.strength, 2);
updateCell(i, j, getPairValue(direction, strength));
                                }}
                                className="mt-1 w-full min-h-11 text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-university-green/30"
                              >
                                <option value="equal">Both are equally important</option>
                                <option value="first">{rowCrit.name} is more important</option>
                                <option value="second">{colCrit.name} is more important</option>
                              </select>
                            </div>

                            <div>
                              <label className="text-xs font-medium text-gray-600" htmlFor={`strength-${i}-${j}`}>
                                Importance strength
                              </label>
                              <select
                                id={`strength-${i}-${j}`}
                                value={pair.strength}
                                disabled={pair.direction === "equal"}
                                onChange={(e) => updateCell(i, j, getPairValue(pair.direction, parseInt(e.target.value, 10)))}
                                className="mt-1 w-full min-h-11 text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white disabled:bg-gray-100 disabled:text-gray-400 focus:outline-none focus:ring-2 focus:ring-university-green/30"
                              >
                                {SAATY_STRENGTHS.map((strength) => (
                                  <option key={strength} value={strength}>
                                    {strength} - {strength === 1 ? "Equal" : strength === 2 ? "Slightly" : strength === 3 ? "Moderately" : strength === 4 ? "Between moderate and strong" : strength === 5 ? "Strongly" : strength === 6 ? "Between strong and very strong" : strength === 7 ? "Very strongly" : strength === 8 ? "Between very strong and extreme" : "Extremely"}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        );
                      })()}

                      <p className="text-xs text-gray-500">
                        AHP matrix value: {matrix[i]?.[j] === 1 ? "1 (equal)" : Number.isFinite(matrix[i]?.[j]) ? matrix[i][j].toFixed(3) : "-"}. Reverse value is filled automatically.
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <button
            onClick={handleCompute}
            disabled={saving}
            className="mt-5 bg-university-green text-white px-5 py-2.5 rounded-lg font-medium hover:opacity-90 disabled:opacity-60"
          >
            {saving ? "Computing..." : "Compute Priority Weights"}
          </button>
        </div>

        {result && (
          <div className="bg-white border rounded-xl p-5">
            <h2 className="font-semibold text-university-dark mb-4">Computed Priority Weights</h2>

            <div
              className={`flex items-start sm:items-center gap-2 text-sm p-3 rounded mb-4 ${
                result.consistent ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-800"
              }`}
            >
              {result.consistent ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
              <span className="min-w-0 leading-5">
                Consistency Ratio (CR) = {result.CR.toFixed(4)} —{" "}
                {result.consistent
                  ? "judgments are consistent (CR ≤ 0.1)."
                  : "judgments are inconsistent (CR > 0.1). Please revise your comparisons."}
              </span>
            </div>

            <div className="grid sm:grid-cols-2 gap-6 mb-4 text-sm">
              <div>
                <p className="text-gray-500">λmax</p>
                <p className="font-semibold text-university-dark">{result.lambdaMax.toFixed(3)}</p>
              </div>
              <div>
                <p className="text-gray-500">Consistency Index (CI)</p>
                <p className="font-semibold text-university-dark">{result.CI.toFixed(4)}</p>
              </div>
              <div>
                <p className="text-gray-500">Random Index (RI)</p>
                <p className="font-semibold text-university-dark">{result.RI}</p>
              </div>
              <div>
                <p className="text-gray-500">Consistency Ratio (CR)</p>
                <p className="font-semibold text-university-dark">{result.CR.toFixed(4)}</p>
              </div>
            </div>

            <div className="overflow-x-auto -mx-1 px-1 pb-1 mb-6">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-2">Criterion</th>
                  <th className="py-2">Priority Weight</th>
                  <th className="py-2">Percentage</th>
                </tr>
              </thead>
              <tbody>
                {criteria.map((c, i) => (
                  <tr key={c.code} className="border-b last:border-0">
                    <td className="py-2">{c.name} ({c.code})</td>
                    <td className="py-2">{result.weights[i].toFixed(3)}</td>
                    <td className="py-2">{(result.weights[i] * 100).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>

            <div className="w-full overflow-hidden">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 55 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={10} interval={0} angle={-25} textAnchor="end" height={70} />
                <YAxis fontSize={11} />
                <Tooltip formatter={(v) => v.toFixed(3)} />
                <Bar dataKey="weight" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            </div>

            {/* legacy chart removed */}
            {false && <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip formatter={(v) => v.toFixed(3)} />
                <Bar dataKey="weight" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>}

            {result.consistent && (
              <button
                onClick={() => navigate(`/admin/jobs/${jobId}/ranking`)}
                className="mt-5 bg-university-green text-white px-5 py-2.5 rounded-lg font-medium hover:opacity-90"
              >
                View Applicant Ranking &rarr;
              </button>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
