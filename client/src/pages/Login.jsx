import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { GraduationCap, ArrowRight } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      await login(data.email, data.password);
      toast.success('Logged in successfully');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-surface-secondary)] flex flex-col justify-center py-12 px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-accent)] flex items-center justify-center">
            <GraduationCap size={24} className="text-[var(--color-primary-dark)]" />
          </div>
          <span className="text-2xl font-bold text-[var(--color-primary-dark)]" style={{ fontFamily: 'var(--font-heading)' }}>LearnBuddy</span>
        </Link>
        
        <div className="bg-white py-10 px-6 shadow-xl rounded-2xl sm:px-10 border border-[var(--color-border-light)]">
          <div className="mb-8 text-center">
             <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Welcome back</h2>
             <p className="text-sm text-[var(--color-text-secondary)] mt-2">Enter your details to access your account</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email address</label>
              <input 
                id="email" 
                type="email" 
                autoComplete="email"
                placeholder="you@example.com"
                className="form-input" 
                {...register('email')} 
              />
              {errors.email && <p className="form-error">{errors.email.message}</p>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input 
                id="password" 
                type="password" 
                autoComplete="current-password"
                placeholder="••••••••"
                className="form-input" 
                {...register('password')} 
              />
              {errors.password && <p className="form-error">{errors.password.message}</p>}
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn btn-primary w-full py-3"
            >
              {loading ? 'SIGNING IN...' : 'SIGN IN'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-[var(--color-text-secondary)]">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-dark)]">
                Sign up
              </Link>
            </p>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 text-blue-800 rounded-lg text-sm text-center border border-blue-100">
             <strong>Demo Access:</strong> <br/>
             demo@studypilot.com / Demo@1234
          </div>
        </div>
      </div>
    </div>
  );
}
