
/**
 * Displays information about the purpose and features of the rental application.
 */
function AboutPage() {
  return (
    <section className="about-page">
      <div className="about-container">
        
        <div className="about-image">
          <img src="/about.jpg" alt="About Rental Finder" />
        </div>

        <div className="about-text">
          <h1>About Us</h1>
          <p>
            Rental Finder helps users explore rental properties across Australia! Founded in 2005, 
            we have been dedicated to connecting renters with their ideal spaces for nearly two decades. 
            Our mission is to make the rental search process simple, efficient, and enjoyable for everyone by allowing clients to 
            browse listings seamlessly, view details easily, and find a place that suits their lifestyle efficiently.
          </p>

          <h2>What you can do</h2>
          <ul>
            <li>Browse rental properties across Australia</li>
            <li>Filter by state and property type</li>
            <li>View detailed property information</li>
            <li>Rate properties after logging in</li>
            <li>Save time with easy and fast searching</li>
          </ul>
        </div>

      </div>
    </section>
  );
}

export default AboutPage;