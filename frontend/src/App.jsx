import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Jobs from "./pages/Jobs";
import JobDetail from "./pages/JobDetail";
import Apply from "./pages/Apply";
import MyApplications from "./pages/MyApplications";
import Profile from "./pages/Profile";
import ApplicantDashboard from "./pages/ApplicantDashboard";

import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageJobs from "./pages/admin/ManageJobs";
import JobApplications from "./pages/admin/JobApplications";
import PairwiseComparison from "./pages/admin/PairwiseComparison";
import RankingDashboard from "./pages/admin/RankingDashboard";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetail />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute role="applicant">
                <ApplicantDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/apply/:jobId"
            element={
              <ProtectedRoute role="applicant">
                <Apply />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-applications"
            element={
              <ProtectedRoute role="applicant">
                <MyApplications />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/jobs"
            element={
              <ProtectedRoute role="admin">
                <ManageJobs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/jobs/:jobId/applications"
            element={
              <ProtectedRoute role="admin">
                <JobApplications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/jobs/:jobId/pairwise"
            element={
              <ProtectedRoute role="admin">
                <PairwiseComparison />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/jobs/:jobId/ranking"
            element={
              <ProtectedRoute role="admin">
                <RankingDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Home />} />
        </Routes>
      </main>
    </div>
  );
}
