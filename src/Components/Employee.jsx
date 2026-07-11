import { useEffect, useState } from 'react';
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

function Employee() {
  const [employees, setEmployees] = useState([]);
  const [filterUser, setFilterUser] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(emptyUser);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    const fetchUrl = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/employees`, { timeout: REQUEST_TIMEOUT });
        setEmployees(response.data);
        setFilterUser(response.data);
      } catch (error) {
        console.log("error", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUrl();
  }, []);

  const handleSearchChange = (e) => {
    const searchText = e.target.value.toLowerCase();
    const filteredEmployees = employees.filter((emp) =>
      (emp.name ?? '').toLowerCase().includes(searchText) ||
      String(emp.age ?? '').includes(searchText) ||
      (emp.department?.deptName ?? '').toLowerCase().includes(searchText) ||
      (emp.address?.city ?? '').toLowerCase().includes(searchText) ||
      (emp.address?.state ?? '').toLowerCase().includes(searchText) ||
      (emp.projects ?? []).some((project) =>
        (project.projectName ?? '').toLowerCase().includes(searchText)
      )
    );

    setFilterUser(filteredEmployees);
  };

  const handleDelete = async (id) => {
    const isConfirm = window.confirm("Are you sure you want to delete this user?");
    if (!isConfirm) return;

    try {
      await axios.delete(`${BASE_URL}/employee/${id}`);
      setEmployees((prevEmployees) => prevEmployees.filter((emp) => emp.id !== id));
      setFilterUser((prevUsers) => prevUsers.filter((emp) => emp.id !== id));
    } catch (error) {
      console.log("Error in deleting", error);
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
        const response = await axios.put(`${BASE_URL}/employee/${editId}`, userData);

        setEmployees((prevEmployees) =>
          prevEmployees.map((emp) => (emp.id === editId ? response.data : emp))
        );
        setFilterUser((prevUsers) =>
          prevUsers.map((emp) => (emp.id === editId ? response.data : emp))
        );
        setIsEdit(false);
        setEditId(null);
      } else {
        const response = await axios.post(`${BASE_URL}/employee`, userData);
        setEmployees((prevEmployees) => [...prevEmployees, response.data]);
        setFilterUser((prevUsers) => [...prevUsers, response.data]);
      }
    } catch (err) {
      console.log("err msg", err);
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
        <h3>Employees Records</h3>

        <div className="input-search">
          <input type="search" placeholder="search text here" onChange={handleSearchChange} />
          <button className="btn green" onClick={handleAddRecord}>Add Record</button>
        </div>

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
            {!loading && filterUser.length === 0 && (
              <tr>
                <td className="table-message" colSpan="8">No employees found.</td>
              </tr>
            )}
            {!loading && filterUser.map((emp) => (
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
                    <option value="1">IT</option>
                    <option value="2">HR</option>
                    <option value="3">Finance</option>
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
                    <option value="1">Banking App</option>
                    <option value="2">College App</option>
                    <option value="3">HR System</option>
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
