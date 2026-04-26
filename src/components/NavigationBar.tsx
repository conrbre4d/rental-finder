import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="nav-left">
        <img src="/logo.png" alt="Rental Finder Logo" className="logo" />
      </Link>

      <div className="nav-center">
        <Link to="/">Home</Link>
        <Link to="/search">Rental Search</Link>
        <Link to="/about">About</Link>
      </div>

      <div className="nav-right">
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
      </div>
    </nav>
  );
}

export default Navbar;