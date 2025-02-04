"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const GoogleSignInButton_1 = __importDefault(require("./GoogleSignInButton"));
const Login = () => {
    return (<div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to Solo
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Track your climbing progress and connect with other climbers
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <div className="flex flex-col items-center gap-4">
            <GoogleSignInButton_1.default />
          </div>
        </div>
      </div>
    </div>);
};
exports.default = Login;
