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

/**
 * Cleans rental titles by removing broken emoji/question mark characters from the API.
 *
 * @param title - The original rental title from the API
 * @returns The cleaned title
 */
function cleanTitle(title: string) {
  return title
    .replace(/[\u{1F300}-\u{1FAFF}]/gu, "")
    .replace(/\?\uFE0F?/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Displays rental listings with filters, pagination, infinite scroll, nearby rental previews, and rating actions.
 */
function SearchPage() {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<string[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);

  const [selectedRental, setSelectedRental] = useState<Rental | null>(null);

  const [suburb, setSuburb] = useState("");
  const [postcode, setPostcode] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedPropertyType, setSelectedPropertyType] = useState("");

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [minRent, setMinRent] = useState("");
  const [maxRent, setMaxRent] = useState("");
  const [minBedrooms, setMinBedrooms] = useState("");
  const [maxBedrooms, setMaxBedrooms] = useState("");
  const [minBathrooms, setMinBathrooms] = useState("");
  const [maxBathrooms, setMaxBathrooms] = useState("");
  const [minParking, setMinParking] = useState("");
  const [maxParking, setMaxParking] = useState("");
  const [minRating, setMinRating] = useState("");
  const [maxRating, setMaxRating] = useState("");
  const [sortBy, setSortBy] = useState("");

  const [page, setPage] = useState(1);
  const [infiniteScroll, setInfiniteScroll] = useState(false);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  const [userRatings, setUserRatings] = useState<Record<number, number>>({});
  const [ratedMessage, setRatedMessage] = useState<Record<number, boolean>>({});

  /**
   * Resets pagination to the first page when a search filter changes.
   */
  function resetPage() {
    setPage(1);
    setSelectedRental(null);
  }

  /**
   * Clears all search filters and returns the rental list to the first page.
   */
  function resetFilters() {
    setSuburb("");
    setPostcode("");
    setSelectedState("");
    setSelectedPropertyType("");
    setMinRent("");
    setMaxRent("");
    setMinBedrooms("");
    setMaxBedrooms("");
    setMinBathrooms("");
    setMaxBathrooms("");
    setMinParking("");
    setMaxParking("");
    setMinRating("");
    setMaxRating("");
    setSortBy("");
    setSelectedRental(null);
    setPage(1);
    setRentals([]);
  }

  useEffect(() => {
    fetch("http://4.237.58.241:3000/rentals/states")
      .then((res) => res.json())
      .then((data) => setStates(data));

    fetch("http://4.237.58.241:3000/rentals/property-types")
      .then((res) => res.json())
      .then((data) => setPropertyTypes(data));
  }, []);

  useEffect(() => {
    /**
     * Fetches rentals from the API using the selected filters, sorting option, and page number.
     */
    async function fetchRentals() {
      try {
        setLoading(true);

        const params = new URLSearchParams();

        params.append("page", String(page));

        if (suburb) params.append("suburb", suburb);
        if (postcode) params.append("postcode", postcode);
        if (selectedState) params.append("state", selectedState);
        if (selectedPropertyType) {
          params.append("propertyTypes", selectedPropertyType);
        }

        if (minRent) params.append("minimumRent", minRent);
        if (maxRent) params.append("maximumRent", maxRent);

        if (minBedrooms) params.append("minimumBedrooms", minBedrooms);
        if (maxBedrooms) params.append("maximumBedrooms", maxBedrooms);

        if (minBathrooms) params.append("minimumBathrooms", minBathrooms);
        if (maxBathrooms) params.append("maximumBathrooms", maxBathrooms);

        if (minParking) params.append("minimumParking", minParking);
        if (maxParking) params.append("maximumParking", maxParking);

        if (minRating) params.append("minimumRating", minRating);
        if (maxRating) params.append("maximumRating", maxRating);

        if (sortBy === "rent-low") {
          params.append("sortBy", "rent");
          params.append("sortOrder", "asc");
        }

        if (sortBy === "rent-high") {
          params.append("sortBy", "rent");
          params.append("sortOrder", "desc");
        }

        if (sortBy === "title") {
          params.append("sortBy", "title");
          params.append("sortOrder", "asc");
        }

        const res = await fetch(
          `http://4.237.58.241:3000/rentals/search?${params.toString()}`
        );

        const data = await res.json();

        if (data.error) {
          setRentals([]);
          setPagination(null);
          return;
        }

        const newRentals = data.rentals || data.data || data.results || [];

        setRentals((prev) =>
          infiniteScroll && page > 1 ? [...prev, ...newRentals] : newRentals
        );

        setPagination(data.pagination || null);
        setSelectedRental(null);
      } catch (error) {
        console.error(error);
        setRentals([]);
        setPagination(null);
      } finally {
        setLoading(false);
      }
    }

    fetchRentals();
  }, [
    page,
    infiniteScroll,
    suburb,
    postcode,
    selectedState,
    selectedPropertyType,
    minRent,
    maxRent,
    minBedrooms,
    maxBedrooms,
    minBathrooms,
    maxBathrooms,
    minParking,
    maxParking,
    minRating,
    maxRating,
    sortBy,
  ]);

  useEffect(() => {
    if (!infiniteScroll) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, [page, infiniteScroll]);

  useEffect(() => {
    if (!infiniteScroll) return;

    function handleScroll() {
      const nearBottom =
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 400;

      if (nearBottom && !loading && pagination?.nextPage) {
        setPage((prev) => prev + 1);
      }
    }

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [infiniteScroll, loading, pagination]);

  const nearbyRentals = selectedRental
    ? rentals.filter(
        (rental) =>
          String(rental.postcode) === String(selectedRental.postcode) &&
          rental.id !== selectedRental.id
      )
    : [];

  /**
   * Submits the selected rating for a rental property.
   * @param rentalId - The ID of the rental being rated.
   */
  async function submitRating(rentalId: number) {
    const selectedRating = userRatings[rentalId];

    if (!token) {
      alert("Please log in first.");
      return;
    }

    if (selectedRating === undefined || selectedRating === 0) {
      alert("Please select a rating first.");
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

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to submit rating.");
        return;
      }

      setRatedMessage((prev) => ({
        ...prev,
        [rentalId]: true,
      }));
    } catch (err) {
      console.error(err);
      alert("Failed to submit rating.");
    }
  }

  return (
    <section className="search-page">
      <h1>Rental Search</h1>

      <div className="filter-bar">
        <input
          className="filter-input"
          type="text"
          placeholder="Suburb"
          value={suburb}
          onChange={(e) => {
            setSuburb(e.target.value);
            resetPage();
          }}
        />

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
          <input
            type="number"
            min="0"
            placeholder="Min rent"
            value={minRent}
            onChange={(e) => {
              setMinRent(e.target.value);
              resetPage();
            }}
          />

          <input
            type="number"
            min="0"
            placeholder="Max rent"
            value={maxRent}
            onChange={(e) => {
              setMaxRent(e.target.value);
              resetPage();
            }}
          />

          <input
            type="number"
            min="0"
            placeholder="Min bedrooms"
            value={minBedrooms}
            onChange={(e) => {
              setMinBedrooms(e.target.value);
              resetPage();
            }}
          />

          <input
            type="number"
            min="0"
            placeholder="Max bedrooms"
            value={maxBedrooms}
            onChange={(e) => {
              setMaxBedrooms(e.target.value);
              resetPage();
            }}
          />

          <input
            type="number"
            min="0"
            placeholder="Min bathrooms"
            value={minBathrooms}
            onChange={(e) => {
              setMinBathrooms(e.target.value);
              resetPage();
            }}
          />

          <input
            type="number"
            min="0"
            placeholder="Max bathrooms"
            value={maxBathrooms}
            onChange={(e) => {
              setMaxBathrooms(e.target.value);
              resetPage();
            }}
          />

          <input
            type="number"
            min="0"
            placeholder="Min parking"
            value={minParking}
            onChange={(e) => {
              setMinParking(e.target.value);
              resetPage();
            }}
          />

          <input
            type="number"
            min="0"
            placeholder="Max parking"
            value={maxParking}
            onChange={(e) => {
              setMaxParking(e.target.value);
              resetPage();
            }}
          />

          <input
            type="number"
            min="0"
            max="5"
            step="0.5"
            placeholder="Min rating"
            value={minRating}
            onChange={(e) => {
              setMinRating(e.target.value);
              resetPage();
            }}
          />

          <input
            type="number"
            min="0"
            max="5"
            step="0.5"
            placeholder="Max rating"
            value={maxRating}
            onChange={(e) => {
              setMaxRating(e.target.value);
              resetPage();
            }}
          />

          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              resetPage();
            }}
          >
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

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        <p className="results-count" style={{ marginBottom: 0 }}>
          {infiniteScroll
            ? `Loaded ${rentals.length} of ${
                pagination ? pagination.total : 0
              } results`
            : `Showing ${pagination ? pagination.from + 1 : 0}–${
                pagination ? pagination.to : 0
              } of ${pagination ? pagination.total : 0} results`}
        </p>

        <button
          type="button"
          className="btn-filled"
          onClick={() => {
            setInfiniteScroll((prev) => !prev);
            setPage(1);
            setRentals([]);
            setSelectedRental(null);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          {infiniteScroll ? "Switch to Pagination" : "Switch to Infinite Scroll"}
        </button>
      </div>

      <div className="rental-list">
        {rentals.map((rental) => (
          <div
            key={rental.id}
            className="rental-card"
            onClick={() => setSelectedRental(rental)}
          >
            <Link to={`/rentals/${rental.id}`} className="rental-link">
              <h3>{cleanTitle(rental.title)}</h3>

              <p>
                <strong>Location:</strong> {rental.suburb}, {rental.state}{" "}
                {rental.postcode}
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
            </Link>

            <div
              style={{
                marginTop: "20px",
                textAlign: "center",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <Link to={`/rentals/${rental.id}`}>
                <button className="btn-outline">View</button>
              </Link>

              <div style={{ marginTop: "10px" }}>
                {ratedMessage[rental.id] ? (
                  <p>Thank you for rating!</p>
                ) : userRatings[rental.id] !== undefined ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <div style={{ fontSize: "28px", cursor: "pointer" }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          onClick={() =>
                            setUserRatings((prev) => ({
                              ...prev,
                              [rental.id]: star,
                            }))
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

                    <button
                      className="btn-filled"
                      onClick={() => submitRating(rental.id)}
                    >
                      Submit
                    </button>
                  </div>
                ) : (
                  token && (
                    <button
                      className="btn-filled"
                      onClick={() =>
                        setUserRatings((prev) => ({
                          ...prev,
                          [rental.id]: 0,
                        }))
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

      {loading && <p className="results-count">Loading rentals...</p>}

      {!loading && rentals.length === 0 && (
        <p className="results-count">
          No rentals found. Try changing your filters.
        </p>
      )}

      {infiniteScroll &&
        !loading &&
        !pagination?.nextPage &&
        rentals.length > 0 && (
          <p className="results-count">
            You have reached the end of the results.
          </p>
        )}

      {selectedRental && (
        <div className="nearby-rentals">
          <h2>Nearby rentals in {selectedRental.postcode}</h2>

          {nearbyRentals.length === 0 ? (
            <p>No nearby rentals with the same postcode on this page.</p>
          ) : (
            nearbyRentals.slice(0, 5).map((rental) => (
              <Link
                to={`/rentals/${rental.id}`}
                key={rental.id}
                className="rental-link"
              >
                <div className="rental-card">
                  <h3>{cleanTitle(rental.title)}</h3>

                  <p>
                    <strong>Location:</strong> {rental.suburb}, {rental.state}{" "}
                    {rental.postcode}
                  </p>

                  <p>
                    <strong>Rent:</strong> ${rental.rent}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      )}

      {!infiniteScroll && (
        <div className="pagination">
          <button
            disabled={!pagination?.prevPage}
            onClick={() => {
              setPage(page - 1);
              setTimeout(() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }, 50);
            }}
          >
            Previous
          </button>
          

          <span>
            Page {pagination?.currentPage || page} of{" "}
            {pagination?.lastPage || 1}
          </span>

          <button
            disabled={!pagination?.nextPage}
            onClick={() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
              setPage(page + 1);
            }}
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
}

export default SearchPage;