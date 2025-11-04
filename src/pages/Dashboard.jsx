import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import EmergencyButton from '../components/EmergencyButton';
import Chatbot from '../components/Chatbot';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [showChatbot, setShowChatbot] = useState(false);
  const [recentPosts, setRecentPosts] = useState([]);
  const [myPosts, setMyPosts] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkRole = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        console.log('Checking role for user:', currentUser.uid);
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log('User data:', userData);
          console.log('User role:', userData.role);
          
          if (userData.role === 'admin') {
            console.log('Admin detected, redirecting to /admin');
            setIsAdmin(true);
            navigate('/admin', { replace: true });
            return;
          }
        } else {
          console.log('User document does not exist in Firestore');
        }
      } catch (error) {
        console.error('Error checking role:', error);
      }
      
      setLoading(false);
    };
    
    checkRole();
  }, [currentUser, navigate]);

  useEffect(() => {
    const postsQuery = query(collection(db, 'helpPosts'), orderBy('createdAt', 'desc'), limit(5));
    const unsubPosts = onSnapshot(postsQuery, (snapshot) => {
      setRecentPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const myPostsQuery = query(collection(db, 'helpPosts'), orderBy('createdAt', 'desc'));
    const unsubMyPosts = onSnapshot(myPostsQuery, (snapshot) => {
      const posts = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(post => post.userId === currentUser?.uid);
      setMyPosts(posts.slice(0, 3));
    });

    return () => {
      unsubPosts();
      unsubMyPosts();
    };
  }, [currentUser]);

  if (loading || isAdmin) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-8 shadow-soft-lg">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <i className="fas fa-home text-white text-3xl"></i>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">
                Welcome Back! 👋
              </h1>
              <p className="text-blue-50">Your safe community dashboard</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-bold text-slate-800 mb-4">🚀 Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/helpboard"
              className="bg-white rounded-xl p-6 hover:shadow-soft-lg transition-all border border-slate-200 group card-hover"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md">
                <i className="fas fa-comments text-white text-2xl"></i>
              </div>
              <h3 className="text-slate-800 font-bold text-lg mb-2">Help Board</h3>
              <p className="text-slate-600 text-sm">Post or browse community help requests</p>
            </a>

            <a
              href="/directory"
              className="bg-white rounded-xl p-6 hover:shadow-soft-lg transition-all border border-slate-200 group card-hover"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md">
                <i className="fas fa-address-book text-white text-2xl"></i>
              </div>
              <h3 className="text-slate-800 font-bold text-lg mb-2">Directory</h3>
              <p className="text-slate-600 text-sm">Find emergency contacts and services</p>
            </a>

            <button
              onClick={() => setShowChatbot(true)}
              className="bg-white rounded-xl p-6 hover:shadow-soft-lg transition-all border border-slate-200 group text-left card-hover"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md">
                <i className="fas fa-robot text-white text-2xl"></i>
              </div>
              <h3 className="text-slate-800 font-bold text-lg mb-2">AI Assistant</h3>
              <p className="text-slate-600 text-sm">Get instant help and guidance</p>
            </button>
          </div>
        </div>

        {/* My Posts */}
        {myPosts.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-4">📝 My Help Requests</h2>
            <div className="space-y-3">
              {myPosts.map((post) => (
                <div key={post.id} className="bg-white rounded-xl p-5 border border-slate-200 hover:shadow-soft transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-slate-800 font-semibold text-lg">{post.title}</h3>
                    <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-medium border border-blue-200">
                      {post.category}
                    </span>
                  </div>
                  <p className="text-slate-600 text-sm mb-3">{post.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      <i className="fas fa-clock mr-2"></i>
                      {post.createdAt?.toDate().toLocaleDateString()}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      post.status === 'open' 
                        ? 'bg-green-50 text-green-600 border border-green-200' 
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
                      {post.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Community Activity */}
        <div>
          <h2 className="text-xl font-bold text-slate-800 mb-4">🏘️ Community Activity</h2>
          <div className="space-y-3">
            {recentPosts.length > 0 ? (
              recentPosts.slice(0, 3).map((post) => (
                <div key={post.id} className="bg-white rounded-xl p-5 border border-slate-200 hover:shadow-soft transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-slate-800 font-semibold text-lg">{post.title}</h3>
                    <span className="px-3 py-1 rounded-full bg-cyan-50 text-cyan-600 text-xs font-medium border border-cyan-200">
                      {post.category}
                    </span>
                  </div>
                  <p className="text-slate-600 text-sm mb-3 line-clamp-2">{post.description}</p>
                  <div className="flex items-center text-xs text-slate-500">
                    <i className="fas fa-user mr-2"></i>
                    {post.userEmail}
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
                <i className="fas fa-inbox text-5xl text-slate-300 mb-4"></i>
                <p className="text-slate-600 text-lg font-medium mb-2">No community activity yet</p>
                <p className="text-slate-500 text-sm">Be the first to post a help request!</p>
              </div>
            )}
          </div>
        </div>

        {/* Emergency Info Card */}
        <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-xl p-6 shadow-soft-lg">
          <div className="flex items-start space-x-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
              <i className="fas fa-exclamation-triangle text-white text-2xl"></i>
            </div>
            <div className="flex-1">
              <h3 className="text-white font-bold text-xl mb-2">🚨 Emergency SOS</h3>
              <p className="text-red-50 text-sm mb-4">
                In case of emergency, click the red button at the bottom right corner to instantly alert security and emergency services.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 bg-white/20 text-white rounded-lg text-sm font-medium backdrop-blur-sm">
                  🔒 Security
                </span>
                <span className="px-3 py-1.5 bg-white/20 text-white rounded-lg text-sm font-medium backdrop-blur-sm">
                  🚑 Medical
                </span>
                <span className="px-3 py-1.5 bg-white/20 text-white rounded-lg text-sm font-medium backdrop-blur-sm">
                  🔥 Fire
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <EmergencyButton />
      {showChatbot && <Chatbot onClose={() => setShowChatbot(false)} />}
    </Layout>
  );
}
