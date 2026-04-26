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

function SearchPage() {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<string[]>([]);

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
  const pageSize = 10; // Set the number of results per page (pagination)

  useEffect(() => {
    fetch("http://4.237.58.241:3000/rentals/search")
      .then((res) => res.json())
      .then((data) => {
        const rentalsData = data.data || data;
        setRentals(rentalsData);
      });

    fetch("http://4.237.58.241:3000/rentals/states")
      .then((res) => res.json())
      .then((data) => setStates(data));

    fetch("http://4.237.58.241:3000/rentals/property-types")
      .then((res) => res.json())
      .then((data) => setPropertyTypes(data));
  }, []);

  const filteredRentals = rentals
    .filter((rental) => {
      const matchesPostcode =
        postcode === "" || String(rental.postcode).includes(postcode);

      const matchesState =
        selectedState === "" || rental.state === selectedState;

      const matchesPropertyType =
        selectedPropertyType === "" ||
        rental.propertyType === selectedPropertyType;

      const matchesMinRent =
        minRent === "" || rental.rent >= Number(minRent);

      const matchesMaxRent =
        maxRent === "" || rental.rent <= Number(maxRent);

      const matchesBedrooms =
        minBedrooms === "" || rental.bedrooms >= Number(minBedrooms);

      const matchesBathrooms =
        minBathrooms === "" || rental.bathrooms >= Number(minBathrooms);

      const matchesParking =
        minParking === "" || rental.parkingSpaces >= Number(minParking);

      return (
        matchesPostcode &&
        matchesState &&
        matchesPropertyType &&
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

  const totalPages = Math.ceil(filteredRentals.length / pageSize);
  const startIndex = (page - 1) * pageSize;
  const paginatedRentals = filteredRentals.slice(startIndex, startIndex + pageSize);

  function resetPage() {
    setPage(1);
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
  setPage(1);
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
            <option key={state} value={state}>{state}</option>
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
            <option key={type} value={type}>{type}</option>
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
          <input type="number" min = "0"placeholder="Min rent" value={minRent} onChange={(e) => { setMinRent(e.target.value); resetPage(); }} />
          <input type="number" min = "0" placeholder="Max rent" value={maxRent} onChange={(e) => { setMaxRent(e.target.value); resetPage(); }} />
          <input type="number" min = "0" placeholder="Min bedrooms" value={minBedrooms} onChange={(e) => { setMinBedrooms(e.target.value); resetPage(); }} />
          <input type="number" min = "0" placeholder="Min bathrooms" value={minBathrooms} onChange={(e) => { setMinBathrooms(e.target.value); resetPage(); }} />
          <input type="number" min = "0" placeholder="Min parking" value={minParking} onChange={(e) => { setMinParking(e.target.value); resetPage(); }} />

          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="">Sort by</option>
            <option value="rent-low">Rent: Low to High</option>
            <option value="rent-high">Rent: High to Low</option>
            <option value="title">Title A-Z</option>
          </select>

          <button
            type="button"
            className="reset-button"
            onClick={resetFilters}
          >
            Reset Filters
          </button>
        </div>
      )}

      <p className="results-count">
        Showing {paginatedRentals.length} of {filteredRentals.length} results
      </p>

      <div className="rental-list">
        {paginatedRentals.map((rental) => (
          <Link to={`/rentals/${rental.id}`} key={rental.id} className="rental-link">
            <div className="rental-card">
              <h3>{rental.title}</h3>
              <p><strong>Location:</strong> {rental.suburb}, {rental.state} {rental.postcode}</p>
              <p><strong>Bedrooms:</strong> {rental.bedrooms}</p>
              <p><strong>Bathrooms:</strong> {rental.bathrooms}</p>
              <p><strong>Parking:</strong> {rental.parkingSpaces}</p>
              <p><strong>Rent:</strong> ${rental.rent}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="pagination">
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>
          Previous
        </button>

        <span>Page {page} of {totalPages || 1}</span>

        <button disabled={page === totalPages || totalPages === 0} onClick={() => setPage(page + 1)}>
          Next
        </button>
      </div>
    </section>
  );
}

export default SearchPage;