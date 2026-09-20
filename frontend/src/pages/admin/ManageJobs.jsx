import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import AdminLayout from "../../components/AdminLayout";

const EMPTY_FORM = {
  title: "",
  department: "",
  type: "Academic",
  description: "",
  requirements: "",
  closingDate: "",
};

export default function ManageJobs() {
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadJobs = () => {
    api.get("/jobs?all=true").then((res) => setJobs(res.data)).finally(() => setLoading(false));
  };

  useEffect(loadJobs, []);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editingId) {
        await api.put(`/jobs/${editingId}`, form);
      } else {
        await api.post("/jobs", form);
      }
      resetForm();
      loadJobs();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save job posting.");
    }
  };

  const handleEdit = (job) => {
    setEditingId(job._id);
    setForm({
      title: job.title,
      department: job.department,
      type: job.type,
      description: job.description,
      requirements: job.requirements,
      closingDate: job.closingDate ? job.closingDate.slice(0, 10) : "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleStatus = async (job) => {
    await api.put(`/jobs/${job._id}`, { status: job.status === "open" ? "closed" : "open" });
    loadJobs();
  };

  const handleDelete = async (job) => {
    if (!window.confirm(`Delete "${job.title}"? This cannot be undone.`)) return;
    await api.delete(`/jobs/${job._id}`);
    loadJobs();
  };

  return (
    <AdminLayout title="Manage Job Postings">
      <div className="max-w-5xl">

      <div className="bg-white border rounded-xl p-6 mb-8">
        <h2 className="font-semibold text-university-dark mb-4">
          {editingId ? "Edit Job Posting" : "Create New Job Posting"}
        </h2>
        {error && <div className="bg-red-50 text-red-700 text-sm p-3 rounded mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
              <input
                required
                value={form.title}
                onChange={update("title")}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <input
                required
                value={form.department}
                onChange={update("department")}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select value={form.type} onChange={update("type")} className="w-full border rounded-lg px-3 py-2">
                <option value="Academic">Academic</option>
                <option value="Non-Academic">Non-Academic</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Closing Date</label>
              <input
                type="date"
                required
                value={form.closingDate}
                onChange={update("closingDate")}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              required
              rows={3}
              value={form.description}
              onChange={update("description")}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Requirements</label>
            <textarea
              required
              rows={3}
              value={form.requirements}
              onChange={update("requirements")}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              className="bg-university-green text-white px-5 py-2.5 rounded-lg font-medium hover:opacity-90"
            >
              {editingId ? "Save Changes" : "Create Posting"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="border px-5 py-2.5 rounded-lg font-medium text-gray-600"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <h2 className="font-semibold text-university-dark mb-3">All Postings</h2>
      {loading ? (
        <p className="text-gray-600">Loading...</p>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <div key={job._id} className="bg-white border rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-university-dark">{job.title}</p>
                <p className="text-sm text-gray-500">
                  {job.department} · {job.status === "open" ? "Open" : "Closed"} · Closes{" "}
                  {new Date(job.closingDate).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2 text-sm">
                <button onClick={() => handleEdit(job)} className="text-university-green font-medium">
                  Edit
                </button>
                <button onClick={() => toggleStatus(job)} className="text-amber-600 font-medium">
                  {job.status === "open" ? "Close" : "Reopen"}
                </button>
                <button onClick={() => handleDelete(job)} className="text-red-600 font-medium">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </AdminLayout>
  );
}
