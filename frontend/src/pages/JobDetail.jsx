import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function JobDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/jobs/${id}`)
      .then((res) => setJob(res.data))
      .catch(() => setError("This vacancy could not be found."));
  }, [id]);

  if (error) return <p className="max-w-3xl mx-auto px-4 py-12 text-red-600">{error}</p>;
  if (!job) return <p className="max-w-3xl mx-auto px-4 py-12 text-gray-600">Loading...</p>;

  const closed = job.status !== "open" || new Date(job.closingDate) < new Date();

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="bg-white rounded-xl shadow p-8">
        <span className="text-xs font-medium bg-university-green/10 text-university-green px-2 py-1 rounded">
          {job.type}
        </span>
        <h1 className="text-2xl font-bold text-university-dark mt-3">{job.title}</h1>
        <p className="text-gray-600">{job.department}</p>
        <p className="text-sm text-gray-500 mt-1">
          Closing date: {new Date(job.closingDate).toLocaleDateString()}
        </p>

        <div className="mt-6">
          <h2 className="font-semibold text-university-dark mb-1">Description</h2>
          <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
        </div>

        <div className="mt-6">
          <h2 className="font-semibold text-university-dark mb-1">Requirements</h2>
          <p className="text-gray-700 whitespace-pre-line">{job.requirements}</p>
        </div>

        <div className="mt-8">
          {closed && (
            <p className="text-red-600 font-medium">Applications for this position are closed.</p>
          )}
          {!closed && !user && (
            <Link
              to="/login"
              className="inline-block bg-university-green text-white px-6 py-2.5 rounded-lg font-medium hover:opacity-90"
            >
              Log in to Apply
            </Link>
          )}
          {!closed && user && user.role === "applicant" && (
            <Link
              to={`/apply/${job._id}`}
              className="inline-block bg-university-green text-white px-6 py-2.5 rounded-lg font-medium hover:opacity-90"
            >
              Apply for this Position
            </Link>
          )}
          {!closed && user && user.role === "admin" && (
            <p className="text-sm text-gray-500">Admin accounts cannot submit applications.</p>
          )}
        </div>
      </div>
    </div>
  );
}
