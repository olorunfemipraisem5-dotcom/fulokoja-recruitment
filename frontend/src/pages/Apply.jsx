import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Apply() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [cv, setCv] = useState(null);
  const [coverLetter, setCoverLetter] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/jobs/${jobId}`).then((res) => setJob(res.data)).catch(() => setError("Job not found"));
  }, [jobId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!cv || !coverLetter) {
      setError("Please attach both your CV and your application/cover letter as PDF files.");
      return;
    }

    const formData = new FormData();
    formData.append("cv", cv);
    formData.append("coverLetter", coverLetter);

    setSubmitting(true);
    try {
      await api.post(`/applications/${jobId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate("/my-applications");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit application.");
    } finally {
      setSubmitting(false);
    }
  };

  if (error && !job) return <p className="max-w-2xl mx-auto px-4 py-12 text-red-600">{error}</p>;
  if (!job) return <p className="max-w-2xl mx-auto px-4 py-12 text-gray-600">Loading...</p>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-white rounded-xl shadow p-8">
        <h1 className="text-xl font-bold text-university-dark mb-1">Apply: {job.title}</h1>
        <p className="text-gray-600 mb-6">{job.department}</p>

        {error && <div className="bg-red-50 text-red-700 text-sm p-3 rounded mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Curriculum Vitae (PDF, max 5MB)
            </label>
            <input
              type="file"
              accept="application/pdf"
              required
              onChange={(e) => setCv(e.target.files[0])}
              className="w-full text-sm border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Application / Cover Letter (PDF, max 5MB)
            </label>
            <input
              type="file"
              accept="application/pdf"
              required
              onChange={(e) => setCoverLetter(e.target.files[0])}
              className="w-full text-sm border rounded-lg px-3 py-2"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-university-green text-white py-2.5 rounded-lg font-medium hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Submit Application"}
          </button>
        </form>
      </div>
    </div>
  );
}
