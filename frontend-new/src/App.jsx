
import { useEffect, useMemo, useState } from "react";
import "./App.css";

const API = "https://students-dashboard-kappa.vercel.app/students";

export default function App() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    course: "",
  });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadStudents() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API);
      if (!response.ok) throw new Error("Students load nahi ho sake.");
      const data = await response.json();
      setStudents(data);
    } catch {
      setError(
        "Backend se connection nahi ho raha. Check karo ke server port 5000 par chal raha hai."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStudents();
  }, []);

  const filteredStudents = useMemo(() => {
    const query = search.toLowerCase().trim();

    return students.filter((student) =>
      [student.name, student.email, student.course]
        .some((value) => (value || "").toLowerCase().includes(query))
    );
  }, [students, search]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);

    try {
      const response = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          course: form.course.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Student add nahi hua.");
      }

      setStudents((previous) => [data, ...previous]);
      setForm({ name: "", email: "", course: "" });
      setMessage("Student successfully register ho gaya!");
    } catch (err) {
      setError(err.message || "Kuch ghalat ho gaya.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteStudent(id) {
    const confirmed = window.confirm(
      "Kya tum is student ko delete karna chahti ho?"
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API}/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Student delete nahi hua.");
      }

      setStudents((previous) =>
        previous.filter((student) => student._id !== id)
      );
      setMessage("Student successfully delete ho gaya.");
    } catch (err) {
      setError(err.message || "Delete karte waqt error aaya.");
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#dashboard">
          <span className="brand-icon">S</span>
          <span>
            <strong>StudentHub</strong>
            <small>Management System</small>
          </span>
        </a>

        <p className="nav-heading">WORKSPACE</p>
        <a className="nav-link active" href="#dashboard">
          <span>▦</span> Dashboard
        </a>
        <a className="nav-link" href="#registration">
          <span>＋</span> Add Student
        </a>
        <a className="nav-link" href="#students">
          <span>♙</span> All Students
        </a>

        <div className="sidebar-bottom">
          <div className="help-card">
            <span className="help-icon">✦</span>
            <strong>Stay organized</strong>
            <p>Manage your student records in one place.</p>
          </div>
          <p className="sidebar-footer">StudentHub · v1.0</p>
        </div>
      </aside>

      <main className="main-content" id="dashboard">
        <header className="topbar">
          <div>
            <p className="eyebrow">STUDENT MANAGEMENT</p>
            <h1>Dashboard</h1>
          </div>
          <div className="profile">
            <div className="avatar">A</div>
            <div>
              <strong>Admin</strong>
              <small>Administrator</small>
            </div>
          </div>
        </header>

        <section className="welcome-banner">
          <div className="welcome-copy">
            <span className="welcome-label">YOUR WORKSPACE</span>
            <h2>Manage your students<br />with confidence.</h2>
            <p>Register students, organize records, and keep everything in one place.</p>
            <a href="#registration" className="primary-link">
              + Register a student
            </a>
          </div>
          <div className="banner-art" aria-hidden="true">
            <div className="art-circle circle-one"></div>
            <div className="art-circle circle-two"></div>
            <div className="art-card">
              <span className="art-symbol">♙</span>
              <strong>Student Records</strong>
              <span className="art-lines"></span>
              <span className="art-lines short"></span>
              <span className="art-check">✓</span>
            </div>
          </div>
        </section>

        {error && <div className="notice error-notice">{error}</div>}
        {message && <div className="notice success-notice">{message}</div>}

        <section className="stats-grid">
          <article className="stat-card">
            <div className="stat-icon purple-icon">♙</div>
            <p>Total Students</p>
            <h3>{students.length}</h3>
            <span className="stat-caption">Registered records</span>
          </article>

          <article className="stat-card">
            <div className="stat-icon pink-icon">▤</div>
            <p>Courses</p>
            <h3>{new Set(students.map((s) => s.course).filter(Boolean)).size}</h3>
            <span className="stat-caption">Unique course names</span>
          </article>

          <article className="stat-card">
            <div className="stat-icon blue-icon">✓</div>
            <p>System Status</p>
            <h3 className="status-text">
              {loading ? "Loading" : error ? "Offline" : "Connected"}
            </h3>
            <span className="stat-caption">API connection status</span>
          </article>
        </section>

        <div className="content-grid">
          <section className="panel registration-panel" id="registration">
            <div className="section-heading">
              <div>
                <p className="eyebrow">NEW RECORD</p>
                <h2>Register Student</h2>
              </div>
              <span className="heading-icon">＋</span>
            </div>

            <p className="section-description">
              Enter the student's details to create a new record.
            </p>

            <form onSubmit={handleSubmit}>
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                placeholder="e.g. Ayesha Imran"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
                required
              />

              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                placeholder="student@example.com"
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
                required
              />

              <label htmlFor="course">Course</label>
              <select
                id="course"
                value={form.course}
                onChange={(e) =>
                  setForm({ ...form, course: e.target.value })
                }
                required
              >
                <option value="">Select a course</option>
                <option value="Web Development">Web Development</option>
                <option value="Frontend Development">Frontend Development</option>
                <option value="Backend Development">Backend Development</option>
                <option value="Graphic Design">Graphic Design</option>
                <option value="Digital Marketing">Digital Marketing</option>
                <option value="Other">Other</option>
              </select>

              <button className="submit-button" type="submit" disabled={saving}>
                {saving ? "Registering..." : "Register Student  →"}
              </button>
            </form>
          </section>

          <section className="panel students-panel" id="students">
            <div className="section-heading students-heading">
              <div>
                <p className="eyebrow">DATABASE RECORDS</p>
                <h2>All Students</h2>
              </div>
              <span className="record-count">{students.length} records</span>
            </div>

            <div className="search-box">
              <span>⌕</span>
              <input
                type="search"
                placeholder="Search name, email or course..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search students"
              />
            </div>

            {loading ? (
              <div className="empty-state">
                <div className="empty-symbol">↻</div>
                <h3>Loading students...</h3>
                <p>Connecting to your database.</p>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="empty-state">
                <div className="empty-symbol">♙</div>
                <h3>{search ? "No matching students" : "No students yet"}</h3>
                <p>
                  {search
                    ? "Try another search term."
                    : "Add your first student using the registration form."}
                </p>
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>STUDENT</th>
                      <th>COURSE</th>
                      <th>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student) => (
                      <tr key={student._id}>
                        <td>
                          <div className="student-cell">
                            <div className="student-avatar">
                              {(student.name || "?").charAt(0).toUpperCase()}
                            </div>
                            <div className="student-info">
                              <strong>{student.name}</strong>
                              <span>{student.email}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="course-badge">{student.course}</span>
                        </td>
                        <td>
                          <button
                            className="delete-button"
                            onClick={() => deleteStudent(student._id)}
                            aria-label={`Delete ${student.name}`}
                            title="Delete student"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="panel-footer">
              Showing {filteredStudents.length} of {students.length} students
              <button className="refresh-button" onClick={loadStudents}>
                ↻ Refresh
              </button>
            </div>
          </section>
        </div>

        <footer className="page-footer">
          <span>© 2026 StudentHub</span>
          <span>Built with React · Express · MongoDB</span>
        </footer>
      </main>
    </div>
  );
}
