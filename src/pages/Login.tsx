import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import client from '../api/client';

interface LoginForm {
  username: string;
  password: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<LoginForm>({
    username: '',
    password: ''
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await client.post('/auth/login', form);
      navigate('/sends');
    } catch (err) {
      setError('Whoops! That beta isn\'t matching our guidebook. Double-check and try again!');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-8 col-lg-6">
        <div className="card">
          <div className="card-body p-4">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fs-4">Username</label>
                <div className="input-group">
                  <span className="input-group-text">@</span>
                  <input
                    type="text"
                    name="username"
                    className="form-control form-control-lg"
                    required
                    pattern="[A-Za-z0-9]{1,10}"
                    title="Username must be 1-10 characters, letters and numbers only"
                    value={form.username}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label fs-4">Password</label>
                <input
                  type="password"
                  name="password"
                  className="form-control form-control-lg"
                  required
                  value={form.password}
                  onChange={handleChange}
                />
              </div>
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              <div className="d-flex gap-3">
                <button 
                  type="submit" 
                  className="btn nav-link active w-50" 
                  style={{ backgroundColor: '#313d58' }}
                >
                  Login
                </button>
                <Link 
                  to="/signup" 
                  className="btn nav-link active bg-solo-purple w-50"
                >
                  Sign up
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
