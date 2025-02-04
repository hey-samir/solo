"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Navbar;
const react_1 = __importDefault(require("react"));
const react_router_dom_1 = require("react-router-dom");
function Navbar() {
    const location = (0, react_router_dom_1.useLocation)();
    return (<nav className="navbar fixed-bottom">
      <div className="container-fluid">
        <ul className="navbar-nav w-100 d-flex flex-row justify-content-around">
          <li className="nav-item">
            <react_router_dom_1.Link to="/squads" className={`nav-link ${location.pathname === '/squads' ? 'active' : ''}`} aria-label="Squads">
              <i className="material-icons" style={{ fontSize: '28px' }}>group</i>
            </react_router_dom_1.Link>
          </li>
          <li className="nav-item">
            <react_router_dom_1.Link to="/standings" className={`nav-link ${location.pathname === '/standings' ? 'active' : ''}`} aria-label="Standings">
              <i className="material-icons" style={{ fontSize: '28px' }}>emoji_events</i>
            </react_router_dom_1.Link>
          </li>
          <li className="nav-item">
            <react_router_dom_1.Link to="/sends" className={`nav-link ${location.pathname === '/sends' ? 'active' : ''}`} aria-label="Sends">
              <i className="material-icons" style={{ fontSize: '28px' }}>arrow_circle_up</i>
            </react_router_dom_1.Link>
          </li>
          <li className="nav-item">
            <react_router_dom_1.Link to="/sessions" className={`nav-link ${location.pathname === '/sessions' ? 'active' : ''}`} aria-label="Sessions">
              <i className="material-icons" style={{ fontSize: '28px' }}>calendar_today</i>
            </react_router_dom_1.Link>
          </li>
          <li className="nav-item">
            <react_router_dom_1.Link to="/stats" className={`nav-link ${location.pathname === '/stats' ? 'active' : ''}`} aria-label="Stats">
              <i className="material-icons" style={{ fontSize: '28px' }}>bar_chart</i>
            </react_router_dom_1.Link>
          </li>
        </ul>
      </div>
    </nav>);
}
