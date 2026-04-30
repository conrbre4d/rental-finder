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

function RatedRentalsPage() {
  const [ratedRentals, setRatedRentals] = useState<RatedRental[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

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
          "http://4.237.58.241:3000/ratings?page=1",
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
        const ratings: Rating[] = ratingsData.data;

        if (!ratings || ratings.length === 0) {
          setRatedRentals([]);
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

        setRatedRentals(combinedData);
      } catch (error) {
        console.error(error);
        setMessage("Failed to load rated rentals.");
      } finally {
        setLoading(false);
      }
    }

    loadRatedRentals();
  }, [token]);

  return (
    <section className="search-page">
      <h1>Rated Rentals</h1>

      {!token && <p>Please log in to view your rated rentals.</p>}
      {loading && token && <p>Loading rated rentals...</p>}
      {message && <p>{message}</p>}

      {!loading && token && ratedRentals.length === 0 && !message && (
        <p>You have not rated any rentals yet.</p>
      )}

      <div className="rental-list">
        {ratedRentals.map((item) => (
          <Link
            to={`/rated/${item.rating.rentalId}`}
            key={item.rental.id}
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
    </section>
  );
}

export default RatedRentalsPage;