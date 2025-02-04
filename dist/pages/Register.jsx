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
const react_router_dom_1 = require("react-router-dom");
const react_query_1 = require("@tanstack/react-query");
const client_1 = __importDefault(require("../api/client"));
const Register = () => {
    const navigate = (0, react_router_dom_1.useNavigate)();
    const [searchParams] = (0, react_router_dom_1.useSearchParams)();
    const [form, setForm] = (0, react_1.useState)({
        name: searchParams.get('name') || '',
        email: searchParams.get('email') || '',
        username: '',
        password: '',
        gymId: ''
    });
    const [error, setError] = (0, react_1.useState)(null);
    const { data: gyms } = (0, react_query_1.useQuery)({
        queryKey: ['gyms'],
        queryFn: async () => {
            const response = await client_1.default.get('/api/gyms');
            return response.data;
        }
    });
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await client_1.default.post('/auth/register', form);
            navigate('/sends');
        }
        catch (err) {
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            }
            else {
                setError('Something went wrong. Please try again.');
            }
        }
    };
    const handleChange = (e) => {
        setForm(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };
    return (<div className="row justify-content-center">
      <div className="col-md-8 col-lg-6">
        <div className="card">
          <div className="card-body p-4">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label required-field">Name</label>
                <input type="text" name="name" className="form-control form-control-lg" placeholder="Samir" required value={form.name} onChange={handleChange} readOnly={!!searchParams.get('name')}/>
              </div>
              <div className="mb-3">
                <label className="form-label required-field">Email</label>
                <input type="email" name="email" className="form-control form-control-lg" placeholder="name@email.com" required value={form.email} onChange={handleChange} readOnly={!!searchParams.get('email')}/>
              </div>
              <div className="mb-3">
                <label className="form-label required-field">Username</label>
                <div className="input-group input-group-lg">
                  <span className="input-group-text">@</span>
                  <input type="text" name="username" className="form-control" required pattern="[A-Za-z0-9]{1,9}" title="Username must be 1-9 characters, letters and numbers only" placeholder="heysamir" value={form.username} onChange={handleChange}/>
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label required-field">Password</label>
                <input type="password" name="password" className="form-control form-control-lg" required placeholder="8-12 characters, letters, numbers, symbols allowed" value={form.password} onChange={handleChange}/>
              </div>
              <div className="mb-3">
                <label className="form-label required-field">Home Gym</label>
                <select name="gymId" className="form-select form-select-lg mb-2" value={form.gymId} onChange={handleChange} required>
                  <option value="">Select a gym</option>
                  {gyms?.map(gym => (<option key={gym.id} value={gym.id}>
                      {gym.name}
                    </option>))}
                </select>
              </div>
              {error && (<div className="alert alert-danger" role="alert">
                  {error}
                </div>)}
              <button type="submit" className="btn nav-link active bg-solo-purple w-100 py-3">
                Join
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>);
};
exports.default = Register;
