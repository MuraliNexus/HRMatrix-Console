import { NavLink } from 'react-router-dom';
import { BsSpeedometer2, BsPeople, BsBuilding, BsFolder, BsGraphUp } from 'react-icons/bs';

function Sidebar() {
  return (
    <aside id="sidebar">
      <div className="sidebar-title">
        <div className="sidebar-brand">HRMatrix</div>
        <span className="close_icon">X</span>
      </div>

      <ul className="sidebar-list">
        <li className="sidebar-list-item">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
            <BsSpeedometer2 className="icon" />
            Dashboard
          </NavLink>
        </li>
        <li className="sidebar-list-item">
          <NavLink to="/employees" className={({ isActive }) => (isActive ? 'active' : '')}>
            <BsPeople className="icon" />
            Employees
          </NavLink>
        </li>
        <li className="sidebar-list-item">
          <NavLink to="/departments" className={({ isActive }) => (isActive ? 'active' : '')}>
            <BsBuilding className="icon" />
            Departments
          </NavLink>
        </li>
        <li className="sidebar-list-item">
          <NavLink to="/projects" className={({ isActive }) => (isActive ? 'active' : '')}>
            <BsFolder className="icon" />
            Projects
          </NavLink>
        </li>
        <li className="sidebar-list-item">
          <NavLink to="/analytics" className={({ isActive }) => (isActive ? 'active' : '')}>
            <BsGraphUp className="icon" />
            Analytics
          </NavLink>
        </li>
      </ul>
    </aside>
  );
}

export default Sidebar;
