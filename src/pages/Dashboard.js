import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function Dashboard() {
  const [stats, setStats] = useState({
    owners: 0,
    units: 0,
    tenants: 0,
    contracts: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const owners = await getDocs(collection(db, 'owners'));
    const units = await getDocs(collection(db, 'units'));
    const tenants = await getDocs(collection(db, 'tenants'));
    const contracts = await getDocs(collection(db, 'contracts'));
    
    setStats({
      owners: owners.size,
      units: units.size,
      tenants: tenants.size,
      contracts: contracts.size
    });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1e3a5f] mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-gray-500 mb-2">الملاك</h3>
          <p className="text-3xl font-bold text-[#1e3a5f]">{stats.owners}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-gray-500 mb-2">الوحدات</h3>
          <p className="text-3xl font-bold text-[#1e3a5f]">{stats.units}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-gray-500 mb-2">المستأجرين</h3>
          <p className="text-3xl font-bold text-[#1e3a5f]">{stats.tenants}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-gray-500 mb-2">العقود</h3>
          <p className="text-3xl font-bold text-[#1e3a5f]">{stats.contracts}</p>
        </div>
      </div>
    </div>
  );
}