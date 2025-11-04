import { useState, useEffect, useRef } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export default function EmergencyAlerts() {
  const [emergencies, setEmergencies] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [previousCount, setPreviousCount] = useState(0);
  const [soundPlaying, setSoundPlaying] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const soundIntervalRef = useRef(null);
  const audioContextRef = useRef(null);
  const isFirstLoad = useRef(true);

  // Play emergency siren sound using audio file
  const playEmergencySoundOnce = () => {
    try {
      // Create audio element with emergency siren sound
      // Using a data URL for an emergency siren sound
      const audio = new Audio();
      
      // Set volume
      audio.volume = 0.6;
      
      // Use a free emergency siren sound from a CDN or create one
      // For now, we'll use the Web Audio API to create a realistic siren
      const audioContext = audioContextRef.current || new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;
      
      const now = audioContext.currentTime;
      
      // Create realistic ambulance/police siren (European style)
      const createSirenTone = (startTime, startFreq, endFreq, duration, volume) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Use sawtooth for harsh siren sound
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(startFreq, startTime);
        oscillator.frequency.linearRampToValueAtTime(endFreq, startTime + duration);
        
        // Volume envelope
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.05);
        gainNode.gain.setValueAtTime(volume, startTime + duration - 0.05);
        gainNode.gain.linearRampToValueAtTime(0, startTime + duration);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };
      
      // Classic European ambulance siren pattern (NEE-NAW)
      // NEE (high pitch)
      createSirenTone(now, 650, 750, 0.6, 0.6);
      
      // NAW (low pitch)
      createSirenTone(now + 0.6, 450, 550, 0.6, 0.6);
      
      // NEE (high pitch)
      createSirenTone(now + 1.2, 650, 750, 0.6, 0.6);
      
      // NAW (low pitch)
      createSirenTone(now + 1.8, 450, 550, 0.6, 0.6);
      
      console.log('🚨 Emergency siren played');
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  // Start continuous sound loop
  const startContinuousSound = () => {
    if (soundIntervalRef.current) {
      console.log('⚠️ Sound already playing, skipping...');
      return; // Already playing
    }
    
    console.log('🔊 Starting continuous emergency sound...');
    setSoundPlaying(true);
    playEmergencySoundOnce(); // Play immediately
    
    // Then play every 3 seconds
    soundIntervalRef.current = setInterval(() => {
      console.log('🔁 Playing sound loop...');
      playEmergencySoundOnce();
    }, 3000);
    
    console.log('✅ Continuous emergency sound started, interval ID:', soundIntervalRef.current);
  };

  // Stop continuous sound
  const stopContinuousSound = () => {
    if (soundIntervalRef.current) {
      console.log('🔇 Stopping emergency sound, interval ID:', soundIntervalRef.current);
      clearInterval(soundIntervalRef.current);
      soundIntervalRef.current = null;
      setSoundPlaying(false);
      console.log('✅ Emergency sound stopped');
    } else {
      console.log('ℹ️ No sound to stop');
    }
  };

  // Handle acknowledge button
  const handleAcknowledge = () => {
    console.log('👍 Admin acknowledged emergency, stopping sound');
    setAcknowledged(true);
    stopContinuousSound();
  };

  useEffect(() => {
    console.log('🎬 EmergencyAlerts: Setting up listener...');
    
    const emergenciesQuery = query(
      collection(db, 'emergencies'),
      where('status', '==', 'active')
    );

    const unsubscribe = onSnapshot(
      emergenciesQuery, 
      (snapshot) => {
        const emergencyData = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data
          };
        });
        
        // Sort manually by timestamp
        emergencyData.sort((a, b) => {
          const timeA = a.timestamp?.toDate?.() || new Date(0);
          const timeB = b.timestamp?.toDate?.() || new Date(0);
          return timeB - timeA;
        });
        
        console.log('📊 Current emergencies:', emergencyData.length, 'Previous:', previousCount, 'First load:', isFirstLoad.current);
        
        // On first load, just set the initial count without playing sound
        if (isFirstLoad.current) {
          console.log('ℹ️ First load, setting initial count to:', emergencyData.length);
          isFirstLoad.current = false;
          setPreviousCount(emergencyData.length);
          setEmergencies(emergencyData);
          return;
        }
        
        // Check if this is a new emergency (count increased)
        const isNewEmergency = emergencyData.length > previousCount;
        
        // Start sound if NEW emergency arrived
        if (isNewEmergency) {
          console.log('🚨 NEW emergency detected! Count went from', previousCount, 'to', emergencyData.length);
          setAcknowledged(false); // Reset acknowledgment
          stopContinuousSound(); // Stop any existing sound first
          
          // Small delay to ensure state is updated
          setTimeout(() => {
            startContinuousSound(); // Start fresh
          }, 100);
        }
        
        // Stop sound if all emergencies resolved
        if (emergencyData.length === 0 && previousCount > 0) {
          console.log('✅ All emergencies resolved, stopping sound');
          stopContinuousSound();
          setAcknowledged(false);
        }
        
        setPreviousCount(emergencyData.length);
        setEmergencies(emergencyData);
      },
      (error) => {
        console.error('❌ EmergencyAlerts: Error listening to emergencies:', error);
      }
    );

    return () => {
      console.log('🧹 EmergencyAlerts: Cleaning up...');
      unsubscribe();
      stopContinuousSound();
    };
  }, []); // Empty dependency array - only run once

  const handleResolve = async (emergencyId) => {
    try {
      await updateDoc(doc(db, 'emergencies', emergencyId), {
        status: 'resolved',
        resolvedAt: new Date()
      });
    } catch (error) {
      alert('Failed to resolve emergency: ' + error.message);
    }
  };

  const getEmergencyIcon = (type) => {
    switch (type) {
      case 'Security': return 'fa-shield-alt';
      case 'Medical': return 'fa-ambulance';
      case 'Fire': return 'fa-fire';
      default: return 'fa-exclamation-triangle';
    }
  };

  const getEmergencyColor = (type) => {
    switch (type) {
      case 'Security': return 'bg-yellow-500';
      case 'Medical': return 'bg-red-500';
      case 'Fire': return 'bg-orange-500';
      default: return 'bg-red-500';
    }
  };

  if (emergencies.length === 0) {
    return null;
  }

  const displayedEmergencies = showAll ? emergencies : emergencies.slice(0, 3);

  return (
    <div className="bg-gradient-to-r from-red-500 to-pink-500 border-2 border-red-400 rounded-xl p-6 shadow-soft-lg animate-pulse-slow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
            <i className={`fas fa-exclamation-triangle text-white text-xl ${soundPlaying ? 'animate-bounce' : ''}`}></i>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">🚨 Active Emergencies</h2>
            <p className="text-white/90 text-sm">
              {emergencies.length} alert{emergencies.length !== 1 ? 's' : ''} requiring attention
              {soundPlaying && <span className="ml-2">🔊 Sound playing...</span>}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Acknowledge Button */}
          {soundPlaying && !acknowledged && (
            <button
              onClick={handleAcknowledge}
              className="px-4 py-2 bg-yellow-400 text-slate-900 rounded-lg font-semibold hover:bg-yellow-300 transition text-sm flex items-center space-x-2 animate-pulse shadow-md"
            >
              <i className="fas fa-volume-mute"></i>
              <span>Acknowledge & Mute</span>
            </button>
          )}
          
          {/* View All Button */}
          {emergencies.length > 3 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="px-4 py-2 bg-white text-red-600 rounded-lg font-semibold hover:bg-red-50 transition text-sm shadow-md"
            >
              {showAll ? 'Show Less' : `View All (${emergencies.length})`}
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {displayedEmergencies.map((emergency) => (
          <div key={emergency.id} className="bg-white rounded-lg p-4 shadow-soft-lg border border-slate-200">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <div className={`w-12 h-12 ${getEmergencyColor(emergency.type)} rounded-lg flex items-center justify-center flex-shrink-0 shadow-md`}>
                  <i className={`fas ${getEmergencyIcon(emergency.type)} text-white text-xl`}></i>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-slate-800 font-bold text-lg">{emergency.type} Emergency</h3>
                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full animate-pulse border border-red-200">
                      ACTIVE
                    </span>
                  </div>
                  <div className="space-y-1 mb-2">
                    <p className="text-slate-700 text-sm font-medium">
                      <i className="fas fa-user mr-2 text-blue-600"></i>
                      {emergency.userName || emergency.userEmail}
                    </p>
                    <p className="text-slate-600 text-sm">
                      <i className="fas fa-phone mr-2 text-green-600"></i>
                      {emergency.userPhone || 'Not provided'}
                    </p>
                    <p className="text-slate-600 text-sm">
                      <i className="fas fa-home mr-2 text-purple-600"></i>
                      Unit: {emergency.userUnit || 'Not provided'}
                    </p>
                  </div>
                  <p className="text-slate-500 text-xs">
                    <i className="fas fa-clock mr-2"></i>
                    {emergency.timestamp?.toDate().toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleResolve(emergency.id)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition text-sm flex-shrink-0 ml-4 shadow-md"
              >
                <i className="fas fa-check mr-2"></i>
                Resolve
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
