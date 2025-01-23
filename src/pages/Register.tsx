import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import client from '../api/client';

interface RegisterForm {
  name: string;
  email: string;
  username: string;
  password: string;
  gymId: string;
}

interface Gym {
  id: number;
  name: string;
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<RegisterForm>({
    name: '',
    email: '',
    username: '',
    password: '',
    gymId: ''
  });
  const [error, setError] = useState<string | null>(null);

  const { data: gyms } = useQuery<Gym[]>({
    queryKey: ['gyms'],
    queryFn: async () => {
      const response = await client.get('/api/gyms');
      return response.data;
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await client.post('/auth/register', form);
      navigate('/sends');
    } catch (err: any) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Something went wrong. Please try again.');
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
                <label className="form-label required-field">Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-control form-control-lg"
                  placeholder="Samir"
                  required
                  value={form.name}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-3">
                <label className="form-label required-field">Email</label>
                <input
                  type="email"
                  name="email"
                  className="form-control form-control-lg"
                  placeholder="name@email.com"
                  required
                  value={form.email}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-3">
                <label className="form-label required-field">Username</label>
                <div className="input-group input-group-lg">
                  <span className="input-group-text">@</span>
                  <input
                    type="text"
                    name="username"
                    className="form-control"
                    required
                    pattern="[A-Za-z0-9]{1,9}"
                    title="Username must be 1-9 characters, letters and numbers only"
                    placeholder="heysamir"
                    value={form.username}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label required-field">Password</label>
                <input
                  type="password"
                  name="password"
                  className="form-control form-control-lg"
                  required
                  placeholder="8-12 characters, letters, numbers, symbols allowed"
                  value={form.password}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-3">
                <label className="form-label required-field">Home Gym</label>
                <select
                  name="gymId"
                  className="form-select form-select-lg mb-2"
                  value={form.gymId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a gym</option>
                  {gyms?.map(gym => (
                    <option key={gym.id} value={gym.id}>
                      {gym.name}
                    </option>
                  ))}
                </select>
              </div>
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              <button
                type="submit"
                className="btn nav-link active bg-solo-purple w-100 py-3"
              >
                Join
              </button>
              <div className="text-center mt-3">
                <Link to="/login" className="text-decoration-none text-white">
                  Already have an account? Login
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
