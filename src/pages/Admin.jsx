import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faSignOutAlt,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import api from "../utils/api";
import InternshipForm from "../components/InternshipForm";

const AdminPage = () => {
  const { userId, username, token } = useParams();
  const navigate = useNavigate();

  const [internships, setInternships] = useState([]);
  const [filteredInternships, setFilteredInternships] = useState([]);
  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState("add"); // add | edit
  const [selectedInternship, setSelectedInternship] = useState(null);

  /* ---------------- FETCH ---------------- */

  useEffect(() => {
    fetchInternships();
  }, []);

  const fetchInternships = async () => {
    try {
      const res = await api.get("/internships/");
      const sorted = res.data.sort((a, b) =>
        a.Status === "Open" ? -1 : 1
      );
      setInternships(sorted);
      setFilteredInternships(sorted);
    } catch (err) {
      console.error("Fetch internships error:", err);
    }
  };

  /* ---------------- SEARCH ---------------- */

  useEffect(() => {
    const result = internships.filter((i) =>
      `${i.Title} ${i.Mentor} ${i.Skills}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
    setFilteredInternships(result);
  }, [search, internships]);

  /* ---------------- ACTIONS ---------------- */

  const handleLogout = () => {
    navigate("/");
  };

  const openAddForm = () => {
    setFormMode("add");
    setSelectedInternship(null);
    setShowForm(true);
  };

  const openEditForm = (internship) => {
    setFormMode("edit");
    setSelectedInternship(internship);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setSelectedInternship(null);
  };

  /* ---------------- API HANDLERS ---------------- */

  const handleAdd = async (data) => {
    try {
      await api.post("/internships/", {
        ...data,
        user_id: userId,
        username,
      });
      fetchInternships();
      closeForm();
    } catch (err) {
      console.error("Add internship error:", err);
    }
  };

  const handleEdit = async (data) => {
    try {
      await api.put(`/internships/${data.id}/`, data);
      fetchInternships();
      closeForm();
    } catch (err) {
      console.error("Edit internship error:", err);
    }
  };

  const navigateToApplications = (id) => {
    navigate(`/applications/${username}/${id}`);
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-slate-100">
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
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 border border-white/40 rounded-lg hover:bg-white/10"
            >
              <FontAwesomeIcon icon={faSignOutAlt} />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Toolbar */}
      <div className="max-w-7xl mx-auto px-6 py-6 flex items-center gap-4">
        {/* Search (left) */}
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search internships..."
          className="w-full md:w-80 px-4 py-2 border rounded-lg
                    focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        {/* Right-side actions */}
        <div className="ml-auto flex items-center gap-4">
          <button
            onClick={() => navigate(`/users/${token}`)}
            className="flex items-center gap-2 px-5 py-2.5
                      bg-indigo-600 text-white font-medium
                      rounded-lg shadow
                      hover:bg-indigo-700
                      active:scale-95
                      transition"
          >
            <FontAwesomeIcon icon={faUser} />
            Manage Users
          </button>

          <button
            onClick={openAddForm}
            className="px-5 py-2.5 bg-indigo-600 text-white
                      rounded-lg shadow
                      hover:bg-indigo-700
                      active:scale-95
                      transition"
          >
            + Add Internship
          </button>
        </div>
      </div>

      {/* Internship List */}
      <main
        className={`max-w-7xl mx-auto px-6 pb-10 ${
          showForm ? "blur-sm" : ""
        }`}
      >
        <div className="grid gap-6">
          {filteredInternships.map((internship) => (
            <div
              key={internship.id}
              className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition"
            >
              <div className="flex justify-between items-start">
                <h2 className="text-lg font-semibold">
                  {internship.Title}
                </h2>
                <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-700">
                  {internship.Status}
                </span>
              </div>

              <div className="mt-2 text-sm text-slate-600 space-y-1">
                <p>
                  <strong>Mentor:</strong> {internship.Mentor}
                </p>
                <p>
                  <strong>Duration:</strong> {internship.Duration}
                </p>
                <p>
                  <strong>Skills:</strong> {internship.Skills}
                </p>
              </div>

              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => openEditForm(internship)}
                  className="px-4 py-2 border rounded-lg hover:bg-slate-100"
                >
                  Edit
                </button>
                <button
                  onClick={() =>
                    navigateToApplications(internship.id)
                  }
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  View Applications
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center overflow-y-auto">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl my-10 max-h-[90vh] overflow-y-auto">
            <InternshipForm
              mode={formMode}
              initialData={selectedInternship}
              onSubmit={formMode === "add" ? handleAdd : handleEdit}
              onCancel={closeForm}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
