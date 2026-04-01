import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getCurrentUser, signOutUser } from "../lib/auth";

function Navbar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function loadUser() {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    }

    loadUser();
  }, []);

  async function handleLogout() {
    await signOutUser();
    window.location.href = "/";
  }

  return (
    <nav className="navbar">
      <div className="container nav-content">
        <h2 className="logo">
          <Link to="/">Smart Flow</Link>
        </h2>

        <ul className="nav-links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/products">Products</Link></li>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/contact">Contact</Link></li>

          {!user && <li><Link to="/login">Login</Link></li>}
          {!user && <li><Link to="/register">Register</Link></li>}
          {user && <li><button className="nav-text-btn" onClick={handleLogout}>Logout</button></li>}
        </ul>

        <a
          className="whatsapp-btn"
          href="https://wa.me/201229077644"
          target="_blank"
          rel="noreferrer"
        >
          WhatsApp
        </a>
      </div>
    </nav>
  );
}

export default Navbar;