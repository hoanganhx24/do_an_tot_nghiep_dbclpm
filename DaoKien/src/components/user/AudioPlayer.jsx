"use client"

import { useRef, useState, useEffect } from "react"
import { Volume2, Settings } from "lucide-react"

export default function AudioPlayer({ highlightEnabled, onHighlightToggle, audioUrl }) {
  const audioRef = useRef(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime)
    const handleLoadedMetadata = () => setDuration(audio.duration)

    audio.addEventListener("timeupdate", handleTimeUpdate)
    audio.addEventListener("loadedmetadata", handleLoadedMetadata)

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate)
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata)
    }
  }, [audioUrl])

  const formatTime = (sec) => {
    const mins = Math.floor(sec / 60)
    const secs = Math.floor(sec % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleSeek = (e) => {
    const audio = audioRef.current
    const time = (e.target.value / 100) * duration
    audio.currentTime = time
  }

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={highlightEnabled}
            onChange={(e) => onHighlightToggle(e.target.checked)}
            className="w-5 h-5"
          />
          <span className="text-sm text-gray-700">Highlight nội dung</span>
        </div>

        <div className="flex-1 flex items-center gap-4">
          <button
            onClick={() => audioRef.current?.play()}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <Volume2 size={20} />
          </button>

          <div className="flex-1 flex items-center gap-2">
            <span className="text-xs text-gray-500">{formatTime(currentTime)}</span>
            <input
              type="range"
              className="flex-1"
              value={duration ? (currentTime / duration) * 100 : 0}
              onChange={handleSeek}
            />
            <span className="text-xs text-gray-500">{formatTime(duration)}</span>
          </div>

          <button className="p-2 hover:bg-gray-100 rounded">
            <Settings size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}
