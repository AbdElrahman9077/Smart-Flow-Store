import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import PageWrapper from "../components/PageWrapper";

function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    orders: 0,
    customRequests: 0,
    products: 0,
    downloads: 0,
  });

  useEffect(() => {
    async function fetchStats() {
      const [
        usersRes,
        ordersRes,
        customRes,
        productsRes,
        downloadsRes,
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("*", { count: "exact", head: true }),
        supabase.from("custom_requests").select("*", { count: "exact", head: true }),
        supabase.from("products").select("*", { count: "exact", head: true }),
        supabase.from("download_logs").select("*", { count: "exact", head: true }),
      ]);

      setStats({
        users: usersRes.count || 0,
        orders: ordersRes.count || 0,
        customRequests: customRes.count || 0,
        products: productsRes.count || 0,
        downloads: downloadsRes.count || 0,
      });
    }

    fetchStats();
  }, []);

  return (
    <PageWrapper>
      <div className="container page-section">
        <h1 className="page-title">Admin Dashboard</h1>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Users</h3>
            <p>{stats.users}</p>
          </div>

          <div className="stat-card">
            <h3>Total Orders</h3>
            <p>{stats.orders}</p>
          </div>

          <div className="stat-card">
            <h3>Custom Requests</h3>
            <p>{stats.customRequests}</p>
          </div>

          <div className="stat-card">
            <h3>Products</h3>
            <p>{stats.products}</p>
          </div>

          <div className="stat-card">
            <h3>Downloads</h3>
            <p>{stats.downloads}</p>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

export default AdminDashboard;