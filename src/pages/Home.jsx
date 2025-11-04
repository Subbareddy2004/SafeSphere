import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      {/* Animated background gradients */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-3xl animate-gradient"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-blue-500/20 via-violet-500/20 to-purple-500/20 blur-3xl animate-gradient"></div>
      </div>

      {/* Navbar */}
      <nav className="relative z-50 border-b border-white/5 backdrop-blur-xl bg-black/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-indigo-500/50 transition-all">
                <i className="fas fa-shield-alt text-white text-lg"></i>
              </div>
              <span className="text-xl font-display font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                SafeSphere
              </span>
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-400 hover:text-white transition text-sm font-medium">Features</a>
              <a href="#how-it-works" className="text-gray-400 hover:text-white transition text-sm font-medium">How It Works</a>
              <a href="#about" className="text-gray-400 hover:text-white transition text-sm font-medium">About</a>
            </div>

            <div className="flex items-center space-x-4">
              {currentUser ? (
                <Link
                  to="/dashboard"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold hover:shadow-lg hover:shadow-indigo-500/50 transition-all"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/seed" className="text-gray-400 hover:text-white px-4 py-2 text-sm font-medium transition hidden lg:block">
                    🌱 Seed
                  </Link>
                  <Link to="/login" className="text-gray-400 hover:text-white px-4 py-2 text-sm font-medium transition">
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold hover:shadow-lg hover:shadow-indigo-500/50 transition-all"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-8">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-sm text-gray-300">Next-Gen Community Safety Platform</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-display font-bold mb-6 leading-tight">
            Your Community,
            <br />
            <span className="gradient-text">Protected & Connected</span>
          </h1>
          
          <p className="text-xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
            Real-time emergency alerts, instant help coordination, and seamless communication.
            <br />All in one powerful platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
            <Link
              to="/register"
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-lg hover:shadow-2xl hover:shadow-indigo-500/50 transition-all transform hover:scale-105"
            >
              Get Started Free
            </Link>
            <a
              href="#features"
              className="px-8 py-4 rounded-xl bg-white/5 backdrop-blur-sm text-white font-bold text-lg border border-white/10 hover:bg-white/10 transition-all"
            >
              Learn More
            </a>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { icon: 'fa-bell', title: 'Emergency SOS', desc: 'One-tap alerts to security & emergency services', color: 'from-red-500 to-orange-500' },
              { icon: 'fa-comments', title: 'Help Board', desc: 'Community assistance & support requests', color: 'from-blue-500 to-cyan-500' },
              { icon: 'fa-robot', title: 'AI Assistant', desc: 'Instant answers to your questions 24/7', color: 'from-purple-500 to-pink-500' }
            ].map((feature, idx) => (
              <div key={idx} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity blur-xl" style={{background: `linear-gradient(to right, ${feature.color})`}}></div>
                <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                    <i className={`fas ${feature.icon} text-white text-2xl`}></i>
                  </div>
                  <h3 className="text-white font-bold text-xl mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-display font-bold mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-400">Powerful features for modern apartment living</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: 'fa-lock', title: 'Secure Authentication', desc: 'Enterprise-grade security with Firebase' },
              { icon: 'fa-address-book', title: 'Contact Directory', desc: 'Instant access to verified contacts' },
              { icon: 'fa-bolt', title: 'Real-time Updates', desc: 'Live notifications for emergencies' },
              { icon: 'fa-message', title: 'Community Chat', desc: 'Connect with neighbors instantly' },
              { icon: 'fa-chart-line', title: 'Admin Dashboard', desc: 'Comprehensive monitoring tools' },
              { icon: 'fa-mobile', title: 'Cross-Platform', desc: 'Access from any device' }
            ].map((feature, idx) => (
              <div key={idx} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all group">
                <i className={`fas ${feature.icon} text-3xl text-indigo-400 mb-4 group-hover:scale-110 transition-transform`}></i>
                <h3 className="text-white font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 border border-white/10 p-12 text-center backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 animate-gradient"></div>
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
                Ready to Make Your Community Safer?
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Join thousands of residents already using SafeSphere
              </p>
              <Link
                to="/register"
                className="inline-block px-10 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-lg hover:shadow-2xl hover:shadow-indigo-500/50 transition-all transform hover:scale-105"
              >
                Start Free Today
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8 px-6">
        <div className="max-w-7xl mx-auto text-center text-gray-500 text-sm">
          <p>&copy; 2024 SafeSphere. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
