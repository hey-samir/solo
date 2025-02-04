"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = __importDefault(require("../server"));
async function deploy() {
    try {
        const PORT = parseInt(process.env.PORT || '80', 10);
        console.log(`Starting server on port ${PORT}`);
        server_1.default.listen(PORT, '0.0.0.0', () => {
            console.log(`Server is running on http://0.0.0.0:${PORT}`);
        });
    }
    catch (error) {
        console.error('Deployment failed:', error);
        process.exit(1);
    }
}
if (require.main === module) {
    deploy();
}
exports.default = deploy;
//# sourceMappingURL=deploy.js.map