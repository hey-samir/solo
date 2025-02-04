"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_router_dom_1 = require("react-router-dom");
const Navbar_1 = __importDefault(require("./Navbar"));
const Header_1 = __importDefault(require("./Header"));
const Layout = () => {
    console.log('Layout rendering'); // Debug log
    return (<div className="flex flex-col min-h-screen bg-bg-primary text-text-primary">
      <Header_1.default />
      <main className="flex-grow container mx-auto px-4 py-8">
        <react_router_dom_1.Outlet />
      </main>
      <Navbar_1.default />
    </div>);
};
exports.default = Layout;
