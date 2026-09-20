import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="bg-white rounded-xl shadow p-10 text-center">
        <h1 className="text-3xl font-bold text-university-dark mb-3">
          Welcome to the FULokoja Recruitment Portal
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto mb-8">
          Apply for open academic and non-academic positions at Federal University Lokoja.
          Create one account, submit your CV and application letter, and track your
          application status online.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to="/jobs"
            className="bg-university-green text-white px-6 py-3 rounded-lg font-medium hover:opacity-90"
          >
            View Open Positions
          </Link>
          <Link
            to="/register"
            className="border border-university-green text-university-green px-6 py-3 rounded-lg font-medium hover:bg-university-green/5"
          >
            Create an Account
          </Link>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 mt-14 text-left">
          <div className="p-5 border rounded-lg">
            <h3 className="font-semibold text-university-dark mb-1">1. Create an Account</h3>
            <p className="text-sm text-gray-600">One account for all applications you submit.</p>
          </div>
          <div className="p-5 border rounded-lg">
            <h3 className="font-semibold text-university-dark mb-1">2. Upload Documents</h3>
            <p className="text-sm text-gray-600">Submit your CV and application letter as PDF files.</p>
          </div>
          <div className="p-5 border rounded-lg">
            <h3 className="font-semibold text-university-dark mb-1">3. Track Status</h3>
            <p className="text-sm text-gray-600">Follow your application's progress in real time.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
