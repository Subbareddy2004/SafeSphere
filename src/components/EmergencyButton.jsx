import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

export default function EmergencyButton() {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();

  const emergencyTypes = [
    { type: 'Security', icon: 'fa-shield-alt', color: 'from-yellow-500 to-orange-500', desc: 'Security threat or suspicious activity' },
    { type: 'Medical', icon: 'fa-ambulance', color: 'from-red-500 to-pink-500', desc: 'Medical emergency requiring immediate help' },
    { type: 'Fire', icon: 'fa-fire', color: 'from-orange-500 to-red-500', desc: 'Fire or smoke detected' },
  ];

  const handleEmergency = async (type) => {
    setLoading(true);
    try {
      // Get user data to include unit and phone
      const { doc, getDoc } = await import('firebase/firestore');
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      const userData = userDoc.exists() ? userDoc.data() : {};
      
      await addDoc(collection(db, 'emergencies'), {
        type,
        userId: currentUser.uid,
        userEmail: currentUser.email,
        userName: userData.name || 'Unknown',
        userPhone: userData.phone || 'Not provided',
        userUnit: userData.unit || 'Not provided',
        timestamp: serverTimestamp(),
        status: 'active'
      });
      
      // Show success message
      setShowModal(false);
      alert(`🚨 ${type} alert sent successfully! Help is on the way.`);
    } catch (error) {
      alert('Failed to send alert: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <>
      {/* Floating Emergency Button */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-red-500 to-pink-600 shadow-2xl hover:shadow-red-500/50 flex items-center justify-center group hover:scale-110 transition-all z-40 animate-pulse-slow"
      >
        <i className="fas fa-exclamation-triangle text-white text-xl sm:text-2xl group-hover:scale-110 transition-transform"></i>
      </button>

      {/* Emergency Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="text-center mb-4 sm:mb-6">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center mx-auto mb-3 sm:mb-4 animate-pulse">
                <i className="fas fa-exclamation-triangle text-white text-2xl sm:text-3xl"></i>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">Emergency Alert</h2>
              <p className="text-slate-600 text-sm sm:text-base">Select the type of emergency:</p>
            </div>

            <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
              {emergencyTypes.map((emergency, idx) => (
                <button
                  key={idx}
                  onClick={() => handleEmergency(emergency.type)}
                  disabled={loading}
                  className={`w-full bg-gradient-to-r ${emergency.color} text-white p-3 sm:p-4 rounded-xl font-semibold hover:shadow-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed text-left group`}
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-white/20 flex items-center justify-center mr-3 sm:mr-4 group-hover:scale-110 transition-transform flex-shrink-0">
                      <i className={`fas ${emergency.icon} text-xl sm:text-2xl`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-base sm:text-lg">{emergency.type} Emergency</div>
                      <div className="text-xs sm:text-sm text-white/80 line-clamp-1">{emergency.desc}</div>
                    </div>
                    <i className="fas fa-chevron-right ml-2 flex-shrink-0"></i>
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowModal(false)}
              disabled={loading}
              className="w-full bg-slate-100 border border-slate-300 text-slate-700 py-3 rounded-xl hover:bg-slate-200 transition-all font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
