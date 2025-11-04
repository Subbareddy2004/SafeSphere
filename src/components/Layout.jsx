import { Link, useNavigate, useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUserName] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      if (currentUser) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setIsAdmin(userData.role === 'admin');
          setUserName(userData.name || currentUser.email);
        }
      }
    };
    checkAdmin();
  }, [currentUser]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const navItems = isAdmin ? [
    { path: '/admin', icon: 'fa-shield-alt', label: 'Admin Dashboard' },
    { path: '/helpboard', icon: 'fa-comments', label: 'Help Board' },
    { path: '/directory', icon: 'fa-address-book', label: 'Directory' },
  ] : [
    { path: '/dashboard', icon: 'fa-home', label: 'Dashboard' },
    { path: '/helpboard', icon: 'fa-comments', label: 'Help Board' },
    { path: '/directory', icon: 'fa-address-book', label: 'Directory' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4 sm:space-x-8">
              <Link to={isAdmin ? '/admin' : '/dashboard'} className="flex items-center space-x-2 sm:space-x-3 group">
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${isAdmin ? 'bg-gradient-to-br from-purple-500 to-indigo-600' : 'bg-gradient-to-br from-blue-500 to-cyan-500'} flex items-center justify-center shadow-lg`}>
                  <i className="fas fa-shield-alt text-white text-base sm:text-lg"></i>
                </div>
                <span className="text-lg sm:text-xl font-bold gradient-text">SafeSphere</span>
              </Link>
              
              <div className="hidden md:flex items-center space-x-1">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      location.pathname === item.path
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                    }`}
                  >
                    <i className={`fas ${item.icon} mr-2`}></i>
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className={`hidden sm:flex items-center space-x-3 px-3 sm:px-4 py-2 rounded-xl ${isAdmin ? 'bg-purple-50 border border-purple-200' : 'bg-slate-50 border border-slate-200'}`}>
                <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full ${isAdmin ? 'bg-gradient-to-br from-purple-500 to-indigo-600' : 'bg-gradient-to-br from-blue-500 to-cyan-500'} flex items-center justify-center shadow-md`}>
                  <span className="text-white text-xs sm:text-sm font-bold">{userName.charAt(0).toUpperCase()}</span>
                </div>
                <div className="text-left hidden lg:block">
                  <p className="text-sm font-semibold text-slate-700 truncate max-w-[120px]">{userName}</p>
                  {isAdmin && (
                    <span className="text-xs text-purple-600 font-semibold flex items-center">
                      <i className="fas fa-crown mr-1"></i>
                      Admin
                    </span>
                  )}
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="px-3 sm:px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-all text-sm font-medium"
              >
                <i className="fas fa-sign-out-alt sm:mr-2"></i>
                <span className="hidden sm:inline">Logout</span>
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
              >
                <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'} text-lg`}></i>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-slate-200">
              <div className="flex flex-col space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      location.pathname === item.path
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <i className={`fas ${item.icon} mr-3`}></i>
                    {item.label}
                  </Link>
                ))}
                <div className="sm:hidden px-4 py-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full ${isAdmin ? 'bg-gradient-to-br from-purple-500 to-indigo-600' : 'bg-gradient-to-br from-blue-500 to-cyan-500'} flex items-center justify-center shadow-md`}>
                      <span className="text-white text-sm font-bold">{userName.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-700">{userName}</p>
                      {isAdmin && (
                        <span className="text-xs text-purple-600 font-semibold flex items-center">
                          <i className="fas fa-crown mr-1"></i>
                          Admin
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {children}
      </main>
    </div>
  );
}
