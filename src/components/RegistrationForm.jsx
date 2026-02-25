import React, { useEffect, useState } from "react";
import api from "../utils/api";

const RegistrationForm = ({ closeModal, userId, iId }) => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    adddress: "",
    email: "",
    phone_number: "",
    college_name: "",
    department: "",
    custom_department: "",
    roll_no: "",
    course: "",
    year_of_study: "",
    resume: null,
    id_card: null,
    user_id: "",
    i_id: "",
    status: "Applied",
    skills: "",
    addskills: "none",
  });

  const [availableSkills, setAvailableSkills] = useState([]);
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [idCardUploaded, setIdCardUploaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const departments = [
    "Computer Science & Engineering",
    "Electrical Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Architecture",
    "Electronics and Communication Engineering",
    "Metallurgical Engineering",
    "Materials Engineering",
    "Other",
  ];

  const courses = ["B.Tech", "M.Tech"];
  const years = ["1", "2", "3", "4"];

  /* ---------------- FETCH SKILLS ---------------- */

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await api.get(`/internships/${iId}/`);
        const skills = res.data.Skills.split(",").map((s) => s.trim());
        setAvailableSkills(skills);
      } catch (err) {
        console.error("Fetch skills error", err);
      }
    };
    fetchSkills();
  }, [iId]);

  /* ---------------- HANDLERS ---------------- */

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      let updated = formData.skills
        .split(",")
        .filter((s) => s !== "");
      checked
        ? updated.push(value)
        : (updated = updated.filter((s) => s !== value));
      setFormData({ ...formData, skills: updated.join(",") });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFileChange = (e) => {
    const { name } = e.target;
    const file = e.target.files[0];

    if (!file || file.type !== "application/pdf") {
      alert("PDF files only");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("File must be under 10MB");
      return;
    }

    setFormData({
      ...formData,
      [name]: file,
      user_id: userId,
      i_id: iId,
    });

    name === "resume"
      ? setResumeUploaded(true)
      : setIdCardUploaded(true);
  };

  /* ---------------- VALIDATION ---------------- */

  const validate = () => {
    const errors = {};
    if (!/^\S+@\S+\.\S+$/.test(formData.email))
      errors.email = "Invalid email";
    if (!/^\d{10}$/.test(formData.phone_number))
      errors.phone_number = "Invalid phone number";

    if (
      formData.skills.split(",").filter(Boolean).length !==
      availableSkills.length
    ) {
      errors.skills = "Select all required skills";
    }
    return errors;
  };

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return; 
    setIsSubmitting(true);

    const errors = validate();
    setFormErrors(errors);

    if (Object.keys(errors).length !== 0) {
      setIsSubmitting(false);
      return;
    }

    const data = new FormData();
    Object.entries(formData).forEach(([k, v]) => data.append(k, v));

    try {
      await api.post("/students/students/", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Registration successful!");
      closeModal();
    } catch (err) {
      console.error("Submit error", err);
      alert("Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-start overflow-y-auto">
      <div className="relative bg-white w-full max-w-3xl my-10 rounded-xl p-6 max-h-[90vh] overflow-y-auto">
        <button
          onClick={closeModal}
          aria-label="Close"
          className="absolute top-4 right-4 text-2xl text-slate-500 hover:text-black"
        >
          &times;
        </button>
        <h2 className="text-xl font-semibold mb-6">Internship Registration</h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            ["first_name", "First Name"],
            ["last_name", "Last Name"],
            ["adddress", "Address"],
            ["email", "Email"],
            ["phone_number", "Phone Number"],
            ["college_name", "College Name"],
            ["roll_no", "Roll Number"],
          ].map(([name, label]) => (
            <input
              key={name}
              name={name}
              placeholder={label}
              value={formData[name]}
              onChange={handleChange}
              className="border rounded px-3 py-2"
              required
            />
          ))}

          <select name="course" onChange={handleChange} className="border rounded px-3 py-2" required>
            <option value="">Select Course</option>
            {courses.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>

          <select name="year_of_study" onChange={handleChange} className="border rounded px-3 py-2" required>
            <option value="">Year of Study</option>
            {years.map((y) => (
              <option key={y}>{y}</option>
            ))}
          </select>

          <select name="department" onChange={handleChange} className="border rounded px-3 py-2" required>
            <option value="">Department</option>
            {departments.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>

          {formData.department === "Other" && (
            <input
              name="custom_department"
              placeholder="Specify Department"
              onChange={handleChange}
              className="border rounded px-3 py-2"
              required
            />
          )}

          <div className="md:col-span-2">
            <p className="font-medium mb-2">Required Skills</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {availableSkills.map((skill) => (
                <label
                  key={skill}
                  className="flex items-center gap-2 text-sm"
                >
                  <input
                    type="checkbox"
                    value={skill}
                    checked={formData.skills.includes(skill)}
                    onChange={handleChange}
                    className="accent-indigo-600"
                  />
                  {skill}
                </label>
              ))}
            </div>

            {formErrors.skills && (
              <p className="text-red-500 text-sm mt-1">
                {formErrors.skills}
              </p>
            )}
          </div>


          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Upload Resume (PDF only)
            </label>
            <input
              type="file"
              name="resume"
              accept="application/pdf"
              onChange={handleFileChange}
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Upload ID Card (PDF only)
            </label>
            <input
              type="file"
              name="id_card"
              accept="application/pdf"
              onChange={handleFileChange}
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>

          <textarea
            name="addskills"
            placeholder="Additional skills"
            onChange={handleChange}
            className="border rounded px-3 py-2 md:col-span-2"
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className={`md:col-span-2 py-2 rounded text-white transition 
              ${isSubmitting 
                ? "bg-gray-400 cursor-not-allowed" 
                : "bg-indigo-600 hover:bg-indigo-700"}`}
          >
            {isSubmitting ? "Submitting..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;
