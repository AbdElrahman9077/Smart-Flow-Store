import { Link } from "react-router-dom";

function Navbar() {
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
        </ul>

        <a
          className="whatsapp-btn"
          href="https://wa.me/201037461971"
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