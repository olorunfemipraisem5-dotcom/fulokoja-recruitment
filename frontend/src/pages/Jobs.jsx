import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/jobs")
      .then((res) => setJobs(res.data))
      .catch(() => setError("Could not load vacancies. Please try again later."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-university-dark mb-6">Open Positions</h1>

      {loading && <p className="text-gray-600">Loading vacancies...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && jobs.length === 0 && (
        <p className="text-gray-600">There are no open positions at this time. Please check back later.</p>
      )}

      <div className="grid sm:grid-cols-2 gap-5">
        {jobs.map((job) => (
          <Link
            to={`/jobs/${job._id}`}
            key={job._id}
            className="bg-white border rounded-xl p-5 hover:shadow-md transition"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium bg-university-green/10 text-university-green px-2 py-1 rounded">
                {job.type}
              </span>
              <span className="text-xs text-gray-500">
                Closes {new Date(job.closingDate).toLocaleDateString()}
              </span>
            </div>
            <h2 className="font-semibold text-lg text-university-dark">{job.title}</h2>
            <p className="text-sm text-gray-600">{job.department}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
