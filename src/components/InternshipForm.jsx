import React, { useState, useEffect } from "react";

const InternshipForm = ({
  mode = "add",           // "add" | "edit"
  initialData = {},
  onSubmit,
  onCancel,
  statusOptions = ["Open", "Closed"],
}) => {
  const [formData, setFormData] = useState({
    Title: "",
    Mentor: "",
    Duration: "",
    Stipend: "",
    Description: "",
    Status: "",
    Skills: "",
    ...initialData,
  });

  useEffect(() => {
    if (mode === "edit") {
      setFormData({ ...formData, ...initialData });
    }
    // eslint-disable-next-line
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    if (mode === "edit"){
      alert("Internship updated successfully");
    }else{
      alert("Internship added successfully");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl p-6 shadow space-y-4"
    >
      <h3 className="text-lg font-semibold text-center">
        {mode === "add" ? "Add Internship" : "Edit Internship"}
      </h3>

      {[
        { label: "Title", name: "Title" },
        { label: "Mentor", name: "Mentor" },
        { label: "Duration", name: "Duration" },
        { label: "Stipend", name: "Stipend" },
      ].map((field) => (
        <div key={field.name}>
          <label className="block text-sm font-medium mb-1">
            {field.label}
          </label>
          <input
            type="text"
            name={field.name}
            value={formData[field.name]}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>
      ))}

      {/* Description */}
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          name="Description"
          value={formData.Description}
          onChange={handleChange}
          rows={3}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium mb-1">Status</label>
        <select
          name="Status"
          value={formData.Status}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg"
          required
        >
          <option value="" disabled>Select status</option>
          {statusOptions.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Skills */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Skills (comma-separated)
        </label>
        <input
          type="text"
          name="Skills"
          value={formData.Skills}
          onChange={handleChange}
          placeholder="JavaScript, Python, React"
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
        >
          {mode === "add" ? "Add Internship" : "Save Changes"}
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="flex-1 border py-2 rounded-lg hover:bg-slate-100"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default InternshipForm;
