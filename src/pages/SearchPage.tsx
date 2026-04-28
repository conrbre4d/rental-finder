import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

type Rental = {
  id: number;
  title: string;
  state: string;
  suburb: string;
  postcode: string | number;
  bedrooms: number;
  bathrooms: number;
  parkingSpaces: number;
  rent: number;
  propertyType: string;
};

type Pagination = {
  perPage: number;
  currentPage: number;
  from: number;
  to: number;
  total: number;
  lastPage: number;
  prevPage: number | null;
  nextPage: number | null;
};

function SearchPage() {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<string[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);

  const [selectedRental, setSelectedRental] = useState<Rental | null>(null);

  const [postcode, setPostcode] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedPropertyType, setSelectedPropertyType] = useState("");

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [minRent, setMinRent] = useState("");
  const [maxRent, setMaxRent] = useState("");
  const [minBedrooms, setMinBedrooms] = useState("");
  const [minBathrooms, setMinBathrooms] = useState("");
  const [minParking, setMinParking] = useState("");
  const [sortBy, setSortBy] = useState("");

  const [page, setPage] = useState(1);

  // const { id } = useParams();
  const token = localStorage.getItem("token");

 const [userRatings, setUserRatings] = useState<Record<number, number>>({});

 const [ratedMessage, setRatedMessage] = useState<Record<number, boolean>>({});

  useEffect(() => {
    fetch("http://4.237.58.241:3000/rentals/states")
      .then((res) => res.json())
      .then((data) => setStates(data));

    fetch("http://4.237.58.241:3000/rentals/property-types")
      .then((res) => res.json())
      .then((data) => setPropertyTypes(data));
  }, []);

  useEffect(() => {
    async function fetchRentals() {
      const params = new URLSearchParams();

      params.append("page", String(page));

      if (postcode) params.append("postcode", postcode);
      if (selectedState) params.append("state", selectedState);
      if (selectedPropertyType) {
        params.append("propertyTypes", selectedPropertyType);
      }

      const res = await fetch(
        `http://4.237.58.241:3000/rentals/search?${params.toString()}`
      );

      const data = await res.json();

      if (data.error) {
        console.log(data.message);
        setRentals([]);
        return;
      }

      setRentals(data.rentals || data.data || data.results || []);
      setPagination(data.pagination || null);
      setSelectedRental(null);
    }

    fetchRentals();
  }, [page, postcode, selectedState, selectedPropertyType]);

  // Auto sctroll to top when page changes
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [page]);

  const displayedRentals = rentals
    .filter((rental) => {
      const matchesMinRent = minRent === "" || rental.rent >= Number(minRent);
      const matchesMaxRent = maxRent === "" || rental.rent <= Number(maxRent);
      const matchesBedrooms =
        minBedrooms === "" || rental.bedrooms >= Number(minBedrooms);
      const matchesBathrooms =
        minBathrooms === "" || rental.bathrooms >= Number(minBathrooms);
      const matchesParking =
        minParking === "" || rental.parkingSpaces >= Number(minParking);

      return (
        matchesMinRent &&
        matchesMaxRent &&
        matchesBedrooms &&
        matchesBathrooms &&
        matchesParking
      );
    })
    .sort((a, b) => {
      if (sortBy === "rent-low") return a.rent - b.rent;
      if (sortBy === "rent-high") return b.rent - a.rent;
      if (sortBy === "title") return a.title.localeCompare(b.title);
      return 0;
    });

  const nearbyRentals = selectedRental
    ? rentals.filter(
        (rental) =>
          String(rental.postcode) === String(selectedRental.postcode) &&
          rental.id !== selectedRental.id
      )
    : [];

  function resetPage() {
    setPage(1);
    setSelectedRental(null);
  }

  function resetFilters() {
    setPostcode("");
    setSelectedState("");
    setSelectedPropertyType("");
    setMinRent("");
    setMaxRent("");
    setMinBedrooms("");
    setMinBathrooms("");
    setMinParking("");
    setSortBy("");
    setSelectedRental(null);
    setPage(1);
  }

  async function submitRating(rentalId: number) {
    const selectedRating = userRatings[rentalId];

    if (!token || !selectedRating) {
      return;
    }

    try {
      const res = await fetch(
        `http://4.237.58.241:3000/ratings/rentals/${rentalId}`,
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
      
      setRatedMessage({
        ...ratedMessage,
        [rentalId]: true,
      });
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <section className="search-page">
      <h1>Rental Search</h1>

      <div className="filter-bar">
        <input
          className="filter-input"
          type="text"
          placeholder="Postcode"
          value={postcode}
          onChange={(e) => {
            setPostcode(e.target.value);
            resetPage();
          }}
        />

        <select
          value={selectedState}
          onChange={(e) => {
            setSelectedState(e.target.value);
            resetPage();
          }}
        >
          <option value="">All States</option>
          {states.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>

        <select
          value={selectedPropertyType}
          onChange={(e) => {
            setSelectedPropertyType(e.target.value);
            resetPage();
          }}
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
          className="advanced-button"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          Advanced Search
        </button>
      </div>

      {showAdvanced && (
        <div className="advanced-search-panel">
          <input type="number" min="0" placeholder="Min rent" value={minRent} onChange={(e) => setMinRent(e.target.value)} />
          <input type="number" min="0" placeholder="Max rent" value={maxRent} onChange={(e) => setMaxRent(e.target.value)} />
          <input type="number" min="0" placeholder="Min bedrooms" value={minBedrooms} onChange={(e) => setMinBedrooms(e.target.value)} />
          <input type="number" min="0" placeholder="Min bathrooms" value={minBathrooms} onChange={(e) => setMinBathrooms(e.target.value)} />
          <input type="number" min="0" placeholder="Min parking" value={minParking} onChange={(e) => setMinParking(e.target.value)} />

          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="">Sort by</option>
            <option value="rent-low">Rent: Low to High</option>
            <option value="rent-high">Rent: High to Low</option>
            <option value="title">Title A-Z</option>
          </select>

          <button type="button" className="reset-button" onClick={resetFilters}>
            Reset Filters
          </button>
        </div>
      )}

      <p className="results-count">
        Showing {pagination ? pagination.from + 1 : 0}–
        {pagination ? pagination.to : 0} of {pagination ? pagination.total : 0} results
      </p>

      <div className="rental-list">
        {displayedRentals.map((rental) => (
          <div
            key={rental.id}
            className="rental-card"
            onClick={() => setSelectedRental(rental)}
          >
            <Link to={`/rentals/${rental.id}`} className="rental-link">
              <h3>{rental.title}</h3>
              <p><strong>Location:</strong> {rental.suburb}, {rental.state} {rental.postcode}</p>
              <p><strong>Bedrooms:</strong> {rental.bedrooms}</p>
              <p><strong>Bathrooms:</strong> {rental.bathrooms}</p>
              <p><strong>Parking:</strong> {rental.parkingSpaces}</p>
              <p><strong>Rent:</strong> ${rental.rent}</p>
            </Link>

            <div
                style={{
                  marginTop: "20px",
                  textAlign: "center",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <Link to={`/rentals/${rental.id}`}>
                  <button>View</button>
                </Link>

                <div style={{ marginTop: "10px" }}>
                  {ratedMessage[rental.id] ? (
                    <p>Thank you for rating!</p>
                  ) : userRatings[rental.id] !== undefined ? (
                    <>
                      <div style={{ fontSize: "28px", cursor: "pointer" }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            onClick={() =>
                              setUserRatings({
                                ...userRatings,
                                [rental.id]: star,
                              })
                            }
                            style={{
                              color:
                                star <= (userRatings[rental.id] || 0)
                                  ? "#f5b301"
                                  : "#ccc",
                            }}
                          >
                            ★
                          </span>
                        ))}
                      </div>

                      <button onClick={() => submitRating(rental.id)}>Submit</button>
                    </>
                  ) : (
                    token && (
                      <button
                        onClick={() =>
                          setUserRatings({
                            ...userRatings,
                            [rental.id]: 0,
                          })
                        }
                      >
                        Rate
                      </button>
                    )
                  )}
                </div>
              </div>

          </div>
        ))}
      </div>

      {selectedRental && (
        <div className="nearby-rentals">
          <h2>Nearby rentals in {selectedRental.postcode}</h2>

          {nearbyRentals.length === 0 ? (
            <p>No nearby rentals with the same postcode on this page.</p>
          ) : (
            nearbyRentals.slice(0, 5).map((rental) => (
              <Link to={`/rentals/${rental.id}`} key={rental.id} className="rental-link">
                <div className="rental-card">
                  <h3>{rental.title}</h3>
                  <p><strong>Location:</strong> {rental.suburb}, {rental.state} {rental.postcode}</p>
                  <p><strong>Rent:</strong> ${rental.rent}</p>
                </div>
              </Link>
            ))
          )}
        </div>
        
      )}

      <div className="pagination">
        <button disabled={!pagination?.prevPage} onClick={() => setPage(page - 1)}>
          Previous
        </button>

        <span>
          Page {pagination?.currentPage || page} of {pagination?.lastPage || 1}
        </span>

        <button disabled={!pagination?.nextPage} onClick={() => setPage(page + 1)}>
          Next
        </button>
      </div>
    </section>
  );
}

export default SearchPage;