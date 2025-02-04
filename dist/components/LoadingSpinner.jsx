"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const LoadingSpinner = ({ size = 'md' }) => {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-8 w-8',
        lg: 'h-12 w-12'
    };
    return (<div className="flex justify-center items-center h-32">
      <div className={`animate-spin rounded-full border-t-2 border-b-2 border-purple-500 ${sizeClasses[size]}`}></div>
    </div>);
};
exports.default = LoadingSpinner;
