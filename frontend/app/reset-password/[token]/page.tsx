'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import styles from '../../login/login.module.scss';

const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least 1 uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least 1 number'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage({ params }: { params: { token: string } }) {
  const router = useRouter();
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema)
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      setError('');
      setIsSubmitting(true);
      
      const response = await authApi.resetPassword({
        token: params.token,
        password: data.password,
        confirmPassword: data.confirmPassword
      });
      
      if (response.data.success) {
        setSuccess(true);
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setError(response.data.message || 'Failed to reset password');
      }
    } catch (err) {
      setError('Invalid or expired reset token. Please request a new one.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <h1>Reset Password</h1>
          <p>Enter your new password below.</p>
        </div>

        {success && (
          <div className={styles.successMessage}>
            Password reset successful! Redirecting to login...
          </div>
        )}

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit(onSubmit)} className={styles.authForm}>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                New Password
              </label>
              <input
                type="password"
                id="password"
                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                placeholder="Enter new password"
                {...register('password')}
              />
              {errors.password && (
                <div className="invalid-feedback">{errors.password.message}</div>
              )}
              <div className={styles.passwordRequirements}>
                <small>Password must:</small>
                <ul>
                  <li>Be at least 8 characters long</li>
                  <li>Contain at least 1 uppercase letter</li>
                  <li>Contain at least 1 number</li>
                </ul>
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                placeholder="Confirm new password"
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <div className="invalid-feedback">{errors.confirmPassword.message}</div>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Resetting Password...
                </>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>
        )}

        <div className={styles.authFooter}>
          <p>
            Remember your password?{' '}
            <Link href="/login">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
