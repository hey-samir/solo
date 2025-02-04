"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_router_dom_1 = require("react-router-dom");
const Layout_1 = __importDefault(require("./components/Layout"));
const ProtectedRoute_1 = __importDefault(require("./components/ProtectedRoute"));
const NotFound_1 = __importDefault(require("./pages/NotFound"));
const ErrorPage_1 = __importDefault(require("./pages/ErrorPage"));
// Import pages
const About_1 = __importDefault(require("./pages/About"));
const Login_1 = __importDefault(require("./pages/Login"));
const Register_1 = __importDefault(require("./pages/Register"));
const Squads_1 = __importDefault(require("./pages/Squads"));
const Standings_1 = __importDefault(require("./pages/Standings"));
const Sends_1 = __importDefault(require("./pages/Sends"));
const Sessions_1 = __importDefault(require("./pages/Sessions"));
const Stats_1 = __importDefault(require("./pages/Stats"));
const Profile_1 = __importDefault(require("./pages/Profile"));
const Pricing_1 = __importDefault(require("./pages/Pricing"));
const Feedback_1 = __importDefault(require("./pages/Feedback"));
const Router = () => {
    console.log('Router component rendering...'); // Debug log
    return (<react_router_dom_1.Routes>
      <react_router_dom_1.Route path="/" element={<Layout_1.default />}>
        {/* Public Routes */}
        <react_router_dom_1.Route index element={<react_router_dom_1.Navigate to="/about" replace/>}/>
        <react_router_dom_1.Route path="/about" element={<About_1.default />}/>
        <react_router_dom_1.Route path="/login" element={<Login_1.default />}/>
        <react_router_dom_1.Route path="/signup" element={<Register_1.default />}/>
        <react_router_dom_1.Route path="/pricing" element={<Pricing_1.default />}/>
        <react_router_dom_1.Route path="/feedback" element={<Feedback_1.default />}/>

        {/* Public Squad Routes */}
        <react_router_dom_1.Route path="/squads" element={<Squads_1.default />}/>
        <react_router_dom_1.Route path="/standings" element={<Standings_1.default />}/>

        {/* Protected Routes */}
        <react_router_dom_1.Route path="/sends" element={<ProtectedRoute_1.default>
              <Sends_1.default />
            </ProtectedRoute_1.default>}/>
        <react_router_dom_1.Route path="/sessions" element={<ProtectedRoute_1.default>
              <Sessions_1.default />
            </ProtectedRoute_1.default>}/>
        <react_router_dom_1.Route path="/stats" element={<ProtectedRoute_1.default>
              <Stats_1.default />
            </ProtectedRoute_1.default>}/>

        <react_router_dom_1.Route path="/profile" element={<Profile_1.default />}/>
        <react_router_dom_1.Route path="/profile/:username" element={<Profile_1.default />}/>

        {/* Error Routes */}
        <react_router_dom_1.Route path="/server-error" element={<ErrorPage_1.default />}/>
        <react_router_dom_1.Route path="*" element={<NotFound_1.default />}/>
      </react_router_dom_1.Route>
    </react_router_dom_1.Routes>);
};
exports.default = Router;
