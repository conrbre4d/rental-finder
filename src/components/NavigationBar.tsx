import { Link, useNavigate } from "react-router-dom";

/**
 * Displays the main navigation bar and updates links based on login status.
 */
function Navbar(){
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  /**
   * Handles the logout functionality by removing the token from local storage and navigating to the home page.
   */
  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/"); // go home after logout
    window.location.reload(); // force refresh navbar
  }

  return (
    <nav className="navbar">
      <Link to="/" className="nav-left">
        <img src="/logo.png" alt="Rental Finder Logo" className="logo" />
      </Link>

      <div className="nav-center">
        <Link to="/">Home</Link>
        <Link to="/search">Rental Search</Link>
        <Link to="/about">About</Link>

        {token && <Link to="/rated">Rated Rentals</Link>}
      </div>

      <div className="nav-right">
        {token ? (
          <Link to="/" onClick={handleLogout}>
            Logout
          </Link>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;