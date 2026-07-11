import { useCallback, useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { BsPeopleFill, BsBuildingFill, BsFolderFill, BsArrowClockwise, BsExclamationTriangleFill } from 'react-icons/bs';

const BASE_URL = "http://localhost:8080/App";
const REQUEST_TIMEOUT = 4000;

function Dashboard() {
  const [counts, setCounts] = useState({ employees: 0, departments: 0, projects: 0 });
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [lastSynced, setLastSynced] = useState(null);

  const maxCount = Math.max(...Object.values(counts), 1);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const [empRes, deptRes, projRes] = await Promise.all([
        axios.get(`${BASE_URL}/employees`, { timeout: REQUEST_TIMEOUT }),
        axios.get(`${BASE_URL}/departments`, { timeout: REQUEST_TIMEOUT }),
        axios.get(`${BASE_URL}/projects`, { timeout: REQUEST_TIMEOUT }),
      ]);

      setCounts({
        employees: empRes.data.length,
        departments: deptRes.data.length,
        projects: projRes.data.length,
      });
      setEmployees(empRes.data);
      setLastSynced(new Date());
    } catch (error) {
      console.log("error fetching dashboard counts", error);
      setErrorMessage("Couldn't reach the backend. Check that the Spring Boot server is running.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadInitialDashboardData = async () => {
      try {
        const [empRes, deptRes, projRes] = await Promise.all([
          axios.get(`${BASE_URL}/employees`, { timeout: REQUEST_TIMEOUT }),
          axios.get(`${BASE_URL}/departments`, { timeout: REQUEST_TIMEOUT }),
          axios.get(`${BASE_URL}/projects`, { timeout: REQUEST_TIMEOUT }),
        ]);

        setCounts({
          employees: empRes.data.length,
          departments: deptRes.data.length,
          projects: projRes.data.length,
        });
        setEmployees(empRes.data);
        setLastSynced(new Date());
      } catch (error) {
        console.log("error fetching dashboard counts", error);
        setErrorMessage("Couldn't reach the backend. Check that the Spring Boot server is running.");
      } finally {
        setLoading(false);
      }
    };

    loadInitialDashboardData();
  }, []);

  const chartData = [
    { name: 'Employees', count: counts.employees, color: 'var(--accent)' },
    { name: 'Departments', count: counts.departments, color: 'var(--blue)' },
    { name: 'Projects', count: counts.projects, color: 'var(--success)' },
  ];

  // Real distribution computed from fetched employees — not fabricated
  const departmentDistribution = useMemo(() => {
    const map = {};
    employees.forEach((emp) => {
      const name = emp.department?.deptName || 'Unassigned';
      map[name] = (map[name] || 0) + 1;
    });
    return Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [employees]);

  const projectTeamSizes = useMemo(() => {
    const map = {};
    employees.forEach((emp) => {
      emp.projects?.forEach((project) => {
        map[project.projectName] = (map[project.projectName] || 0) + 1;
      });
    });
    return Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [employees]);

  // Real staffing rate — % of employees assigned to at least one project
  const staffing = useMemo(() => {
    const total = employees.length;
    const staffed = employees.filter((emp) => emp.projects && emp.projects.length > 0).length;
    const unstaffed = total - staffed;
    const percent = total === 0 ? 0 : Math.round((staffed / total) * 100);
    return { total, staffed, unstaffed, percent };
  }, [employees]);

  const unassignedDeptCount = useMemo(
    () => employees.filter((emp) => !emp.department).length,
    [employees]
  );

  const maxDeptCount = Math.max(...departmentDistribution.map((d) => d.count), 1);
  const maxProjectCount = Math.max(...projectTeamSizes.map((p) => p.count), 1);

  const statusLabel = errorMessage ? 'offline' : loading ? 'syncing' : 'live';
  const statusText = errorMessage ? 'Offline' : loading ? 'Syncing' : 'Live';

  return (
    <div className="main-container">
      <div className="main-title">
        <h1>
          Dashboard
          <span className={`status-dot ${statusLabel}`}>{statusText}</span>
        </h1>
        <div className="dashboard-actions">
          {lastSynced && !errorMessage && (
            <span className="last-synced">
              Synced {lastSynced.toLocaleTimeString()}
            </span>
          )}
          <button className="refresh-btn" onClick={fetchDashboardData} disabled={loading}>
            <BsArrowClockwise className={loading ? 'spin' : ''} />
            {loading ? 'Syncing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {errorMessage && <p className="form-error">{errorMessage}</p>}

      <div className="main-cards">
        <div className="card accent">
          <div className="card-inner">
            <div className="card-icon-wrap accent">
              <BsPeopleFill />
            </div>
            <p>Total Employees</p>
          </div>
          <h3>{loading ? '-' : counts.employees}</h3>
        </div>
        <div className="card blue">
          <div className="card-inner">
            <div className="card-icon-wrap blue">
              <BsBuildingFill />
            </div>
            <p>Departments</p>
          </div>
          <h3>{loading ? '-' : counts.departments}</h3>
        </div>
        <div className="card success">
          <div className="card-inner">
            <div className="card-icon-wrap success">
              <BsFolderFill />
            </div>
            <p>Projects</p>
          </div>
          <h3>{loading ? '-' : counts.projects}</h3>
        </div>
        {!loading && unassignedDeptCount > 0 && (
          <div className="card warning">
            <div className="card-inner">
              <div className="card-icon-wrap warning">
                <BsExclamationTriangleFill />
              </div>
              <p>No Department</p>
            </div>
            <h3>{unassignedDeptCount}</h3>
          </div>
        )}
      </div>

      <div className="charts">
        <div className="chart-card accent">
          <h3>Overview</h3>
          <div className="bar-chart" aria-label="Dashboard counts">
            {chartData.map((item) => (
              <div className="bar-row" key={item.name}>
                <span>{item.name}</span>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${(item.count / maxCount) * 100}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
                <strong>{loading ? '-' : item.count}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card success">
          <h3>Project Staffing</h3>
          <div className="donut-panel">
            <div className="donut-ring" style={{ '--percent': staffing.percent }}>
              <div className="donut-hole">
                <strong>{loading ? '-' : `${staffing.percent}%`}</strong>
                <span>Staffed</span>
              </div>
            </div>
            <div className="donut-legend">
              <div className="donut-legend-item">
                <span className="donut-legend-swatch accent"></span>
                On a project
                <strong>{loading ? '-' : staffing.staffed}</strong>
              </div>
              <div className="donut-legend-item">
                <span className="donut-legend-swatch track"></span>
                Unstaffed
                <strong>{loading ? '-' : staffing.unstaffed}</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="chart-card blue">
          <h3>Department Distribution</h3>
          {!loading && departmentDistribution.length === 0 && (
            <p className="chart-empty">No employees assigned to departments yet.</p>
          )}
          <div className="bar-chart">
            {departmentDistribution.map((item) => (
              <div className="bar-row" key={item.name}>
                <span>{item.name}</span>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${(item.count / maxDeptCount) * 100}%`,
                      background: 'linear-gradient(90deg, #2563eb, var(--blue))',
                    }}
                  />
                </div>
                <strong>{item.count}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card success">
          <h3>Project Team Sizes</h3>
          {!loading && projectTeamSizes.length === 0 && (
            <p className="chart-empty">No employees assigned to projects yet.</p>
          )}
          <div className="bar-chart">
            {projectTeamSizes.map((item) => (
              <div className="bar-row" key={item.name}>
                <span>{item.name}</span>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${(item.count / maxProjectCount) * 100}%`,
                      background: 'linear-gradient(90deg, #059669, var(--success))',
                    }}
                  />
                </div>
                <strong>{item.count}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
