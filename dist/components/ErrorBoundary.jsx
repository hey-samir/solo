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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const Error_1 = __importDefault(require("./Error"));
class ErrorBoundary extends react_1.Component {
    constructor() {
        super(...arguments);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }
    static getDerivedStateFromError(error) {
        return {
            hasError: true,
            error,
            errorInfo: null
        };
    }
    componentDidCatch(error, errorInfo) {
        // Log error details to console in development
        if (process.env.NODE_ENV === 'development') {
            console.group('React Error Boundary Caught Error:');
            console.error('Error:', error);
            console.error('Component Stack:', errorInfo.componentStack);
            console.error('Error Stack:', error.stack);
            console.groupEnd();
        }
        this.setState({
            error,
            errorInfo
        });
        // Here you could also send to an error tracking service
        // if implemented in the future
    }
    render() {
        if (this.state.hasError) {
            // Get the component name from the error stack if possible
            const componentMatch = this.state.errorInfo?.componentStack
                .split('\n')[1]
                ?.match(/in ([A-Za-z0-9]+)/);
            const componentName = componentMatch ? componentMatch[1] : 'component';
            const errorMessage = process.env.NODE_ENV === 'development'
                ? `${this.state.error?.message || 'Something went wrong'}\n\nComponent: ${componentName}`
                : "Looks like this route's beta isn't working! Our route setters are on it! 🧗‍♂️";
            return (<Error_1.default message={errorMessage} type="page" retry={() => {
                    this.setState({
                        hasError: false,
                        error: null,
                        errorInfo: null
                    });
                }}/>);
        }
        return this.props.children;
    }
}
exports.default = ErrorBoundary;
