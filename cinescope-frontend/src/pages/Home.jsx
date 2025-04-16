// src/pages/Home.jsx
import { useState, useRef } from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'

export default function Home() {
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [screenplay, setScreenplay] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('script')
  const [analysisInfo, setAnalysisInfo] = useState(null)
  const inputRef = useRef()

  const handleFile = (selectedFile) => {
    if (!selectedFile) return
    if (selectedFile.type.startsWith('video')) {
      setFile(selectedFile)
      setPreviewUrl(URL.createObjectURL(selectedFile))
    }
  }

  const resetSelection = () => {
    setFile(null)
    setPreviewUrl(null)
    setScreenplay('')
    setAnalysisInfo(null)
    setActiveTab('script')
  }

  const handleAnalyze = async () => {
    if (!file) return
    setLoading(true)
    setScreenplay('')
    setAnalysisInfo(null)
    setActiveTab('script')

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await axios.post('http://localhost:5000/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setScreenplay(res.data.screenplay)
      setAnalysisInfo(res.data.analysis)
    } catch (err) {
      console.error(err)
      setScreenplay('An error occurred while analyzing the video.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10 text-center">
      <h1 className="text-5xl font-specialgothic mb-10 tracking-wide">CineScope</h1>

      {!file && (
        <div
          className="w-full max-w-2xl h-60 border-2 border-dashed rounded-xl p-6 mb-6 flex flex-col items-center justify-center transition border-gray-300 bg-white cursor-pointer hover:border-blue-400"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault()
            const droppedFile = e.dataTransfer.files[0]
            handleFile(droppedFile)
          }}
          onClick={() => inputRef.current.click()}
        >
          <p className="text-gray-600 text-sm">
            Drag & drop your video here or click to choose a file
          </p>
        </div>
      )}

      <input
        type="file"
        accept="video/*"
        ref={inputRef}
        onChange={(e) => handleFile(e.target.files[0])}
        className="hidden"
      />

      {file && (
        <>
          <video
            src={previewUrl}
            controls
            className="max-w-xl w-full max-h-72 rounded-lg shadow mb-2"
          />
          <p className="text-sm text-gray-600 italic mb-4">{file.name}</p>

          <div className="flex flex-col items-center gap-4 mb-4 sm:flex-row sm:gap-6">
            <button
              onClick={resetSelection}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg shadow"
            >
              Reset
            </button>

            <button
              onClick={handleAnalyze}
              disabled={!file || loading}
              className={`px-6 py-2 rounded-lg font-semibold shadow transition ${
                !file || loading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {loading ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>
        </>
      )}

      {!file && (
        <button
          onClick={handleAnalyze}
          disabled
          className="mt-2 px-6 py-2 rounded-lg font-semibold shadow bg-gray-300 text-gray-500 cursor-not-allowed"
        >
          Analyze
        </button>
      )}

      {screenplay && (
        <>
          <div className="mt-6 flex gap-4 border-b border-gray-300">
            <button
              onClick={() => setActiveTab('analysis')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'analysis'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-blue-500'
              }`}
            >
              Analysis
            </button>
            <button
              onClick={() => setActiveTab('script')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'script'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-blue-500'
              }`}
            >
              Script
            </button>
          </div>

          <div className="max-w-xl w-full mt-4">
            {activeTab === 'analysis' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-lg shadow p-6 text-left text-gray-700 text-sm space-y-3 border"
              >
                {analysisInfo ? (
                  <>
                    <p><strong>Shot Type:</strong> {analysisInfo.shot_type}</p>
                    <p><strong>Color Grading:</strong> {analysisInfo.color_grade}</p>
                  </>
                ) : (
                  <p className="text-gray-500 italic">Loading analysis...</p>
                )}
              </motion.div>
            )}

            {activeTab === 'script' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-lg shadow p-6 text-center whitespace-pre-wrap text-[15px] leading-relaxed tracking-wide max-h-[400px] overflow-y-auto border border-gray-300"
                style={{ fontFamily: 'Courier Prime, monospace' }}
              >
                {screenplay}
              </motion.div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
