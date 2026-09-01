import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Search, Orbit, History, FlaskConical,
  ShieldAlert, BookOpen
} from 'lucide-react'

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="oil-badge">
          <span className="oil-tag">OIL INDIA LIMITED</span>
          <span className="sih-tag">SIH26165</span>
        </div>
        <h1>🛡 SENTINEL-<span>X</span></h1>
        <p>Precursor Intelligence Engine</p>
        <div className="sidebar-status">
          <span className="status-dot"></span>
          <span>AUTONOMOUS SURVEILLANCE • IOGP-459</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`} end>
          <LayoutDashboard /> Command Center
        </NavLink>
        <NavLink to="/analyze" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
          <Search /> Report Intelligence (NLP)
        </NavLink>
        <NavLink to="/universe" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
          <Orbit /> Risk Universe (Graph)
        </NavLink>
        <NavLink to="/timeline" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
          <History /> Safety Time Machine
        </NavLink>
        <NavLink to="/simulator" className={({isActive}) => `nav-link ${isActive ? 'active violet' : ''}`}>
          <FlaskConical /> Intervention Simulator
        </NavLink>
        <NavLink to="/rules" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
          <BookOpen /> IOGP Safety Rules
        </NavLink>
      </nav>
    </aside>
  )
}
