import { useEffect, useState } from 'react';
import axios from 'axios';

const BASE_URL = "http://localhost:8080/App";
const REQUEST_TIMEOUT = 4000;

function Department() {
  const [departments, setDepartments] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [deptName, setDeptName] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/departments`, { timeout: REQUEST_TIMEOUT });
        setDepartments(response.data);
        setFilteredDepartments(response.data);
      } catch (error) {
        console.log("error", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  const handleSearchChange = (e) => {
    const searchText = e.target.value.toLowerCase();
    const filtered = departments.filter((dept) =>
      dept.deptName.toLowerCase().includes(searchText)
    );
    setFilteredDepartments(filtered);
  };

  const handleAdd = () => {
    setIsEdit(false);
    setEditId(null);
    setDeptName("");
    setErrorMessage("");
    setModalOpen(true);
  };

  const handleEdit = (dept) => {
    setIsEdit(true);
    setEditId(dept.id);
    setDeptName(dept.deptName);
    setErrorMessage("");
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    const isConfirm = window.confirm("Are you sure you want to delete this department");
    if (!isConfirm) return;

    try {
      await axios.delete(`${BASE_URL}/department/${id}`);
      setDepartments((prev) => prev.filter((d) => d.id !== id));
      setFilteredDepartments((prev) => prev.filter((d) => d.id !== id));
    } catch (error) {
      console.log("error deleting department", error);
      window.alert("Department could not be deleted. It may still be linked to employees.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedDeptName = deptName.trim();
    if (!trimmedDeptName) {
      setErrorMessage("Department name is required.");
      return;
    }

    setSaving(true);
    setErrorMessage("");

    try {
      if (isEdit) {
        const response = await axios.put(
          `${BASE_URL}/department/${editId}`,
          { deptName: trimmedDeptName },
          { headers: { "Content-Type": "application/json" } }
        );
        setDepartments((prev) => prev.map((d) => (d.id === editId ? response.data : d)));
        setFilteredDepartments((prev) => prev.map((d) => (d.id === editId ? response.data : d)));
      } else {
        const response = await axios.post(
          `${BASE_URL}/department`,
          { deptName: trimmedDeptName },
          { headers: { "Content-Type": "application/json" } }
        );
        setDepartments((prev) => [...prev, response.data]);
        setFilteredDepartments((prev) => [...prev, response.data]);
      }

      setModalOpen(false);
    } catch (error) {
      console.log("error saving department", error);
      setErrorMessage("Department could not be saved. Please check the backend API and try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="main-container">
      <div className="container">
        <h3>Departments</h3>

        <div className="input-search">
          <input type="search" placeholder="search text here" onChange={handleSearchChange} />
          <button className="btn green" onClick={handleAdd}>Add Department</button>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Department Name</th>
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td className="table-message" colSpan="4">Loading departments...</td>
              </tr>
            )}
            {!loading && filteredDepartments.length === 0 && (
              <tr>
                <td className="table-message" colSpan="4">No departments found.</td>
              </tr>
            )}
            {!loading && filteredDepartments.map((dept) => (
              <tr key={dept.id}>
                <td>{dept.id}</td>
                <td>{dept.deptName}</td>
                <td>
                  <button className="btn green" onClick={() => handleEdit(dept)}>Edit</button>
                </td>
                <td>
                  <button className="btn red" onClick={() => handleDelete(dept.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {isModalOpen && (
          <div className="modal">
            <div className="modal-content">
              <span className="close" onClick={() => setModalOpen(false)}>X</span>
              <h2>{isEdit ? "Edit Department" : "New Department"}</h2>
              <form onSubmit={handleSubmit}>
                <div className="input-group">
                  <label>Department Name</label>
                  <input
                    type="text"
                    value={deptName}
                    onChange={(e) => setDeptName(e.target.value)}
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

export default Department;