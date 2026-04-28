import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import SearchPage from "./pages/SearchPage";
import RentalDetailsPage from "./pages/RentalDetailsPage";
import LogInPage from "./pages/LogInPage";
import RegisterPage from "./pages/RegisterPage";
import RatedRentalsPage from "./pages/RatedRentalsPage";
import RatedRentalsDetailsPage from "./pages/RatedRentalsDetailsPage";
import AboutPage from "./pages/AboutPage";

import NavBar from "./components/NavigationBar";

function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />

        <Route path="/rentals/:id" element={<RentalDetailsPage />} />

        <Route path="/rated" element={<RatedRentalsPage />} />
        <Route path="/rated/:id" element={<RatedRentalsDetailsPage />} />

        <Route path="/login" element={<LogInPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;