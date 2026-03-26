"use client"

export default function PartTabs({ currentPart, onPartChange, parts }) {
  // Đảm bảo currentPart luôn hợp lệ và convert sang string để so sánh
  const normalizedParts = parts.map(p => String(p));
  const normalizedCurrentPart = String(currentPart);
  const safeCurrentPart = normalizedParts.includes(normalizedCurrentPart) 
    ? normalizedCurrentPart 
    : normalizedParts[0];

  return (
    <div className="bg-white border-b border-gray-200 px-6 sticky top-0 z-10 shadow-sm">
      <div className="flex gap-2 overflow-x-auto">
        {normalizedParts.map((part) => (
          <button
            key={part}
            onClick={() => onPartChange(part)}
            className={`py-3 px-4 font-semibold border-b-3 transition-all whitespace-nowrap ${
              safeCurrentPart === part
                ? "text-blue-600 border-b-4 border-blue-600 bg-blue-50"
                : "text-gray-600 border-transparent hover:text-blue-500 hover:bg-gray-50"
            }`}
          >
            Part {part}
          </button>
        ))}
      </div>
    </div>
  )
}