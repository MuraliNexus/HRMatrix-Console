import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

const BASE_URL = "http://localhost:8080/App";
const REQUEST_TIMEOUT = 4000;

const emptyUser = {
  empName: "",
  deptId: "",
  projectIds: [],
  city: "",
  state: "",
};

const emptyFilters = {
  name: "",
  departName: "",
  city: "",
  state: "",
  projectName: "",
};

// sortBy values use dot-notation for nested entity fields (department.deptName,
// address.city, address.state). This relies on your Specification-based Sort
// being able to resolve joins via Hibernate's Criteria API. If sorting by
// Department/City/State throws a backend error, the Specification's Sort
// handling may need an explicit join — flag it and we can fix the backend side.
const SORT_OPTIONS = [
  { value: 'id', label: 'ID' },
  { value: 'name', label: 'Name' },
  { value: 'department.deptName', label: 'Department' },
  { value: 'address.city', label: 'City' },
  { value: 'address.state', label: 'State' },
];

function Employee() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [projects, setProjects] = useState([]);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [isModalOpen, setModalOpen] = useState(false);
  const [userData, setUserData] = useState(emptyUser);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);

  const [filters, setFilters] = useState(emptyFilters);
  const [sortBy, setSortBy] = useState('id');
  const [sortDir, setSortDir] = useState('ASC');
  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [hasNextPage, setHasNextPage] = useState(false);

  // Departments and projects fetched once, used to render dropdown options
  // dynamically — this is what actually fixes the "4 projects but only 3
  // show in dropdown" bug, since the options now come from real data instead
  // of being typed by hand.
  useEffect(() => {
    const fetchLookups = async () => {
      try {
        const [deptRes, projRes] = await Promise.all([
          axios.get(`${BASE_URL}/departments`, { timeout: REQUEST_TIMEOUT }),
          axios.get(`${BASE_URL}/projects`, { timeout: REQUEST_TIMEOUT }),
        ]);
        setDepartments(deptRes.data);
        setProjects(projRes.data);
      } catch (error) {
        console.log("error fetching departments/projects", error);
      }
    };
    fetchLookups();
  }, []);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    const params = { pageSize, pageNo, sortBy, sortDir };
    if (filters.name) params.name = filters.name;
    if (filters.departName) params.departName = filters.departName;
    if (filters.city) params.city = filters.city;
    if (filters.state) params.state = filters.state;
    if (filters.projectName) params.projectName = filters.projectName;

    try {
      const response = await axios.get(`${BASE_URL}/filter`, {
        params,
        timeout: REQUEST_TIMEOUT,
      });
      setEmployees(response.data);
      // The /filter endpoint doesn't return a total count, so "is there a
      // next page" is inferred: if this page came back full, assume more
      // might exist. Not perfectly accurate on the exact last page boundary,
      // but avoids an extra backend change for this to work.
      setHasNextPage(response.data.length === pageSize);
    } catch (error) {
      console.log("error fetching employees", error);
      setErrorMessage("Couldn't load employees. Check that the backend is running.");
    } finally {
      setLoading(false);
    }
  }, [pageSize, pageNo, sortBy, sortDir, filters]);

  useEffect(() => {
    // Debounce so typing in a filter field doesn't fire a request per keystroke
    const timeoutId = setTimeout(() => {
      fetchEmployees();
    }, 350);
    return () => clearTimeout(timeoutId);
  }, [fetchEmployees]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPageNo(1); // any filter change resets back to page 1
  };

  const handleSortByChange = (e) => {
    setSortBy(e.target.value);
    setPageNo(1);
  };

  const toggleSortDir = () => {
    setSortDir((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'));
    setPageNo(1);
  };

  const clearFilters = () => {
    setFilters(emptyFilters);
    setPageNo(1);
  };

  const handleDelete = async (id) => {
    const isConfirm = window.confirm("Are you sure you want to delete this user?");
    if (!isConfirm) return;

    try {
      await axios.delete(`${BASE_URL}/employee/${id}`);
      fetchEmployees();
    } catch (error) {
      console.log("Error in deleting", error);
      window.alert("Employee could not be deleted. Please try again.");
    }
  };

  const handleAddRecord = () => {
    setIsEdit(false);
    setEditId(null);
    setUserData(emptyUser);
    setModalOpen(true);
  };

  const close = () => {
    setModalOpen(false);
  };

  const handleData = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProjects = (e) => {
    const selectedProjects = Array.from(
      e.target.selectedOptions,
      (option) => Number(option.value)
    );

    setUserData((prev) => ({
      ...prev,
      projectIds: selectedProjects,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isEdit) {
        await axios.put(`${BASE_URL}/employee/${editId}`, userData, {
          headers: { "Content-Type": "application/json" },
        });
        setIsEdit(false);
        setEditId(null);
      } else {
        await axios.post(`${BASE_URL}/employee`, userData, {
          headers: { "Content-Type": "application/json" },
        });
      }
      fetchEmployees();
    } catch (err) {
      console.log("err msg", err);
      window.alert("Employee could not be saved. Please check the form and try again.");
    }

    close();
  };

  const handleEdit = (emp) => {
    setIsEdit(true);
    setEditId(emp.id);
    setUserData({
      empName: emp.name ?? "",
      deptId: emp.department?.id ?? "",
      projectIds: (emp.projects ?? []).map((project) => project.id),
      city: emp.address?.city ?? "",
      state: emp.address?.state ?? "",
    });
    setModalOpen(true);
  };

  return (
    <div className="main-container">
      <div className="container">
        <div className="main-title">
          <h3 style={{ border: 'none', padding: 0, margin: 0 }}>Employees Records</h3>
          <button className="btn green" onClick={handleAddRecord}>Add Record</button>
        </div>

        <div className="filter-panel">
          <div className="filter-field">
            <label>Name</label>
            <input
              type="text"
              name="name"
              placeholder="Search by name"
              value={filters.name}
              onChange={handleFilterChange}
            />
          </div>

          <div className="filter-field">
            <label>Department</label>
            <select name="departName" value={filters.departName} onChange={handleFilterChange}>
              <option value="">All departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.deptName}>{dept.deptName}</option>
              ))}
            </select>
          </div>

          <div className="filter-field">
            <label>City</label>
            <input
              type="text"
              name="city"
              placeholder="Search by city"
              value={filters.city}
              onChange={handleFilterChange}
            />
          </div>

          <div className="filter-field">
            <label>State</label>
            <input
              type="text"
              name="state"
              placeholder="Search by state"
              value={filters.state}
              onChange={handleFilterChange}
            />
          </div>

          <div className="filter-field">
            <label>Project</label>
            <select name="projectName" value={filters.projectName} onChange={handleFilterChange}>
              <option value="">All projects</option>
              {projects.map((project) => (
                <option key={project.id} value={project.projectName}>{project.projectName}</option>
              ))}
            </select>
          </div>

          <div className="filter-field">
            <label>Sort by</label>
            <select value={sortBy} onChange={handleSortByChange}>
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="filter-field">
            <label>&nbsp;</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" className="sort-toggle" onClick={toggleSortDir}>
                {sortDir === 'ASC' ? '↑ Ascending' : '↓ Descending'}
              </button>
              <button type="button" className="page-btn" onClick={clearFilters}>
                Clear
              </button>
            </div>
          </div>
        </div>

        {errorMessage && <p className="form-error">{errorMessage}</p>}

        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Department</th>
              <th>City</th>
              <th>State</th>
              <th>Projects</th>
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td className="table-message" colSpan="8">Loading employees...</td>
              </tr>
            )}
            {!loading && employees.length === 0 && (
              <tr>
                <td className="table-message" colSpan="8">No employees found.</td>
              </tr>
            )}
            {!loading && employees.map((emp) => (
              <tr key={emp.id}>
                <td>{emp.id}</td>
                <td>{emp.name}</td>
                <td>{emp.department?.deptName}</td>
                <td>{emp.address?.city}</td>
                <td>{emp.address?.state}</td>
                <td>
                  {(emp.projects ?? []).map((project) => (
                    <button key={project.id} className="project">
                      {project.projectName}
                    </button>
                  ))}
                </td>
                <td>
                  <button className="btn green" onClick={() => handleEdit(emp)}>Edit</button>
                </td>
                <td>
                  <button className="btn red" onClick={() => handleDelete(emp.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pagination">
          <span className="pagination-info">
            Page {pageNo} · {pageSize} per page
          </span>
          <div className="pagination-controls">
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPageNo(1); }}
            >
              <option value={5}>5 / page</option>
              <option value={10}>10 / page</option>
              <option value={25}>25 / page</option>
              <option value={50}>50 / page</option>
            </select>
            <button
              className="page-btn"
              onClick={() => setPageNo((p) => Math.max(1, p - 1))}
              disabled={pageNo === 1 || loading}
            >
              ← Prev
            </button>
            <button
              className="page-btn"
              onClick={() => setPageNo((p) => p + 1)}
              disabled={!hasNextPage || loading}
            >
              Next →
            </button>
          </div>
        </div>

        {isModalOpen && (
          <div className="modal">
            <div className="modal-content">
              <span className="close" onClick={close}>X</span>
              <h2>Employee Record</h2>

              <form onSubmit={handleSubmit}>
                <div className="input-group">
                  <label>Name</label>
                  <input
                    type="text"
                    name="empName"
                    value={userData.empName}
                    onChange={handleData}
                  />
                </div>

                <div className="input-group">
                  <label>Department</label>
                  <select name="deptId" value={userData.deptId} onChange={handleData}>
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>{dept.deptName}</option>
                    ))}
                  </select>
                </div>

                <div className="input-group">
                  <label>Projects</label>
                  <select
                    multiple
                    name="projectIds"
                    value={userData.projectIds}
                    onChange={handleProjects}
                  >
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>{project.projectName}</option>
                    ))}
                  </select>
                </div>

                <div className="input-group">
                  <label>City</label>
                  <input type="text" name="city" value={userData.city} onChange={handleData} />
                </div>

                <div className="input-group">
                  <label>State</label>
                  <input type="text" name="state" value={userData.state} onChange={handleData} />
                </div>

                <button className="btn green">
                  {isEdit ? "Update Record" : "Save Record"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Employee;
