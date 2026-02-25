import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSignOutAlt,
  faUser,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import * as XLSX from "xlsx";
import api from "../utils/api";

const ViewApplicationsPage = () => {
  const { internshipId, username } = useParams();
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [filter, setFilter] = useState("all");

  /* ---------------- FETCH ---------------- */

  const fetchApplications = async () => {
    try {
      const res = await api.get("/students/students/");
      const filtered = res.data
        .filter(app => String(app.i_id) === String(internshipId))
        .map(app => ({ ...app, _statusDraft: app.status })) // 👈 local draft
        .sort((a, b) => a.id - b.id);

      setApplications(filtered);
      applyFilter(filter, filtered);
    } catch (err) {
      console.error("Fetch applications error:", err);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [internshipId]);

  /* ---------------- FILTER ---------------- */

  const applyFilter = (type, apps) => {
    let result = apps;
    if (type === "shortlisted") {
      result = apps.filter(a => a.status === "Shortlisted");
    } else if (type === "not_shortlisted") {
      result = apps.filter(a => a.status === "Not Shortlisted");
    }
    setFilteredApplications(result);
  };

  const handleFilterChange = (type) => {
    setFilter(type);
    applyFilter(type, applications);
  };

  /* ---------------- STATUS UPDATE ---------------- */

  const handleStatusChange = (id, value) => {
    setApplications(prev =>
      prev.map(app =>
        app.id === id ? { ...app, _statusDraft: value } : app
      )
    );
    setFilteredApplications(prev =>
      prev.map(app =>
        app.id === id ? { ...app, _statusDraft: value } : app
      )
    );
  };

  const handleSaveStatus = async (app) => {
    try {
      const params = new URLSearchParams();
      params.append("status", app._statusDraft);

      await api.put(
        `/students/students/${app.id}/update_status/`,
        params,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
      alert("Status Updated Successfully");
      fetchApplications();
    } catch (err) {
      console.error("Update status error:", err);
    }
  };


  /* ---------------- EXCEL ---------------- */

  const handleExportToExcel = () => {
    const cleaned = applications.map(
      ({ id, i_id, user_id, _statusDraft, ...rest }) => rest
    );
    const worksheet = XLSX.utils.json_to_sheet(cleaned);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Applications");
    XLSX.writeFile(workbook, "Applications.xlsx");
  };

  /* ---------------- UI ---------------- */

  return (
    <>
      {/* Header */}
      <header className="bg-slate-900 text-white py-4 shadow">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <h1 className="text-lg font-semibold">Internship Web Portal</h1>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-2">
              <FontAwesomeIcon icon={faUser} />
              {username}
            </span>
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 px-4 py-2 border border-white/40 rounded-lg hover:bg-white/10"
            >
              <FontAwesomeIcon icon={faSignOutAlt} />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-6 py-6 flex gap-3">
        {["all", "shortlisted", "not_shortlisted"].map((f) => (
          <button
            key={f}
            onClick={() => handleFilterChange(f)}
            className={`px-4 py-2 rounded-lg text-sm ${
              filter === f
                ? "bg-indigo-600 text-white"
                : "border hover:bg-slate-100"
            }`}
          >
            {f === "all"
              ? "All Applications"
              : f === "shortlisted"
              ? "Shortlisted"
              : "Not Shortlisted"}
          </button>
        ))}
      </div>

      {/* Table */}
      <main className="max-w-7xl mx-auto px-6 pb-10">
        <div className="overflow-x-auto bg-white rounded-xl shadow">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Resume</th>
                <th className="px-4 py-3">ID Card</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filteredApplications.map(app => (
                <tr key={app.id} className="border-t">
                  <td className="px-4 py-3">
                    {app.first_name} {app.last_name}
                  </td>
                  <td className="px-4 py-3">{app.email}</td>
                  <td className="px-4 py-3">
                    <a href={app.resume_url} target="_blank" rel="noreferrer" className="text-indigo-600">
                      View
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    <a href={app.id_card_url} target="_blank" rel="noreferrer" className="text-indigo-600">
                      View
                    </a>
                  </td>

                  {/* ✅ DROPDOWN + SAVE (ALWAYS VISIBLE) */}
                  <td className="px-4 py-3">
                    <div className="flex gap-2 items-center">
                      <select
                        value={app._statusDraft}
                        onChange={(e) =>
                          handleStatusChange(app.id, e.target.value)
                        }
                        className="border rounded px-2 py-1"
                      >
                        <option>Applied</option>
                        <option>Shortlisted</option>
                        <option>Not Shortlisted</option>
                      </select>
                      <button
                        onClick={() => handleSaveStatus(app)}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Save
                      </button>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <FontAwesomeIcon
                      icon={faInfoCircle}
                      className="cursor-pointer text-slate-600 hover:text-black"
                      onClick={() => setSelectedApplication(app)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Export */}
        <div className="mt-6">
          <button
            onClick={handleExportToExcel}
            className="px-5 py-2 bg-indigo-600 text-white rounded-lg"
          >
            Download Excel
          </button>
        </div>
      </main>

      {/* Details Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">
              Application Details
            </h3>

            <div className="space-y-2 text-sm">
              <p><strong>Name:</strong> {selectedApplication.first_name} {selectedApplication.last_name}</p>
              <p><strong>Email:</strong> {selectedApplication.email}</p>
              <p><strong>College:</strong> {selectedApplication.college_name}</p>
              <p><strong>Skills:</strong> {selectedApplication.skills}</p>
            </div>

            <button
              onClick={() => setSelectedApplication(null)}
              className="mt-6 w-full bg-red-500 text-white py-2 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ViewApplicationsPage;
