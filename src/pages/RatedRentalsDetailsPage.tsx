import { useNavigate, useParams } from "react-router-dom";
import { Map, Marker } from "pigeon-maps";
import { useEffect, useState } from "react";

type RentalDetails = {
  id: number;
  title: string;
  description: string;
  streetAddress: string;
  suburb: string;
  state: string;
  postcode: string;
  bedrooms: number;
  bathrooms: number;
  parkingSpaces: number;
  propertyType: string;
  rent: number;
  latitude: number;
  longitude: number;
};

type NearbyRental = {
  id: number;
  title: string;
  postcode: string;
  latitude: number;
  longitude: number;
};

type Rating = {
  rating: number;
  dateTime: string;
};

function RentalDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [rental, setRental] = useState<RentalDetails | null>(null);
  const [nearbyRentals, setNearbyRentals] = useState<NearbyRental[]>([]);

  const [rating, setRating] = useState<Rating | null>(null);
  const [showRating, setShowRating] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [ratingMessage, setRatingMessage] = useState("");

  useEffect(() => {
    fetch(`http://4.237.58.241:3000/rentals/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setRental(data);

        return fetch(
          `http://4.237.58.241:3000/rentals/search?postcode=${data.postcode}`
        );
      })
      .then((res) => res.json())
      .then((data) => {
        const rentalsData = data.rentals || data.data || data.results || data;

        const validNearby = rentalsData.filter(
          (item: NearbyRental) =>
            item.latitude != null &&
            item.longitude != null &&
            item.id !== Number(id)
        );

        setNearbyRentals(validNearby);
      })
      .catch((error) =>
        console.error("Error fetching rental details/map data:", error)
      );
  }, [id]);

  useEffect(() => {
    if (!token || !id) return;

    fetch(`http://4.237.58.241:3000/ratings/rentals/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data) => {
        if (!data) return;

        setRating(data);
        setSelectedRating(data.rating);
      })
      .catch((error) => console.error("Error fetching rating:", error));
  }, [id, token]);

  async function submitRating() {
    if (!token || !id) {
      setRatingMessage("Please log in first.");
      return;
    }

    if (selectedRating === 0) {
      setRatingMessage("Please select a rating first.");
      return;
    }

    const hadExistingRating = rating !== null;

    try {
      const res = await fetch(
        `http://4.237.58.241:3000/ratings/rentals/${id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            rating: selectedRating,
          }),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to submit rating");
      }

      const data = await res.json();

      setRating(data);
      setSelectedRating(data.rating);
      setShowRating(false);
      setRatingMessage(
        hadExistingRating ? "Rating has been changed!" : "Thank you for rating!"
      );
    } catch (error) {
      console.error(error);
      setRatingMessage("Failed to submit rating.");
    }
  }

  if (!rental) {
    return <p>Loading...</p>;
  }

  const getOffsetMarker = (
    lat: number,
    lng: number,
    index: number
  ): [number, number] => {
    const offset = 0.00015 * (index + 1);
    return [lat + offset, lng + offset];
  };

  return (
    <section className="details-page">
      <h1>{rental.title}</h1>

      {token && (
        <div className="rating-box">
          <h2 style={{ color: "#122248" }}>Your Rating:</h2>

          {ratingMessage && (
            <p style={{ textAlign: "center" }}>
                {ratingMessage}
            </p>
            )}

          {rating && !showRating && (
            <div className="rating-center">
              <div className="rating-star-row">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    style={{
                      color: star <= rating.rating ? "#f5b301" : "#ccc",
                    }}
                  >
                    ★
                  </span>
                ))}
              </div>

              <button
                className="btn-filled"
                onClick={() => {
                  setShowRating(true);
                  setRatingMessage("Please select a new rating.");
                }}
              >
                Update Rating
              </button>
            </div>
          )}

          {showRating && (
            <div className="rating-center">
              <div className="rating-star-row">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    onClick={() => setSelectedRating(star)}
                    style={{
                      color: star <= selectedRating ? "#f5b301" : "#ccc",
                    }}
                  >
                    ★
                  </span>
                ))}
              </div>

              <button className="btn-filled" onClick={submitRating}>
                Submit Rating
              </button>
            </div>
          )}

          {!rating && !showRating && (
            <div className="rating-center">
              <button
                className="btn-filled"
                onClick={() => {
                  setShowRating(true);
                  setRatingMessage("You can now add a rating");
                }}
              >
                Rate this property
              </button>
            </div>
          )}
        </div>
      )}

      <div className="details-map">
        <Map
          height={350}
          defaultCenter={[rental.latitude, rental.longitude]}
          defaultZoom={15}
        >
          <Marker
            width={50}
            anchor={[rental.latitude, rental.longitude]}
            color="#122248"
            payload={rental.id}
          />

          {nearbyRentals.map((item, index) => {
            const [lat, lng] =
              item.latitude === rental.latitude &&
              item.longitude === rental.longitude
                ? getOffsetMarker(item.latitude, item.longitude, index)
                : [item.latitude, item.longitude];

            return (
              <Marker
                key={item.id}
                width={40}
                anchor={[lat, lng]}
                color="#0567da"
                payload={item.id}
                onClick={({ payload }) => navigate(`/rentals/${payload}`)}
              />
            );
          })}
        </Map>
      </div>

      <p>
        <strong>Address:</strong> {rental.streetAddress}, {rental.suburb},{" "}
        {rental.state} {rental.postcode}
      </p>

      <p>
        <strong>Property Type:</strong> {rental.propertyType}
      </p>

      <p>
        <strong>Bedrooms:</strong> {rental.bedrooms}
      </p>

      <p>
        <strong>Bathrooms:</strong> {rental.bathrooms}
      </p>

      <p>
        <strong>Parking:</strong> {rental.parkingSpaces}
      </p>

      <p>
        <strong>Rent:</strong> ${rental.rent}
      </p>

      <div className="details-description">
        <h2>Description</h2>
        <p
            dangerouslySetInnerHTML={{
            __html: rental.description,
            }}
        />
        </div>
    </section>
  );
}

export default RentalDetailsPage;