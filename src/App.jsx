import { Routes, Route } from 'react-router-dom';
import Employee from './Components/Employee';
import Sidebar from './Components/Sidebar';
import Dashboard from './Components/Dashboard';
import Department from './Components/Department';
import Project from './Components/Project';
import Analytics from './Components/Analytics';
import '../src/Super.css'

function App() {
  return (
    <div className='grid-container'>
      <Sidebar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/employees" element={<Employee />} />
        <Route path="/departments" element={<Department />} />
        <Route path="/projects" element={<Project />} />
        <Route path="/analytics" element={<Analytics />} />
      </Routes>
    </div>
  )
}

export default App;
