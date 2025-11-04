import { useState } from 'react';
import { seedDatabase } from '../utils/seedData';
import { Link } from 'react-router-dom';

export default function SeedDatabase() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSeed = async () => {
    setLoading(true);
    setResult(null);
    const res = await seedDatabase();
    setResult(res);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Link to="/" className="flex items-center justify-center mb-8 space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
            </svg>
          </div>
          <span className="text-2xl font-bold text-white">SafeSphere</span>
        </Link>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-2xl">
          <h1 className="text-3xl font-bold text-white mb-4 text-center">🌱 Database Seeder</h1>
          <p className="text-white/70 text-center mb-8">
            Populate your Firebase database with sample data
          </p>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
            <h3 className="text-white font-semibold mb-3">This will create:</h3>
            <ul className="space-y-2 text-white/80">
              <li>✅ Admin account (admin@safesphere.com / admin123456)</li>
              <li>✅ 3 Sample resident accounts</li>
              <li>✅ 8 Emergency contacts (Security, Maintenance, etc.)</li>
              <li>✅ 4 Sample help board posts</li>
              <li>✅ 1 Sample emergency record</li>
            </ul>
          </div>

          <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-2xl p-4 mb-6">
            <p className="text-yellow-200 text-sm">
              ⚠️ <strong>Note:</strong> If accounts already exist, they will be skipped. This is safe to run multiple times.
            </p>
          </div>

          <button
            onClick={handleSeed}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:scale-105 transition transform disabled:opacity-50 disabled:cursor-not-allowed mb-4"
          >
            {loading ? '🌱 Seeding Database...' : '🚀 Seed Database'}
          </button>

          {result && (
            <div className={`rounded-2xl p-4 ${
              result.success 
                ? 'bg-green-500/20 border border-green-500/50' 
                : 'bg-red-500/20 border border-red-500/50'
            }`}>
              <p className={result.success ? 'text-green-200' : 'text-red-200'}>
                {result.success ? '✅ ' + result.message : '❌ ' + result.error}
              </p>
              {result.success && (
                <div className="mt-4 space-y-2">
                  <Link
                    to="/login"
                    className="block w-full bg-white/20 text-white text-center py-2 rounded-lg hover:bg-white/30 transition"
                  >
                    Go to Login
                  </Link>
                  <Link
                    to="/"
                    className="block w-full bg-white/10 text-white text-center py-2 rounded-lg hover:bg-white/20 transition"
                  >
                    Back to Home
                  </Link>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 text-center">
            <Link to="/" className="text-white/70 hover:text-white text-sm">
              ← Back to Home
            </Link>
          </div>
        </div>

        <div className="mt-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-3">📝 Sample Credentials</h3>
          <div className="space-y-2 text-sm">
            <div className="bg-white/5 p-3 rounded-lg">
              <p className="text-white/60">Admin Account:</p>
              <p className="text-white font-mono">admin@safesphere.com / admin123456</p>
            </div>
            <div className="bg-white/5 p-3 rounded-lg">
              <p className="text-white/60">Sample Resident:</p>
              <p className="text-white font-mono">john.doe@example.com / password123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
