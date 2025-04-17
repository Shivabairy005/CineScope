import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Landing from "./pages/Landing"; 
import Home from "./pages/Home";
import Tutorials from "./pages/Tutorial";

function App() {
  return (
    <Router>
      <div className="p-4 flex justify-between items-center border-b shadow-sm">
        <Link to="/" className="text-2xl font-bold">CineScope</Link>
        <div className="space-x-4">
          <Link to="/analyze" className="text-blue-600 hover:underline">Analyze</Link>
          <Link to="/tutorials" className="text-blue-600 hover:underline">Tutorials</Link>
        </div>
      </div>

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/analyze" element={<Home />} />
        <Route path="/tutorials" element={<Tutorials />} />
      </Routes>
    </Router>
  );
}

export default App;
