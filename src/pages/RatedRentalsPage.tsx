import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

type Rating = {
  rentalId: number;
  rating: number;
  dateTime: string;
};

type Rental = {
  id: number;
  title: string;
  rent: number;
  propertyType: string;
  postcode: number;
  state: string;
  suburb: string;
  bedrooms: number;
  bathrooms: number;
  parkingSpaces: number;
};

type RatedRental = {
  rating: Rating;
  rental: Rental;
};

type Pagination = {
  currentPage: number;
  total: number;
  lastPage: number;
  nextPage: number | null;
};

/**
 * Displays all rental properties that the logged-in user has rated.
 */
function RatedRentalsPage() {
  const [ratedRentals, setRatedRentals] = useState<RatedRental[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination | null>(null);

  const [sortBy, setSortBy] = useState("");
  const [selectedPropertyType, setSelectedPropertyType] = useState("");

  const token = localStorage.getItem("token");

  /**
   * Loads the user's ratings and combines each rating with its matching rental details.
   */
  useEffect(() => {
    async function loadRatedRentals() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setMessage("");

        const ratingsRes = await fetch(
          `http://4.237.58.241:3000/ratings?page=${page}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!ratingsRes.ok) {
          throw new Error("Failed to fetch ratings");
        }

        const ratingsData = await ratingsRes.json();
        const ratings: Rating[] = ratingsData.data || [];

        setPagination(ratingsData.pagination || null);

        if (ratings.length === 0) {
          return;
        }

        const combinedData = await Promise.all(
          ratings.map(async (rating) => {
            const rentalRes = await fetch(
              `http://4.237.58.241:3000/rentals/${rating.rentalId}`
            );

            if (!rentalRes.ok) {
              throw new Error(`Failed to fetch rental ${rating.rentalId}`);
            }

            const rentalData = await rentalRes.json();

            const rental: Rental =
              rentalData.data?.rental ||
              rentalData.rental ||
              rentalData.data ||
              rentalData;

            return {
              rating,
              rental,
            };
          })
        );

        setRatedRentals((prev) =>
          page === 1 ? combinedData : [...prev, ...combinedData]
        );
      } catch (error) {
        console.error(error);
        setMessage("Failed to load rated rentals.");
      } finally {
        setLoading(false);
      }
    }

    loadRatedRentals();
  }, [token, page]);

  /**
   * Automatically loads the next ratings page when the user scrolls near the bottom.
   */
  useEffect(() => {
    function handleScroll() {
      const nearBottom =
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 400;

      if (nearBottom && !loading && pagination?.nextPage) {
        setPage((prev) => prev + 1);
      }
    }

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, pagination]);

  const propertyTypes = Array.from(
    new Set(ratedRentals.map((item) => item.rental.propertyType))
  );

  const filteredAndSortedRatedRentals = [...ratedRentals]
    .filter((item) =>
      selectedPropertyType
        ? item.rental.propertyType === selectedPropertyType
        : true
    )
    .sort((a, b) => {
      if (sortBy === "rating-high") {
        return b.rating.rating - a.rating.rating;
      }

      if (sortBy === "rating-low") {
        return a.rating.rating - b.rating.rating;
      }

      if (sortBy === "newest") {
        return (
          new Date(b.rating.dateTime).getTime() -
          new Date(a.rating.dateTime).getTime()
        );
      }

      if (sortBy === "oldest") {
        return (
          new Date(a.rating.dateTime).getTime() -
          new Date(b.rating.dateTime).getTime()
        );
      }

      if (sortBy === "rent-low") {
        return a.rental.rent - b.rental.rent;
      }

      if (sortBy === "rent-high") {
        return b.rental.rent - a.rental.rent;
      }

      return 0;
    });

  return (
    <section className="search-page">
      <h1>Rated Rentals</h1>

      {!token && <p>Please log in to view your rated rentals.</p>}

      {message && <p>{message}</p>}

      {token && (
        <div className="filter-bar">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="">Sort rated rentals</option>
            <option value="rating-high">Highest rating</option>
            <option value="rating-low">Lowest rating</option>
            <option value="newest">Newest rated</option>
            <option value="oldest">Oldest rated</option>
            <option value="rent-low">Rent: Low to High</option>
            <option value="rent-high">Rent: High to Low</option>
          </select>

          <select
            value={selectedPropertyType}
            onChange={(e) => setSelectedPropertyType(e.target.value)}
          >
            <option value="">All Property Types</option>
            {propertyTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="reset-button"
            onClick={() => {
              setSortBy("");
              setSelectedPropertyType("");
            }}
          >
            Reset Filters
          </button>
        </div>
      )}

      {!loading && token && ratedRentals.length === 0 && !message && (
        <p>You have not rated any rentals yet.</p>
      )}

      <div className="rental-list">
        {filteredAndSortedRatedRentals.map((item) => (
          <Link
            to={`/rated/${item.rating.rentalId}`}
            key={`${item.rating.rentalId}-${item.rating.dateTime}`}
            className="rental-link"
          >
            <div className="rental-card">
              <h3>{item.rental.title}</h3>

              <div
                style={{
                  fontSize: "20px",
                  color: "#f5b301",
                  marginBottom: "6px",
                }}
              >
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star}>
                    {star <= item.rating.rating ? "★" : "☆"}
                  </span>
                ))}
              </div>

              <p>
                <strong>Date Rated:</strong>{" "}
                {new Date(item.rating.dateTime).toLocaleDateString()}
              </p>

              <p>
                <strong>Location:</strong> {item.rental.suburb},{" "}
                {item.rental.state} {item.rental.postcode}
              </p>

              <p>
                <strong>Property Type:</strong> {item.rental.propertyType}
              </p>

              <p>
                <strong>Bedrooms:</strong> {item.rental.bedrooms}
              </p>

              <p>
                <strong>Bathrooms:</strong> {item.rental.bathrooms}
              </p>

              <p>
                <strong>Parking:</strong> {item.rental.parkingSpaces}
              </p>

              <p>
                <strong>Rent:</strong> ${item.rental.rent}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {loading && token && <p className="results-count">Loading rated rentals...</p>}

      {!loading &&
        token &&
        ratedRentals.length > 0 &&
        filteredAndSortedRatedRentals.length === 0 && (
          <p className="results-count">
            No rated rentals match this property type.
          </p>
        )}

      {!loading && token && ratedRentals.length > 0 && !pagination?.nextPage && (
        <p className="results-count">
          You have reached the end of your rated rentals.
        </p>
      )}
    </section>
  );
}

export default RatedRentalsPage;