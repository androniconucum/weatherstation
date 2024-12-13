import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  getAuth, 
  sendEmailVerification, 
  onAuthStateChanged 
} from 'firebase/auth';
import { app } from '@/lib/script';

const VerifyEmail = () => {
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const router = useRouter();
  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        // If no user is logged in, redirect to signup
        router.push('/verify-email');
        return;
      }

      // If user is already verified, redirect to dashboard
      if (user.emailVerified) {
        router.push('/weatherdashboard');
        return;
      }
    });

    return () => unsubscribe();
  }, [auth, router]);

  const handleResendVerification = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        await sendEmailVerification(user);
        setMessage('Verification email resent! Please check your inbox.');
        setError(null);
      }
    } catch (error) {
      setError('Failed to resend verification email. Please try again.');
      setMessage('');
    }
  };

  const toggleLogin = () => {
    // Navigate to the index page when login button is clicked
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-8 bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/30 p-10">
        <div className="text-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="mx-auto h-16 w-16 text-blue-600" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M3 15a4 4 0 004 4h9a5 5 0 10-9.985-1A4.998 4.998 0 003 15z" 
            />
          </svg>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Verify Your Email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            We&apos;ve sent a verification link to your email
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-300 text-red-800 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {message && (
          <div className="bg-green-50 border border-green-300 text-green-800 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{message}</span>
          </div>
        )}

        <div className="mt-6 space-y-4">
          <p className="text-center text-sm text-gray-600">
            Didn&apos;t receive the email? Check your spam folder or click below to resend.
          </p>
          <button
            onClick={handleResendVerification}
            className="w-full py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300 ease-in-out transform hover:scale-105"
          >
            Resend Verification Email
          </button>
          <button
            onClick={toggleLogin}
            className="w-full py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300 ease-in-out transform hover:scale-105"
          >
            Login now
          </button>
        </div>
      </div>
      <div className="absolute bottom-5 left-5 text-white text-sm opacity-70">
        © {new Date().getFullYear()} Weather Monitoring Station
      </div>
    </div>
  );
};

export default VerifyEmail;