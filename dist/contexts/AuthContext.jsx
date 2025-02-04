"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthProvider = exports.useAuth = void 0;
const react_1 = require("react");
const client_1 = __importDefault(require("../api/client"));
const AuthContext = (0, react_1.createContext)(null);
const useAuth = () => {
    const context = (0, react_1.useContext)(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
exports.useAuth = useAuth;
// Development demo user matching our seeded data
const demoUser = {
    id: 4, // From our SQL query
    username: 'gosolonyc',
    email: 'demo@soloapp.dev',
    memberSince: new Date(),
    profilePhoto: '/static/images/avatar-purple.svg'
};
// Toggle this flag to enable/disable authentication
const BYPASS_AUTH = true;
const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = (0, react_1.useState)(BYPASS_AUTH);
    const [user, setUser] = (0, react_1.useState)(BYPASS_AUTH ? demoUser : null);
    const [loading, setLoading] = (0, react_1.useState)(!BYPASS_AUTH);
    (0, react_1.useEffect)(() => {
        const checkAuth = async () => {
            if (BYPASS_AUTH) {
                setIsAuthenticated(true);
                setUser(demoUser);
                setLoading(false);
                return;
            }
            try {
                const response = await client_1.default.get('/auth/current-user');
                if (response.data) {
                    setUser(response.data);
                    setIsAuthenticated(true);
                }
            }
            catch (error) {
                setUser(null);
                setIsAuthenticated(false);
            }
            finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, []);
    const logout = async () => {
        if (BYPASS_AUTH) {
            console.log('Logout bypassed in development mode');
            return;
        }
        try {
            await client_1.default.get('/auth/logout');
            setUser(null);
            setIsAuthenticated(false);
            window.location.href = '/';
        }
        catch (error) {
            console.error('Logout failed:', error);
        }
    };
    return (<AuthContext.Provider value={{ isAuthenticated, user, logout, loading }}>
      {children}
    </AuthContext.Provider>);
};
exports.AuthProvider = AuthProvider;
