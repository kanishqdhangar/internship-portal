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

const MentorPage = () => {
  const { userId, username } = useParams();
  const navigate = useNavigate();

  const [internships, setInternships] = useState([]);
  const [filteredInternships, setFilteredInternships] = useState([]);
  const [selectedInternship, setSelectedInternship] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState("add"); // add | edit
  const [editingInternship, setEditingInternship] = useState(null);

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

      const mentorInternships = sorted.filter(
        (i) => i.user_id === userId && i.username === username
      );

      setInternships(sorted);
      setFilteredInternships(mentorInternships);
    } catch (err) {
      console.error("Fetch internships error:", err);
    }
  };

  /* ---------------- ACTIONS ---------------- */

  const handleLogout = () => {
    navigate("/");
    window.location.reload();
  };

  const openAddForm = () => {
    setFormMode("add");
    setEditingInternship(null);
    setShowForm(true);
  };

  const openEditForm = (internship) => {
    setFormMode("edit");
    setEditingInternship(internship);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingInternship(null);
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
      alert("Internship updated successfully");
    } catch (err) {
      console.error("Edit internship error:", err);
    }
  };

  const navigateToApplicationsPage = (id) => {
    navigate(`/applications/${username}/${id}`);
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
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 border border-white/40 rounded-lg hover:bg-white/10"
            >
              <FontAwesomeIcon icon={faSignOutAlt} />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Add Internship Button */}
      <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Internships</h2>
        <button
          onClick={openAddForm}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Add Internship
        </button>
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
                <h3 className="text-lg font-semibold">
                  {internship.Title}
                </h3>
                <button
                  onClick={() => setSelectedInternship(internship)}
                  className="text-slate-600 hover:text-black"
                >
                  <FontAwesomeIcon icon={faInfoCircle} />
                </button>
              </div>

              <p className="text-sm text-slate-600 mt-1">
                Mentor: {internship.Mentor}
              </p>

              <div className="mt-3 text-sm space-y-1">
                <p>
                  <strong>Status:</strong>{" "}
                  <span className="px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                    {internship.Status}
                  </span>
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
                    navigateToApplicationsPage(internship.id)
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

      {/* Internship Details Modal */}
      {selectedInternship && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">
              Internship Details
            </h3>

            <div className="space-y-2 text-sm text-slate-700">
              <p>
                <strong>Title:</strong>{" "}
                {selectedInternship.Title}
              </p>
              <p>
                <strong>Mentor:</strong>{" "}
                {selectedInternship.Mentor}
              </p>
              <p>
                <strong>Description:</strong>{" "}
                {selectedInternship.Description}
              </p>
              <p>
                <strong>Duration:</strong>{" "}
                {selectedInternship.Duration}
              </p>
              <p>
                <strong>Stipend:</strong>{" "}
                {selectedInternship.Stipend}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                {selectedInternship.Status}
              </p>
              <p>
                <strong>Skills:</strong>{" "}
                {selectedInternship.Skills}
              </p>
            </div>

            <button
              onClick={() => setSelectedInternship(null)}
              className="mt-6 w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center overflow-y-auto">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl my-10 max-h-[90vh] overflow-y-auto">
            <InternshipForm
              mode={formMode}
              initialData={editingInternship}
              onSubmit={formMode === "add" ? handleAdd : handleEdit}
              onCancel={closeForm}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default MentorPage;
