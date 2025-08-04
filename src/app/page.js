'use client';

import { useEffect, useState } from 'react';
import Link from "next/link";

export default function Dashboard() {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      const res = await fetch('/api/user');
      const data = await res.json();
      console.log("Analytics", data);

      setAnalytics(data);
    };

    fetchAnalytics();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <h1 className="text-xl font-bold mb-6">Welcome To AI Crawler Chat</h1>
      <div className="flex gap-4">
        <Link href="/user" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300">Personalize with User</Link>
        <Link href="/chat" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300">Chat</Link>
      </div>
      {analytics &&
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-12">
          {analytics.totalUsers &&
            <div className="bg-sky-100 text-sky-900 p-4 rounded-xl shadow">
              <h2 className="text-xl font-semibold">Total Users</h2>
              <p className="text-3xl">{analytics.totalUsers}</p>
            </div>
          }
          <div className="bg-sky-100 text-sky-900 p-4 rounded-xl shadow">
            <h2 className="text-xl font-semibold">Total Queries</h2>
            <p className="text-3xl">{analytics.totalQueries}</p>
          </div>
        </div>
      }
    </div>
  );
}
