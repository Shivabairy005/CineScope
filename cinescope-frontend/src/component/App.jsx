export default function App() {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white space-y-6 p-4">
        {/* Title */}
        <h1 className="text-6xl font-specialgothic mb-8 tracking-wide">CineScope</h1>
  
        {/* Upload Box */}
        <div className="flex items-center border border-gray-400 rounded-xl overflow-hidden w-full max-w-xl">
          <input
            type="file"
            className="flex-grow px-4 py-2 outline-none"
          />
          <button className="bg-gray-900 text-white px-4 py-2 hover:bg-gray-700">
            Upload
          </button>
        </div>
  
        {/* Analyze Button */}
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
          Analyze
        </button>
      </div>
    );
  }

  