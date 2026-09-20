import { useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import AdminLayout from "../components/AdminLayout";
import ApplicantLayout from "../components/ApplicantLayout";

export default function Profile() {
  const { user, updateUser } = useAuth();

  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || "",
    phone: user?.phone || "",
  });
  const [profileMsg, setProfileMsg] = useState({ type: "", text: "" });
  const [savingProfile, setSavingProfile] = useState(false);

  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwMsg, setPwMsg] = useState({ type: "", text: "" });
  const [savingPw, setSavingPw] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMsg({ type: "", text: "" });
    setSavingProfile(true);
    try {
      const { data } = await api.put("/auth/profile", profileForm);
      updateUser(data);
      setProfileMsg({ type: "success", text: "Profile updated successfully." });
    } catch (err) {
      setProfileMsg({ type: "error", text: err.response?.data?.message || "Failed to update profile." });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwMsg({ type: "", text: "" });

    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwMsg({ type: "error", text: "New password and confirmation do not match." });
      return;
    }

    setSavingPw(true);
    try {
      await api.put("/auth/change-password", {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      setPwMsg({ type: "success", text: "Password changed successfully." });
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setPwMsg({ type: "error", text: err.response?.data?.message || "Failed to change password." });
    } finally {
      setSavingPw(false);
    }
  };

  const Layout = user?.role === "admin" ? AdminLayout : ApplicantLayout;

  return (
    <Layout title="My Profile">
    <div className="max-w-2xl space-y-8">

      {/* Profile details */}
      <div className="bg-white border rounded-xl p-6">
        <h2 className="font-semibold text-university-dark mb-4">Personal Details</h2>

        {profileMsg.text && (
          <div
            className={`text-sm p-3 rounded mb-4 ${
              profileMsg.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
            }`}
          >
            {profileMsg.text}
          </div>
        )}

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              required
              value={profileForm.fullName}
              onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              value={profileForm.phone}
              onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              disabled
              value={user?.email || ""}
              className="w-full border rounded-lg px-3 py-2 bg-gray-100 text-gray-500"
            />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
          </div>
          <button
            type="submit"
            disabled={savingProfile}
            className="bg-university-green text-white px-5 py-2.5 rounded-lg font-medium hover:opacity-90 disabled:opacity-60"
          >
            {savingProfile ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>

      {/* Change password */}
      <div className="bg-white border rounded-xl p-6">
        <h2 className="font-semibold text-university-dark mb-4">Change Password</h2>

        {pwMsg.text && (
          <div
            className={`text-sm p-3 rounded mb-4 ${
              pwMsg.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
            }`}
          >
            {pwMsg.text}
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <input
              type="password"
              required
              value={pwForm.currentPassword}
              onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={pwForm.newPassword}
              onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={pwForm.confirmPassword}
              onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <button
            type="submit"
            disabled={savingPw}
            className="bg-university-green text-white px-5 py-2.5 rounded-lg font-medium hover:opacity-90 disabled:opacity-60"
          >
            {savingPw ? "Updating..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
    </Layout>
  );
}
