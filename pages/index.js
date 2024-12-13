import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { app } from '@/lib/script';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null); // To show errors like invalid credentials
  const router = useRouter();
  const auth = getAuth(app);

  // Check if the user is logged in
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // If user is logged in, redirect to weather dashboard
        router.push('/weatherdashboard');
      }
    });
  }, [auth, router]);

  const handleSignIn = async (e) => {
    e.preventDefault();

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/weatherdashboard'); // Redirect to weather dashboard after successful login
    } catch (error) {
      setError('Invalid email or password.');
    }
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
            Weather Station Dashboard
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to your account
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-300 text-red-800 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSignIn}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-t-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-b-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300 ease-in-out transform hover:scale-105"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <svg 
                  className="h-5 w-5 text-blue-500 group-hover:text-blue-400" 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </span>
              Sign In
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Dont have an account? 
            <button
              onClick={() => router.push('/signup')}
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Create one here
            </button>
          </p>
        </div>
      </div>

      <div className="absolute bottom-5 left-5 text-white text-sm opacity-70">
        © {new Date().getFullYear()} Weather Monitoring Station
      </div>
    </div>
  );
}
