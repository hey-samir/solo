"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerError = exports.NotFound = void 0;
const react_1 = __importDefault(require("react"));
const react_router_dom_1 = require("react-router-dom");
const ErrorPage = ({ code, message }) => {
    const navigate = (0, react_router_dom_1.useNavigate)();
    return (<div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-solo-purple mb-4">{code}</h1>
        <p className="text-text-primary mb-6">{message}</p>
        <button onClick={() => navigate(-1)} className="btn bg-solo-purple hover:bg-solo-purple-light text-white px-6 py-2 rounded">
          Go Back
        </button>
      </div>
    </div>);
};
const NotFound = () => (<ErrorPage code={404} message="Looks like this route's beta isn't set yet! Let's get you back on track. 🧗‍♂️"/>);
exports.NotFound = NotFound;
const ServerError = () => (<ErrorPage code={500} message="Our route setters are working on fixing this problem! Please try again later. 🪢"/>);
exports.ServerError = ServerError;
exports.default = ErrorPage;
