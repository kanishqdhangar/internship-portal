import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";

const UserPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ---------------- FETCH USERS ---------------- */

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/auth/admin/users/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(res.data);
    } catch (err) {
      console.error("Fetch users error:", err);
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  /* ---------------- UPDATE STATUS ---------------- */

  const updateUserStatus = async (user) => {
    try {
      await api.patch(
        `/auth/admin/users/${user.id}/`,
        { is_active: !user.is_active },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchUsers();
    } catch (err) {
      console.error("Update status error:", err);
      alert("Failed to update user status");
    }
  };

  /* ---------------- SORTING ---------------- */

  const sortedUsers = [...users]
    .sort((a, b) => (a.is_active === b.is_active ? 0 : a.is_active ? -1 : 1))
    .sort((a, b) => (a.is_staff === b.is_staff ? 0 : a.is_staff ? -1 : 1));

  /* ---------------- UI ---------------- */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 text-sm"
          >
            ← Back
          </button>

          <h1 className="text-2xl font-semibold">Users</h1>
        </div>

        <div className="overflow-x-auto bg-white rounded-xl shadow">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-200 text-slate-700">
              <tr>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Username</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">First Name</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Action</th>
              </tr>
            </thead>

            <tbody>
              {sortedUsers.map((user) => (
                <tr key={user.id} className="border-t">
                  <td className="px-4 py-3">{user.id}</td>
                  <td className="px-4 py-3">{user.username}</td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">
                    {user.first_name || "N/A"}
                  </td>
                  <td className="px-4 py-3">
                    {user.is_superuser
                      ? "Admin"
                      : user.is_staff
                      ? "Mentor"
                      : "Student"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {user.is_active ? "Active" : "Blocked"}
                    </span>
                  </td>

                  {/* ACTION COLUMN */}
                  <td className="px-4 py-3">
                    {!user.is_superuser ? (
                      <button
                        onClick={() => updateUserStatus(user)}
                        className={`px-4 py-1 rounded-lg text-white text-xs ${
                          user.is_active
                            ? "bg-red-600 hover:bg-red-700"
                            : "bg-green-600 hover:bg-green-700"
                        }`}
                      >
                        {user.is_active ? "Block" : "Activate"}
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400 italic">
                        Protected
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserPage;
