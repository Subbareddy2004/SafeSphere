import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, getDoc, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import EmergencyAlerts from '../components/EmergencyAlerts';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    activeEmergencies: 0,
    resolvedToday: 0
  });
  const [recentPosts, setRecentPosts] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (!userDoc.exists() || userDoc.data().role !== 'admin') {
            navigate('/dashboard', { replace: true });
            return;
          }
          setIsAdmin(true);
        } catch (error) {
          console.error('Error checking admin:', error);
          navigate('/dashboard', { replace: true });
          return;
        }
      }
      setLoading(false);
    };
    checkAdmin();
  }, [currentUser, navigate]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const postsSnapshot = await getDocs(collection(db, 'helpPosts'));
        const emergenciesSnapshot = await getDocs(
          query(collection(db, 'emergencies'), orderBy('timestamp', 'desc'))
        );

        const activeEmergencies = emergenciesSnapshot.docs.filter(
          doc => doc.data().status === 'active'
        ).length;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const resolvedToday = emergenciesSnapshot.docs.filter(doc => {
          const data = doc.data();
          return data.status === 'resolved' && 
                 data.resolvedAt?.toDate() >= today;
        }).length;

        setStats({
          totalUsers: usersSnapshot.size,
          totalPosts: postsSnapshot.size,
          activeEmergencies,
          resolvedToday
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();

    const postsQuery = query(collection(db, 'helpPosts'), orderBy('createdAt', 'desc'));
    const unsubPosts = onSnapshot(postsQuery, (snapshot) => {
      setRecentPosts(snapshot.docs.slice(0, 5).map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsubUsers = onSnapshot(usersQuery, (snapshot) => {
      setRecentUsers(snapshot.docs.slice(0, 5).map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubPosts();
      unsubUsers();
    };
  }, []);

  if (loading || !isAdmin) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading admin dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Emergency Alerts */}
        <EmergencyAlerts />

        {/* Admin Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 shadow-soft-lg">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <i className="fas fa-shield-alt text-white text-3xl"></i>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">
                Admin Control Center
              </h1>
              <p className="text-purple-100">Monitor and manage your community</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-soft">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-users text-blue-600 text-2xl"></i>
              </div>
              <span className="text-3xl font-bold text-slate-800">{stats.totalUsers}</span>
            </div>
            <p className="text-slate-600 font-medium">Total Users</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-green-200 shadow-soft">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-comments text-green-600 text-2xl"></i>
              </div>
              <span className="text-3xl font-bold text-slate-800">{stats.totalPosts}</span>
            </div>
            <p className="text-slate-600 font-medium">Help Requests</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-red-200 shadow-soft">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-exclamation-triangle text-red-600 text-2xl"></i>
              </div>
              <span className="text-3xl font-bold text-slate-800">{stats.activeEmergencies}</span>
            </div>
            <p className="text-slate-600 font-medium">Active Emergencies</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-purple-200 shadow-soft">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-check-circle text-purple-600 text-2xl"></i>
              </div>
              <span className="text-3xl font-bold text-slate-800">{stats.resolvedToday}</span>
            </div>
            <p className="text-slate-600 font-medium">Resolved Today</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-bold text-slate-800 mb-4">⚡ Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/helpboard"
              className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-soft-lg transition-all group card-hover"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <i className="fas fa-comments text-blue-600 text-xl"></i>
              </div>
              <h3 className="text-slate-800 font-bold text-lg mb-1">Manage Help Board</h3>
              <p className="text-slate-600 text-sm">View and respond to requests</p>
            </Link>

            <Link
              to="/directory"
              className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-soft-lg transition-all group card-hover"
            >
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <i className="fas fa-address-book text-green-600 text-xl"></i>
              </div>
              <h3 className="text-slate-800 font-bold text-lg mb-1">Directory</h3>
              <p className="text-slate-600 text-sm">Manage emergency contacts</p>
            </Link>

            <button
              onClick={() => navigate('/seed')}
              className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-soft-lg transition-all group text-left card-hover"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <i className="fas fa-database text-purple-600 text-xl"></i>
              </div>
              <h3 className="text-slate-800 font-bold text-lg mb-1">Seed Data</h3>
              <p className="text-slate-600 text-sm">Initialize test data</p>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Posts */}
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-4">📝 Recent Help Requests</h2>
            <div className="space-y-3">
              {recentPosts.length > 0 ? (
                recentPosts.map((post) => (
                  <div key={post.id} className="bg-white rounded-xl p-4 border border-slate-200 shadow-soft">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-slate-800 font-semibold">{post.title}</h3>
                      <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-medium border border-blue-200">
                        {post.category}
                      </span>
                    </div>
                    <p className="text-slate-600 text-sm mb-2 line-clamp-2">{post.description}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">
                        <i className="fas fa-user mr-2"></i>
                        {post.userEmail}
                      </span>
                      <span className={`px-2 py-1 rounded ${
                        post.status === 'open' 
                          ? 'bg-green-50 text-green-600 border border-green-200' 
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {post.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
                  <i className="fas fa-inbox text-4xl text-slate-300 mb-3"></i>
                  <p className="text-slate-600">No help requests yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Users */}
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-4">👥 Recent Users</h2>
            <div className="space-y-3">
              {recentUsers.length > 0 ? (
                recentUsers.map((user) => (
                  <div key={user.id} className="bg-white rounded-xl p-4 border border-slate-200 shadow-soft">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold">
                          {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-slate-800 font-semibold">{user.name || 'User'}</p>
                        <p className="text-slate-500 text-sm">{user.email}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.role === 'admin'
                          ? 'bg-purple-50 text-purple-600 border border-purple-200'
                          : 'bg-blue-50 text-blue-600 border border-blue-200'
                      }`}>
                        {user.role || 'user'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
                  <i className="fas fa-users text-4xl text-slate-300 mb-3"></i>
                  <p className="text-slate-600">No users yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
