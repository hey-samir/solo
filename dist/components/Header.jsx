"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const react_router_dom_1 = require("react-router-dom");
const AuthContext_1 = require("../contexts/AuthContext");
const Header = () => {
    console.log('Header component rendering'); // Debug log
    const [isMenuOpen, setIsMenuOpen] = (0, react_1.useState)(false);
    const { isAuthenticated, user, logout } = (0, AuthContext_1.useAuth)();
    const handleLogout = async () => {
        await logout();
        setIsMenuOpen(false);
    };
    return (<>
      <header className="bg-solo-purple">
        <div className="header-container d-flex justify-content-between align-items-center px-3 py-2">
          <react_router_dom_1.Link to="/" className="d-inline-block">
            <img src="/attached_assets/solo.png" alt="Solo Logo" className="header-logo" height="50"/>
          </react_router_dom_1.Link>
          <div className="d-flex align-items-center">
            <button className="btn menu-toggle" type="button" onClick={() => setIsMenuOpen(true)} aria-label="Open menu">
              <i className="material-icons">menu</i>
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar Menu */}
      <div className={`offcanvas offcanvas-end ${isMenuOpen ? 'show' : ''}`} tabIndex={-1} id="menuSidebar">
        <div className="offcanvas-header">
          <button type="button" className="btn-close text-white" onClick={() => setIsMenuOpen(false)} aria-label="Close menu"/>
        </div>
        <div className="offcanvas-body px-3 pt-0">
          <div className="list-group list-group-flush">
            <react_router_dom_1.Link to={isAuthenticated ? `/profile` : `/profile/@gosolonyc`} className="list-group-item list-group-item-action d-flex align-items-center bg-transparent border-0 text-white" onClick={() => setIsMenuOpen(false)}>
              <i className="material-icons">mood</i>
              <span className="ms-3">Profile</span>
            </react_router_dom_1.Link>

            <react_router_dom_1.Link to="/about" className="list-group-item list-group-item-action d-flex align-items-center bg-transparent border-0 text-white" onClick={() => setIsMenuOpen(false)}>
              <i className="material-icons">help</i>
              <span className="ms-3">About</span>
            </react_router_dom_1.Link>

            <react_router_dom_1.Link to="/feedback" className="list-group-item list-group-item-action d-flex align-items-center bg-transparent border-0 text-white" onClick={() => setIsMenuOpen(false)}>
              <i className="material-icons">rate_review</i>
              <span className="ms-3">Feedback</span>
            </react_router_dom_1.Link>

            <react_router_dom_1.Link to="/pricing" className="list-group-item list-group-item-action d-flex align-items-center bg-transparent border-0 text-white" onClick={() => setIsMenuOpen(false)}>
              <i className="material-icons">star</i>
              <span className="ms-3">Solo PRO</span>
            </react_router_dom_1.Link>

            {isAuthenticated ? (<button onClick={handleLogout} className="list-group-item list-group-item-action d-flex align-items-center bg-transparent border-0 text-white">
                <i className="material-icons">logout</i>
                <span className="ms-3">Logout</span>
              </button>) : (<react_router_dom_1.Link to="/login" className="list-group-item list-group-item-action d-flex align-items-center bg-transparent border-0 text-white" onClick={() => setIsMenuOpen(false)}>
                <i className="material-icons">login</i>
                <span className="ms-3">Login</span>
              </react_router_dom_1.Link>)}
          </div>
        </div>
      </div>

      {/* Backdrop */}
      {isMenuOpen && (<div className="offcanvas-backdrop fade show" onClick={() => setIsMenuOpen(false)}/>)}
    </>);
};
exports.default = Header;
