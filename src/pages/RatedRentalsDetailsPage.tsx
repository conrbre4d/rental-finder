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
      .then((res) => res?.json())
      .then((data) => {
        if (!data) return;

        const rentalsData = data.data || data;

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
    if (!token || !id || selectedRating === 0) {
      setRatingMessage("Please select a rating first.");
      return;
    }

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
      setRatingMessage("Review submitted!");
    } catch (error) {
      console.error(error);
      setRatingMessage("Failed to submit review.");
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
      <p><strong>Property Type:</strong> {rental.propertyType}</p>
      <p><strong>Bedrooms:</strong> {rental.bedrooms}</p>
      <p><strong>Bathrooms:</strong> {rental.bathrooms}</p>
      <p><strong>Parking:</strong> {rental.parkingSpaces}</p>
      <p><strong>Rent:</strong> ${rental.rent}</p>

      {token && (
        <div className="rating-box">
          <h3>Your Rating</h3>

          {rating && (
            <p>
              <span className="rating-stars">
                {"★".repeat(rating.rating)}
                {"☆".repeat(5 - rating.rating)}
              </span>{" "}
              {rating.rating}/5
            </p>
          )}

          {!showRating && (
            <button onClick={() => setShowRating(true)}>
              {rating ? "Update Rating" : "Rate this property"}
            </button>
          )}

          {showRating && (
            <div>
              <p>Select rating:</p>

              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  onClick={() => setSelectedRating(num)}
                  className={
                    selectedRating >= num
                      ? "star-button selected"
                      : "star-button"
                  }
                >
                  ★
                </button>
              ))}

              <div>
                <button onClick={submitRating}>Submit Review</button>
              </div>
            </div>
          )}

          {ratingMessage && <p>{ratingMessage}</p>}
        </div>
      )}

      {!token && (
        <p className="login-rating-message">
          Log in to rate this property.
        </p>
      )}

      <div className="details-description">
        <strong>Description:</strong>
        {rental.description.split("<br/>").map((line, index) => (
          <p key={index}>{line}</p>
        ))}
      </div>
    </section>
  );
}

export default RentalDetailsPage;