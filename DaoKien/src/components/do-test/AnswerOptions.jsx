"use client";

export default function AnswerOptions({
    questionId,
    choices,
    selectedAnswer,
    onAnswerSelect,
    hideContent = false
}) {
    const labels = ["A", "B", "C", "D"];

    return (
        <div className="space-y-3">
            {choices.map((choice, index) => {
                const label = labels[index] || String.fromCharCode(65 + index);
                const isSelected = selectedAnswer === choice.ID;

                return (
                    <div
                        key={choice.ID}
                        onClick={() => onAnswerSelect(choice.ID)}
                        className={`
              flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer
              transition-all duration-200 hover:shadow-md
              ${isSelected
                                ? "border-blue-500 bg-blue-50 shadow-sm"
                                : "border-gray-200 bg-white hover:border-blue-300"
                            }
            `}
                    >
                        {/* Radio Button */}
                        <div className="flex-shrink-0 mt-0.5">
                            <div
                                className={`
                  w-5 h-5 rounded-full border-2 flex items-center justify-center
                  ${isSelected
                                        ? "border-blue-500 bg-blue-500"
                                        : "border-gray-300 bg-white"
                                    }
                `}
                            >
                                {isSelected && (
                                    <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                                )}
                            </div>
                        </div>

                        {/* Label & Content */}
                        <div className="flex-1">
                            <span
                                className={`
                  font-semibold mr-2
                  ${isSelected ? "text-blue-700" : "text-gray-700"}
                `}
                            >
                                {label}.
                            </span>
                            {!hideContent && (
                                <span
                                    className={`
                    ${isSelected ? "text-gray-800" : "text-gray-600"}
                  `}
                                >
                                    {choice.Content || "Không có nội dung"}
                                </span>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}