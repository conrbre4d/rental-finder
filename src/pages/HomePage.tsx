import { Link } from "react-router-dom";

function HomePage() {

  return (
  <section className="home-hero">
    <img src="/hero.jpg" alt="Hero" className="hero-image" />

    <div className="hero-overlay-bg"></div>

    <div className="hero-overlay">
      <h1>
        Discover a space <span className="italic">you&apos;ll love</span>.
      </h1>
      <p>
        Browse rental properties across Australia and find a place that suits your lifestyle!
      </p>

      <Link to="/search" className="hero-button">
        Start Searching
      </Link>
    </div>
  </section>
  );
}

export default HomePage;

