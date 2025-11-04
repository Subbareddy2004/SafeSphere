import { useState, useEffect } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import Layout from '../components/Layout';

export default function Directory() {
  const [contacts, setContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');

  useEffect(() => {
    const q = query(collection(db, 'contacts'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setContacts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, []);

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.type?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'All' || contact.type === selectedType;
    return matchesSearch && matchesType;
  });

  const types = ['All', ...new Set(contacts.map(c => c.type))];

  const typeColors = {
    'Security': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'Maintenance': 'bg-orange-100 text-orange-700 border-orange-200',
    'Emergency': 'bg-red-100 text-red-700 border-red-200',
    'Management': 'bg-blue-100 text-blue-700 border-blue-200',
    'Reception': 'bg-purple-100 text-purple-700 border-purple-200',
    'Medical': 'bg-red-100 text-red-700 border-red-200',
    'Fire': 'bg-orange-100 text-orange-700 border-orange-200',
    'Police': 'bg-blue-100 text-blue-700 border-blue-200',
  };

  const typeGradients = {
    'Security': 'from-yellow-500 to-orange-500',
    'Maintenance': 'from-orange-500 to-red-500',
    'Emergency': 'from-red-500 to-pink-500',
    'Management': 'from-blue-500 to-cyan-500',
    'Reception': 'from-purple-500 to-pink-500',
    'Medical': 'from-red-500 to-pink-500',
    'Fire': 'from-orange-500 to-red-500',
    'Police': 'from-blue-500 to-indigo-500',
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            <i className="fas fa-address-book mr-3 text-blue-600"></i>
            Contact Directory
          </h1>
          <p className="text-slate-600">Find and connect with residents and services</p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400"></i>
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition shadow-soft"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {types.map(type => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                  selectedType === type
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-soft'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Contacts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContacts.length > 0 ? (
            filteredContacts.map(contact => (
              <div key={contact.id} className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-soft-lg transition-all group card-hover">
                <div className="flex items-start space-x-4 mb-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${typeGradients[contact.type] || 'from-slate-500 to-slate-600'} flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shadow-md`}>
                    {contact.icon || '👤'}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-slate-800 mb-1">{contact.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full border ${typeColors[contact.type] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                      {contact.type}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  {contact.phone && (
                    <a href={`tel:${contact.phone}`} className="flex items-center text-slate-600 hover:text-indigo-600 transition group/item">
                      <i className="fas fa-phone w-5 mr-3 text-green-600"></i>
                      <span className="group-hover/item:underline">{contact.phone}</span>
                    </a>
                  )}
                  {contact.email && (
                    <a href={`mailto:${contact.email}`} className="flex items-center text-slate-600 hover:text-indigo-600 transition group/item">
                      <i className="fas fa-envelope w-5 mr-3 text-blue-600"></i>
                      <span className="group-hover/item:underline break-all">{contact.email}</span>
                    </a>
                  )}
                  {contact.unit && (
                    <div className="flex items-center text-slate-600">
                      <i className="fas fa-home w-5 mr-3 text-purple-600"></i>
                      <span>{contact.unit}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full bg-white border border-slate-200 rounded-2xl p-12 text-center">
              <i className="fas fa-search text-6xl text-slate-300 mb-4"></i>
              <p className="text-slate-600 text-lg font-medium">No contacts found</p>
              <p className="text-slate-500 text-sm mt-2">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
