import { useState, useEffect } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';

export default function HelpBoard() {
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    const q = query(collection(db, 'helpPosts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description) return;

    setLoading(true);
    try {
      // Get user data to include unit and phone
      const { doc, getDoc } = await import('firebase/firestore');
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      const userData = userDoc.exists() ? userDoc.data() : {};
      
      await addDoc(collection(db, 'helpPosts'), {
        title,
        description,
        category,
        userId: currentUser.uid,
        userEmail: currentUser.email,
        userName: userData.name || 'Unknown',
        userPhone: userData.phone || 'Not provided',
        userUnit: userData.unit || 'Not provided',
        createdAt: serverTimestamp(),
        status: 'open'
      });

      setTitle('');
      setDescription('');
      setCategory('General');
      setShowForm(false);
    } catch (error) {
      alert('Error posting request: ' + error.message);
    }
    setLoading(false);
  };

  const handleDelete = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      await deleteDoc(doc(db, 'helpPosts', postId));
    }
  };

  const categories = ['General', 'Maintenance', 'Security', 'Community', 'Lost & Found'];
  const categoryColors = {
    'General': 'bg-blue-50 text-blue-600 border-blue-200',
    'Maintenance': 'bg-orange-50 text-orange-600 border-orange-200',
    'Security': 'bg-yellow-50 text-yellow-700 border-yellow-200',
    'Community': 'bg-purple-50 text-purple-600 border-purple-200',
    'Lost & Found': 'bg-green-50 text-green-600 border-green-200',
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              <i className="fas fa-comments mr-3 text-blue-600"></i>
              Help Board
            </h1>
            <p className="text-slate-600">Post or respond to community assistance requests</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold hover:shadow-soft-lg transition-all"
          >
            <i className="fas fa-plus mr-2"></i>
            New Request
          </button>
        </div>

        {/* Post Form */}
        {showForm && (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-soft-lg">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Create Help Request</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <i className="fas fa-tag mr-2"></i>Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <i className="fas fa-heading mr-2"></i>Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="Brief description of your request"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <i className="fas fa-align-left mr-2"></i>Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
                  rows="4"
                  placeholder="Provide more details about your request"
                  required
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold hover:shadow-soft-lg transition-all disabled:opacity-50"
                >
                  {loading ? <><i className="fas fa-spinner fa-spin mr-2"></i>Posting...</> : <><i className="fas fa-paper-plane mr-2"></i>Post Request</>}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 rounded-xl bg-slate-100 border border-slate-300 text-slate-700 hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Posts List */}
        <div className="space-y-4">
          {posts.length > 0 ? (
            posts.map(post => (
              <div key={post.id} className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-soft-lg transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${categoryColors[post.category] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                        {post.category}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                        post.status === 'open' 
                          ? 'bg-green-50 text-green-600 border-green-200' 
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {post.status}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">{post.title}</h3>
                    <p className="text-slate-600 mb-3">{post.description}</p>
                    <div className="space-y-1 mb-2">
                      <div className="flex items-center text-sm text-slate-600">
                        <i className="fas fa-user mr-2 text-blue-600"></i>
                        {post.userName || post.userEmail}
                      </div>
                      <div className="flex items-center text-sm text-slate-600">
                        <i className="fas fa-phone mr-2 text-green-600"></i>
                        {post.userPhone || 'Not provided'}
                      </div>
                      <div className="flex items-center text-sm text-slate-600">
                        <i className="fas fa-home mr-2 text-purple-600"></i>
                        Unit: {post.userUnit || 'Not provided'}
                      </div>
                    </div>
                    <div className="flex items-center text-xs text-slate-500">
                      <i className="fas fa-clock mr-2"></i>
                      {post.createdAt?.toDate().toLocaleDateString()}
                    </div>
                  </div>
                  {post.userId === currentUser.uid && (
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="ml-4 w-10 h-10 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
              <i className="fas fa-inbox text-6xl text-slate-300 mb-4"></i>
              <p className="text-slate-600 text-lg font-medium">No help requests yet</p>
              <p className="text-slate-500 text-sm mt-2">Be the first to post a request!</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
