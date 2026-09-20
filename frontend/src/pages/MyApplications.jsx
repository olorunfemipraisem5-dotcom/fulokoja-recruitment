import { useEffect, useState } from "react";
import api from "../api/axios";
import StatusBadge from "../components/StatusBadge";
import ApplicantLayout from "../components/ApplicantLayout";

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/applications/mine")
      .then((res) => setApplications(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <ApplicantLayout title="My Applications">
      <div className="max-w-4xl">
        {loading && <p className="text-gray-600">Loading...</p>}
        {!loading && applications.length === 0 && (
          <p className="text-gray-600">You haven't applied to any positions yet.</p>
        )}

        <div className="space-y-4">
          {applications.map((app) => (
            <div key={app._id} className="bg-white border rounded-xl p-5 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-university-dark">{app.job?.title}</h2>
                <p className="text-sm text-gray-600">{app.job?.department}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Submitted {new Date(app.createdAt).toLocaleDateString()}
                </p>
                {app.adminNote && (
                  <p className="text-xs text-gray-500 mt-1">Note from reviewer: {app.adminNote}</p>
                )}
              </div>
              <StatusBadge status={app.status} />
            </div>
          ))}
        </div>
      </div>
    </ApplicantLayout>
  );
}
