import { Link } from 'react-router-dom'
import logo from '../assets/rajaranilogo.png'
import './PageLayout.css'

export default function PageLayout({ title, subtitle, backTo = '/', children, actions }) {
  return (
    <div className="page-layout">
      <header className="page-header">
        <div className="page-header-main">
          <Link to={backTo} className="back-link">
            ← Back
          </Link>
          <div className="page-brand">
            <img src={logo} alt="Raja Rani Bakery & Restaurant" className="page-logo" />
            <div>
              <h1>{title}</h1>
              {subtitle ? <p className="page-subtitle">{subtitle}</p> : null}
            </div>
          </div>
        </div>
        {actions ? <div className="page-header-actions">{actions}</div> : null}
      </header>
      <div className="page-content">{children}</div>
    </div>
  )
}
