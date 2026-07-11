import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut, Pie } from 'react-chartjs-2';
import { BsArrowClockwise, BsFolderFill, BsGeoAltFill, BsGraphUp, BsPeopleFill } from 'react-icons/bs';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const BASE_URL = "http://localhost:8080/App";
const REQUEST_TIMEOUT = 4000;

const COLORS = {
  accent: '#22d3ee',
  blue: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  textPrimary: '#e6ebf3',
  textSecondary: '#93a1b8',
  borderSoft: '#1f2a3d',
  surfaceElevated: '#212b40',
};

const PALETTE = [COLORS.accent, COLORS.blue, COLORS.success, COLORS.warning, COLORS.danger, '#a78bfa', '#f472b6', '#fb923c'];

const tooltipStyle = {
  backgroundColor: COLORS.surfaceElevated,
  titleColor: COLORS.textPrimary,
  bodyColor: COLORS.textSecondary,
  borderColor: COLORS.borderSoft,
  borderWidth: 1,
  padding: 10,
  cornerRadius: 6,
};

const baseScale = {
  grid: { color: COLORS.borderSoft },
  ticks: { color: COLORS.textSecondary, font: { family: 'Inter', size: 11 }, precision: 0 },
};

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: tooltipStyle,
  },
  scales: {
    x: baseScale,
    y: { ...baseScale, beginAtZero: true },
  },
};

const horizontalBarOptions = {
  ...barOptions,
  indexAxis: 'y',
};

const stackedBarOptions = {
  ...barOptions,
  plugins: {
    legend: {
      position: 'top',
      labels: { color: COLORS.textSecondary, font: { family: 'Inter', size: 11 }, boxWidth: 12 },
    },
    tooltip: tooltipStyle,
  },
  scales: {
    x: { ...baseScale, stacked: true },
    y: { ...baseScale, stacked: true, beginAtZero: true },
  },
};

const pieOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right',
      labels: { color: COLORS.textSecondary, font: { family: 'Inter', size: 11 }, padding: 12, boxWidth: 12 },
    },
    tooltip: tooltipStyle,
  },
};

function Analytics() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const [empRes, deptRes, projRes] = await Promise.all([
        axios.get(`${BASE_URL}/employees`, { timeout: REQUEST_TIMEOUT }),
        axios.get(`${BASE_URL}/departments`, { timeout: REQUEST_TIMEOUT }),
        axios.get(`${BASE_URL}/projects`, { timeout: REQUEST_TIMEOUT }),
      ]);

      setEmployees(Array.isArray(empRes.data) ? empRes.data : []);
      setDepartments(Array.isArray(deptRes.data) ? deptRes.data : []);
      setProjects(Array.isArray(projRes.data) ? projRes.data : []);
    } catch (error) {
      console.log("error fetching analytics data", error);
      setEmployees([]);
      setDepartments([]);
      setProjects([]);
      setErrorMessage("Couldn't reach the backend. Check that the Spring Boot server is running.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [empRes, deptRes, projRes] = await Promise.all([
          axios.get(`${BASE_URL}/employees`, { timeout: REQUEST_TIMEOUT }),
          axios.get(`${BASE_URL}/departments`, { timeout: REQUEST_TIMEOUT }),
          axios.get(`${BASE_URL}/projects`, { timeout: REQUEST_TIMEOUT }),
        ]);

        setEmployees(Array.isArray(empRes.data) ? empRes.data : []);
        setDepartments(Array.isArray(deptRes.data) ? deptRes.data : []);
        setProjects(Array.isArray(projRes.data) ? projRes.data : []);
      } catch (error) {
        console.log("error fetching analytics data", error);
        setErrorMessage("Couldn't reach the backend. Check that the Spring Boot server is running.");
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const departmentDistribution = useMemo(() => {
    const counts = {};
    departments.forEach((dept) => {
      counts[dept.deptName || 'Unnamed department'] = 0;
    });
    employees.forEach((emp) => {
      const name = emp.department?.deptName || 'Unassigned';
      counts[name] = (counts[name] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [employees, departments]);

  const projectDistribution = useMemo(() => {
    const counts = {};
    projects.forEach((project) => {
      counts[project.projectName || 'Unnamed project'] = 0;
    });
    employees.forEach((emp) => {
      (emp.projects ?? []).forEach((project) => {
        const name = project.projectName || 'Unnamed project';
        counts[name] = (counts[name] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [employees, projects]);

  const cityDistribution = useMemo(() => {
    const counts = {};
    employees.forEach((emp) => {
      const city = emp.address?.city;
      if (city) counts[city] = (counts[city] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [employees]);

  const stateDistribution = useMemo(() => {
    const counts = {};
    employees.forEach((emp) => {
      const state = emp.address?.state;
      if (state) counts[state] = (counts[state] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [employees]);

  const assignmentBreakdown = useMemo(() => {
    const buckets = { '0 projects': 0, '1 project': 0, '2 projects': 0, '3+ projects': 0 };
    employees.forEach((emp) => {
      const total = emp.projects?.length || 0;
      if (total === 0) buckets['0 projects'] += 1;
      else if (total === 1) buckets['1 project'] += 1;
      else if (total === 2) buckets['2 projects'] += 1;
      else buckets['3+ projects'] += 1;
    });
    return Object.entries(buckets).map(([name, count]) => ({ name, count }));
  }, [employees]);

  const staffing = useMemo(() => {
    const total = employees.length;
    const staffed = employees.filter((emp) => (emp.projects ?? []).length > 0).length;
    return { staffed, unstaffed: total - staffed };
  }, [employees]);

  const departmentStaffing = useMemo(() => {
    const map = {};
    departments.forEach((dept) => {
      map[dept.deptName || 'Unnamed department'] = { staffed: 0, unstaffed: 0 };
    });
    employees.forEach((emp) => {
      const name = emp.department?.deptName || 'Unassigned';
      if (!map[name]) map[name] = { staffed: 0, unstaffed: 0 };
      if ((emp.projects ?? []).length > 0) map[name].staffed += 1;
      else map[name].unstaffed += 1;
    });
    const labels = Object.keys(map);
    return {
      labels,
      staffed: labels.map((label) => map[label].staffed),
      unstaffed: labels.map((label) => map[label].unstaffed),
    };
  }, [employees, departments]);

  const insights = useMemo(() => {
    const avgPerDept = departments.length ? (employees.length / departments.length).toFixed(1) : '0';
    const totalAssignments = projectDistribution.reduce((sum, project) => sum + project.count, 0);
    const avgTeamSize = projects.length ? (totalAssignments / projects.length).toFixed(1) : '0';
    const topDept = departmentDistribution.find((dept) => dept.count > 0);
    const uniqueCities = new Set(employees.map((emp) => emp.address?.city).filter(Boolean)).size;
    return { avgPerDept, avgTeamSize, topDept, uniqueCities };
  }, [employees, departments, projects, departmentDistribution, projectDistribution]);

  const makeBarData = (items, label, color) => ({
    labels: items.map((item) => item.name),
    datasets: [{ label, data: items.map((item) => item.count), backgroundColor: color, borderRadius: 4 }],
  });

  const makePieData = (items) => ({
    labels: items.map((item) => item.name),
    datasets: [{
      data: items.map((item) => item.count),
      backgroundColor: PALETTE,
      borderColor: COLORS.surfaceElevated,
      borderWidth: 2,
    }],
  });

  const assignmentBarData = makeBarData(assignmentBreakdown, 'Employees', COLORS.blue);
  const staffingDoughnutData = {
    labels: ['Staffed', 'Unstaffed'],
    datasets: [{
      data: [staffing.staffed, staffing.unstaffed],
      backgroundColor: [COLORS.accent, COLORS.borderSoft],
      borderColor: COLORS.surfaceElevated,
      borderWidth: 2,
    }],
  };
  const departmentStaffingData = {
    labels: departmentStaffing.labels,
    datasets: [
      { label: 'Staffed', data: departmentStaffing.staffed, backgroundColor: COLORS.success, borderRadius: 4 },
      { label: 'Unstaffed', data: departmentStaffing.unstaffed, backgroundColor: COLORS.borderSoft, borderRadius: 4 },
    ],
  };

  const hasAssignments = employees.length > 0;
  const hasStaffingData = staffing.staffed > 0 || staffing.unstaffed > 0;

  return (
    <div className="main-container">
      <div className="main-title">
        <h1>Analytics</h1>
        <button className="refresh-btn" onClick={fetchAll} disabled={loading}>
          <BsArrowClockwise className={loading ? 'spin' : ''} />
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {errorMessage && <p className="form-error">{errorMessage}</p>}

      <div className="main-cards">
        <div className="card accent">
          <div className="card-inner">
            <div className="card-icon-wrap accent"><BsPeopleFill /></div>
            <p>Avg / Department</p>
          </div>
          <h3>{loading ? '-' : insights.avgPerDept}</h3>
        </div>
        <div className="card blue">
          <div className="card-inner">
            <div className="card-icon-wrap blue"><BsFolderFill /></div>
            <p>Avg Team Size</p>
          </div>
          <h3>{loading ? '-' : insights.avgTeamSize}</h3>
        </div>
        <div className="card success">
          <div className="card-inner">
            <div className="card-icon-wrap success"><BsGraphUp /></div>
            <p>Top Department</p>
          </div>
          <h3 className="card-text-value">{loading ? '-' : insights.topDept?.name || 'N/A'}</h3>
        </div>
        <div className="card warning">
          <div className="card-inner">
            <div className="card-icon-wrap warning"><BsGeoAltFill /></div>
            <p>Cities Represented</p>
          </div>
          <h3>{loading ? '-' : insights.uniqueCities}</h3>
        </div>
      </div>

      <div className="charts">
        <ChartCard title="Employees by Department" tone="accent" hasData={departmentDistribution.length > 0} emptyText="No department data yet.">
          <Bar data={makeBarData(departmentDistribution, 'Employees', COLORS.accent)} options={barOptions} />
        </ChartCard>

        <ChartCard title="Department Share" tone="blue" hasData={departmentDistribution.some((dept) => dept.count > 0)} emptyText="No department share to show yet.">
          <Doughnut data={makePieData(departmentDistribution)} options={pieOptions} />
        </ChartCard>

        <ChartCard title="Project Team Sizes" tone="success" hasData={projectDistribution.length > 0} emptyText="No project data yet.">
          <Bar data={makeBarData(projectDistribution, 'Team size', COLORS.success)} options={barOptions} />
        </ChartCard>

        <ChartCard title="Project Staffing Rate" tone="accent" hasData={hasStaffingData} emptyText="No employee staffing data yet.">
          <Doughnut data={staffingDoughnutData} options={pieOptions} />
        </ChartCard>

        <ChartCard title="Team Assignment Breakdown" tone="warning" hasData={hasAssignments} emptyText="No employee assignment data yet.">
          <Bar data={assignmentBarData} options={barOptions} />
        </ChartCard>

        <ChartCard title="Employees by City (Top 8)" tone="blue" hasData={cityDistribution.length > 0} emptyText="No city data yet.">
          <Bar data={makeBarData(cityDistribution, 'Employees', COLORS.warning)} options={horizontalBarOptions} />
        </ChartCard>

        <ChartCard title="Employees by State" tone="success" hasData={stateDistribution.length > 0} emptyText="No state data yet.">
          <Pie data={makePieData(stateDistribution)} options={pieOptions} />
        </ChartCard>

        <ChartCard title="Staffing Breakdown by Department" tone="danger" wide hasData={departmentStaffing.labels.length > 0} emptyText="No department staffing data yet.">
          <Bar data={departmentStaffingData} options={stackedBarOptions} />
        </ChartCard>
      </div>
    </div>
  );
}

function ChartCard({ title, tone, wide = false, hasData, emptyText, children }) {
  return (
    <div className={`chart-card ${tone} ${wide ? 'chart-card-wide' : ''}`}>
      <h3>{title}</h3>
      {hasData ? (
        <div className={`chart-canvas-wrap ${wide ? 'chart-canvas-wrap-wide' : ''}`}>
          {children}
        </div>
      ) : (
        <p className="chart-empty">{emptyText}</p>
      )}
    </div>
  );
}

export default Analytics;
