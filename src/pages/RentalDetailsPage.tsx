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

/**
 * Displays full rental details and a map showing the selected rental and nearby rentals.
 */
function RentalDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rental, setRental] = useState<RentalDetails | null>(null);
  const [nearbyRentals, setNearbyRentals] = useState<NearbyRental[]>([]);

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

  if (!rental) {
    return <p>Loading...</p>;
  }

  /**
   * Slightly offsets nearby map markers when they share the same coordinates.
   * @param latitude - The original latitude.
   * @param longitude - The original longitude.
   * @param index - The marker index used to calculate the offset.
   * @returns The adjusted latitude and longitude.
   */
  const getOffsetMarker = (
    latitude: number,
    longitude: number,
    index: number
  ): [number, number] => {
    const offset = 0.00015 * (index + 1);
    return [latitude + offset, longitude + offset];
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
          {/* Current rental marker */}
          <Marker
            width={50}
            anchor={[rental.latitude, rental.longitude]}
            color="#122248"
            payload={rental.id}
          />

          {/* Other rentals in same postcode */}
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

      <div className="details-description">
        <strong>Description:</strong>
        {rental.description.split("<br/>").map((line, index) => (<p key={index}>{line}</p>))}
      </div>
    </section>
  );
}

export default RentalDetailsPage;