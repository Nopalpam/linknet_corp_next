'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/lib/auth-context';
import { useGuestOnly } from '@/hooks/useAuth';
import styles from './login.module.scss';
import Image from 'next/image';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required')
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const { isLoading: authLoading } = useGuestOnly();
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError('');
      setIsSubmitting(true);
      await login(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || 'Login failed. Please check your credentials.');
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.authPage}>
      <div className="container-fluid p-0">
        <div className="row g-0 justify-content-center">
          <div className="col-xxl-4 col-lg-5 col-md-6">
            <div className={styles.authFullPageContent}>
              <div className={styles.authContentWrapper}>
                <div className={styles.authContent}>
                  {/* Logo */}
                  <div className={styles.logoContainer}>
                    <a href="javascript:void(0);" className={styles.authLogo}>
                      <Image 
                        src="https://linknet.co.id/assets/images/default-logo.png" 
                        alt="Linknet Logo" 
                        width={100}
                        height={100}
                        style={{ maxWidth: '100px' }}
                      />
                    </a>
                  </div>

                  {/* Welcome Text */}
                  <div className="text-center">
                    <h5 className="mb-0">Welcome Back !</h5>
                    <p className="text-muted mt-2">Sign in to continue to Linknet.</p>
                  </div>

                  {/* Error Alert */}
                  {error && (
                    <div className="alert alert-danger mt-4" role="alert">
                      {error}
                    </div>
                  )}

                  {/* Login Form */}
                  <form onSubmit={handleSubmit(onSubmit)} className="mt-4 pt-2">
                    {/* Email Field */}
                    <div className="mb-3">
                      <label className="form-label">Username</label>
                      <input
                        type="email"
                        id="email"
                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                        placeholder="Enter your email"
                        {...register('email')}
                        autoComplete="username"
                        autoFocus
                      />
                      {errors.email && (
                        <div className="invalid-feedback d-block">{errors.email.message}</div>
                      )}
                    </div>

                    {/* Password Field */}
                    <div className="mb-3">
                      <div className="d-flex align-items-start">
                        <div className="flex-grow-1">
                          <label className="form-label">Password</label>
                        </div>
                      </div>

                      <div className="input-group auth-pass-inputgroup">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          id="password"
                          className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                          placeholder="Enter password"
                          {...register('password')}
                          autoComplete="current-password"
                          aria-label="Password"
                          aria-describedby="password-addon"
                        />
                        <button
                          className="btn btn-light shadow-none ms-0"
                          type="button"
                          id="password-addon"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46A11.804 11.804 0 0 0 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                            </svg>
                          )}
                        </button>
                      </div>
                      {errors.password && (
                        <div className="invalid-feedback d-block">{errors.password.message}</div>
                      )}
                    </div>

                    {/* Remember Me */}
                    <div className="row mb-4">
                      <div className="col">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="remember-check"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                          />
                          <label className="form-check-label" htmlFor="remember-check">
                            Remember me
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="mb-3">
                      <button
                        className="btn btn-primary w-100 waves-effect waves-light"
                        type="submit"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Logging in...
                          </>
                        ) : (
                          'Log In'
                        )}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Footer */}
                <div className={styles.authFooter}>
                  <p className="mb-0">
                    © {new Date().getFullYear()} Linknet. Crafted with{' '}
                    <span className="text-danger">❤</span> by Mediaco
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
