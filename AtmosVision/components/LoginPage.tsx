
import React, { useState } from 'react';
import { GlobeIcon, LoaderIcon } from './icons';
import { verifyUser } from '../services/userService';

interface LoginPageProps {
  onLoginSuccess: (email: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);

    const isAuthorized = await verifyUser(email);

    if (isAuthorized) {
        onLoginSuccess(email);
    } else {
        setError('This email address is not authorized for access.');
        setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-4 bg-gray-100 dark:bg-[#0D1117] relative">
       {/* Background Grid */}
      <div className="absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-[#0D1117] bg-gray-100 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      <div className="absolute pointer-events-none inset-0 bg-[url(https://raw.githubusercontent.com/kamranahmedse/public-assets/master/raw/pattern-grid.svg)] opacity-20 dark:opacity-10"></div>


      <div className="w-full max-w-md bg-white/50 dark:bg-[#161B22]/50 backdrop-blur-lg border border-gray-300 dark:border-[#30363D] rounded-xl shadow-2xl p-8 z-10">
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="flex items-center">
            <GlobeIcon className="w-10 h-10 text-cyan-500" />
            <h1 className="ml-4 text-3xl font-bold tracking-tight text-gray-800 dark:text-gray-200">
              Atmos<span className="font-semibold text-cyan-500">Vision</span> AI
            </h1>
          </div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Climate Resilience Platform</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 sr-only">
              Email Address
            </label>
            <div className="mt-1">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="block w-full px-4 py-3 rounded-md bg-gray-200/50 dark:bg-[#0D1117] border border-gray-300 dark:border-[#30363D] focus:ring-cyan-500 focus:border-cyan-500 text-gray-900 dark:text-gray-200 placeholder-gray-500 shadow-sm sm:text-sm transition-colors"
              />
            </div>
          </div>
          
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:bg-cyan-800 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                  <>
                    <LoaderIcon className="w-5 h-5 mr-2 animate-spin" />
                    Signing In...
                  </>
              ) : (
                'Sign In'
              )}
            </button>
          </div>
        </form>
         <p className="mt-6 text-xs text-center text-gray-500 dark:text-gray-500">
            By signing in, you agree to our Terms of Service.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
