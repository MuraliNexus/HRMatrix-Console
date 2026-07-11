import { useEffect, useState } from 'react';
import axios from 'axios';

const BASE_URL = "http://localhost:8080/App";
const REQUEST_TIMEOUT = 4000;

function Project() {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/projects`, { timeout: REQUEST_TIMEOUT });
        setProjects(response.data);
        setFilteredProjects(response.data);
      } catch (error) {
        console.log("error", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleSearchChange = (e) => {
    const searchText = e.target.value.toLowerCase();
    const filtered = projects.filter((project) =>
      project.projectName.toLowerCase().includes(searchText)
    );
    setFilteredProjects(filtered);
  };

  const handleAdd = () => {
    setIsEdit(false);
    setEditId(null);
    setProjectName("");
    setErrorMessage("");
    setModalOpen(true);
  };

  const handleEdit = (project) => {
    setIsEdit(true);
    setEditId(project.id);
    setProjectName(project.projectName);
    setErrorMessage("");
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    const isConfirm = window.confirm("Are you sure you want to delete this project");
    if (!isConfirm) return;

    try {
      await axios.delete(`${BASE_URL}/projects/${id}`);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      setFilteredProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.log("error deleting project", error);
      window.alert("Project could not be deleted. Please check the backend API and try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedProjectName = projectName.trim();
    if (!trimmedProjectName) {
      setErrorMessage("Project name is required.");
      return;
    }

    setSaving(true);
    setErrorMessage("");

    try {
      if (isEdit) {
        const response = await axios.put(`${BASE_URL}/projects/${editId}`, {
          projectName: trimmedProjectName,
        });
        setProjects((prev) => prev.map((p) => (p.id === editId ? response.data : p)));
        setFilteredProjects((prev) => prev.map((p) => (p.id === editId ? response.data : p)));
      } else {
        const response = await axios.post(`${BASE_URL}/projects`, {
          projectName: trimmedProjectName,
        });
        setProjects((prev) => [...prev, response.data]);
        setFilteredProjects((prev) => [...prev, response.data]);
      }

      setModalOpen(false);
    } catch (error) {
      console.log("error saving project", error);
      setErrorMessage("Project could not be saved. Please check the backend API and try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="main-container">
      <div className="container">
        <h3>Projects</h3>

        <div className="input-search">
          <input type="search" placeholder="search text here" onChange={handleSearchChange} />
          <button className="btn green" onClick={handleAdd}>Add Project</button>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Project Name</th>
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td className="table-message" colSpan="4">Loading projects...</td>
              </tr>
            )}
            {!loading && filteredProjects.length === 0 && (
              <tr>
                <td className="table-message" colSpan="4">No projects found.</td>
              </tr>
            )}
            {!loading && filteredProjects.map((project) => (
              <tr key={project.id}>
                <td>{project.id}</td>
                <td>{project.projectName}</td>
                <td>
                  <button className="btn green" onClick={() => handleEdit(project)}>Edit</button>
                </td>
                <td>
                  <button className="btn red" onClick={() => handleDelete(project.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {isModalOpen && (
          <div className="modal">
            <div className="modal-content">
              <span className="close" onClick={() => setModalOpen(false)}>X</span>
              <h2>{isEdit ? "Edit Project" : "New Project"}</h2>
              <form onSubmit={handleSubmit}>
                <div className="input-group">
                  <label>Project Name</label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                  />
                </div>
                {errorMessage && <p className="form-error">{errorMessage}</p>}
                <button className="btn green" disabled={saving}>
                  {saving ? "Saving..." : isEdit ? "Update" : "Save"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Project;