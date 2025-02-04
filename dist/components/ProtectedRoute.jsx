"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_router_dom_1 = require("react-router-dom");
const AuthContext_1 = require("../contexts/AuthContext");
const LoadingSpinner_1 = __importDefault(require("./LoadingSpinner"));
const Error_1 = __importDefault(require("./Error"));
const ProtectedRoute = ({ children, requireAuth = true }) => {
    const { isAuthenticated, loading, error } = (0, AuthContext_1.useAuth)();
    const location = (0, react_router_dom_1.useLocation)();
    if (loading) {
        return <LoadingSpinner_1.default />;
    }
    if (error) {
        return (<Error_1.default message="Authentication error. Please try logging in again." type="component" retry={() => window.location.reload()}/>);
    }
    // If authentication is required and user is not authenticated
    if (requireAuth && !isAuthenticated) {
        // Redirect to login page while saving the attempted url
        return <react_router_dom_1.Navigate to="/login" state={{ from: location }} replace/>;
    }
    return <>{children}</>;
};
exports.default = ProtectedRoute;
