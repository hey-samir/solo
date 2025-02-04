"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const GoogleSignInButton_1 = __importDefault(require("../components/GoogleSignInButton"));
const Login = () => {
    return (<div className="min-h-screen flex flex-col bg-bg-primary">
      <main className="flex-grow flex items-start justify-center pt-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-extrabold text-text-primary">
              Welcome to Solo
            </h2>
            <p className="mt-2 text-sm text-text-secondary">
              Track your climbing progress
            </p>
          </div>
          <div className="flex justify-center">
            <GoogleSignInButton_1.default />
          </div>
        </div>
      </main>
      <footer className="py-4 text-center text-text-secondary text-sm">
        © {new Date().getFullYear()} Solo. All rights reserved.
      </footer>
    </div>);
};
exports.default = Login;
