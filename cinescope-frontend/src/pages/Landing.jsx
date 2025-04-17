// src/pages/Landing.jsx
import { useNavigate } from "react-router-dom"

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white to-slate-100 px-4">
      <h1 className="text-6xl font-bold text-blue-800 font-specialgothic mb-6">CineScope</h1>
      <p className="text-gray-700 max-w-xl text-center text-lg mb-10">
      A Web Based Movie Analysis System using Computer Vision and YOLO.
      </p>

      <div className="flex gap-6">
        <button
          onClick={() => navigate("/analyze")}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Analyze Scene
        </button>
        <button
          onClick={() => navigate("/tutorials")}
          className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
        >
          Tutorials
        </button>
      </div>
    </div>
  )
}
