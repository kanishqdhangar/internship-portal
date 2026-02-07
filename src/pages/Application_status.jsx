import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from "../utils/api"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faUser, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

const ApplicationStatus = () => {
  const [students, setStudents] = useState([]);
  const [internshipDetails, setInternshipDetails] = useState([]);
  const [selectedInternship, setSelectedInternship] = useState(null);
  const { userId, username } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents();
  }, [userId]);

  const fetchStudents = async () => {
    try {
      const response = await api.get("/students/students/");
      const data = response.data;
      const filteredStudents = data.filter(student => student.user_id === userId);
      setStudents(filteredStudents);

      const internshipPromises = filteredStudents.map(student =>
        api.get(`/internships/${student.i_id}/`)
          .then(res => res.data)
          .catch(error => {
            console.error('Error fetching internship:', error);
            return null; // Return null if there's an error
          })
      );

      const internshipsData = await Promise.all(internshipPromises);
      const validInternships = internshipsData.filter(internship => internship !== null); // Filter out null values
      // console.log(validInternships);
      setInternshipDetails(validInternships);
    } catch (error) {
      console.error('Error fetching students data:', error);
    }
  };

  const getInternshipDetails = (internshipId) => {
    // console.log('Internship Details State:', internshipDetails);
    const internship = internshipDetails.find(internship => internship.id === parseInt(internshipId));
    // console.log('Internship ID:', internshipId, 'Matched Internship:', internship);
    return internship ? { title: internship.Title, mentor: internship.Mentor, description: internship.Description } : { title: 'N/A', mentor: 'N/A', description: 'N/A' };
  };

  const handleLogout = () => {
    window.localStorage.setItem("isLoggedIn", false);
    navigate('/');
  };

  const handleShowDetails = (internshipId) => {
    console.log(internshipId);
    const internship = internshipDetails.find(internship => internship.id === parseInt(internshipId));
    setSelectedInternship(internship);
    console.log(selectedInternship);
  };

  const handleCloseDetails = () => {
    setSelectedInternship(null);
  };

  const handleHome = () => {
    navigate('/')
  }

  return (
    <>
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-slate-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <span
              className="text-lg font-semibold cursor-pointer"
            >
              Internship Portal
            </span>
            <ul className="hidden md:flex gap-6 text-sm">
              <li onClick={handleHome} className="cursor-pointer hover:underline">
                Home
              </li>
            </ul>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-full text-sm">
              <FontAwesomeIcon icon={faUser} />
              {username}
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 border border-white/40 rounded-lg hover:bg-white/10 text-sm"
            >
              <FontAwesomeIcon icon={faSignOutAlt} /> Logout
            </button>
              
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <h2 className="text-xl font-semibold mb-6">My Applications</h2>

        {/* Table */}
        <div className="overflow-x-auto bg-white rounded-xl shadow">
          <table className="min-w-full border-collapse">
            <thead className="bg-slate-100">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-slate-600">
                  Internship Title
                </th>
                <th className="text-left px-6 py-3 text-sm font-medium text-slate-600">
                  Mentor Name
                </th>
                <th className="text-left px-6 py-3 text-sm font-medium text-slate-600">
                  Status
                </th>
                <th className="text-center px-6 py-3 text-sm font-medium text-slate-600">
                  Details
                </th>
              </tr>
            </thead>

            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="text-center py-6 text-slate-500"
                  >
                    No applications found
                  </td>
                </tr>
              ) : (
                students.map(student => {
                  const { title, mentor } = getInternshipDetails(student.i_id);
                  return (
                    <tr
                      key={student.id}
                      className="border-t hover:bg-slate-50 transition"
                    >
                      <td className="px-6 py-4 text-sm">{title}</td>
                      <td className="px-6 py-4 text-sm">{mentor}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                          {student.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleShowDetails(student.i_id)}
                          className="text-slate-600 hover:text-black"
                        >
                          <FontAwesomeIcon icon={faInfoCircle} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Details Modal */}
      {selectedInternship && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">
              Internship Details
            </h3>

            <div className="space-y-2 text-sm text-slate-700">
              <p><strong>Title:</strong> {selectedInternship.Title}</p>
              <p><strong>Mentor:</strong> {selectedInternship.Mentor}</p>
              <p><strong>Description:</strong> {selectedInternship.Description}</p>
              <p><strong>Duration:</strong> {selectedInternship.Duration}</p>
              <p><strong>Stipend:</strong> {selectedInternship.Stipend}</p>
              <p><strong>Status:</strong> {selectedInternship.Status}</p>
              <p><strong>Skills:</strong> {selectedInternship.Skills}</p>
            </div>

            <button
              onClick={handleCloseDetails}
              className="mt-6 w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ApplicationStatus;
