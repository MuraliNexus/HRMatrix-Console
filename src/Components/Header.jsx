import {
  BsHouse,
  BsPeople,
  BsBuilding,
  BsFolder,
  BsBarChart,
} from "react-icons/bs";

function Header() {
  return (
    <header className="header">
      <div className="header-icons">
        <div className="header-icon-item" title="Home">
          <BsHouse size={20} />
        </div>
        <div className="header-icon-item" title="Employees">
          <BsPeople size={20} />
        </div>
        <div className="header-icon-item" title="Departments">
          <BsBuilding size={20} />
        </div>
        <div className="header-icon-item" title="Projects">
          <BsFolder size={20} />
        </div>
        <div className="header-icon-item" title="Reports">
          <BsBarChart size={20} />
        </div>
      </div>
    </header>
  );
}

export default Header;