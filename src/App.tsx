import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Episodes from "./pages/Episodes";
import Location from "./pages/Location";
import CardDetails from "./pages/CardDetails";

export default function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <div className="min-h-screen bg-theme-app text-theme selection:bg-indigo-500 selection:text-white transition-colors duration-300">
        <div className="fixed top-0 left-1/4 w-[500px] h-[500px] glow-indigo rounded-full blur-[120px] pointer-events-none -z-10" />
        <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] glow-emerald rounded-full blur-[120px] pointer-events-none -z-10" />

        <Navbar />
        <main className="container mx-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/:id" element={<CardDetails />} />

            <Route path="/episodes" element={<Episodes />} />
            <Route path="/episodes/:id" element={<CardDetails />} />

            <Route path="/location" element={<Location />} />
            <Route path="/location/:id" element={<CardDetails />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
