"use client";
import AnswerOptions from "./AnswerOptions";

export default function QuestionContent({
  part,
  questions,
  selectedAnswers,
  onAnswerSelect,
  testData,
}) {
  // Tạo mapping Question ID → Global Number
  const questionNumberMap = new Map();
  let globalCounter = 1;
  
  const sortedParts = [...testData.parts].sort((a, b) => Number(a) - Number(b));
  
  sortedParts.forEach(p => {
    const partQuestions = testData.questions.filter(
      q => String(q.Media?.Section) === String(p)
    );
    
    // QUAN TRỌNG: Sắp xếp theo ID (thứ tự tạo câu hỏi) thay vì OrderIndex
    // Vì OrderIndex có thể không đáng tin cậy khi admin tạo đề
    const sortedPartQuestions = [...partQuestions].sort((a, b) => a.ID - b.ID);
    
    sortedPartQuestions.forEach(q => {
      questionNumberMap.set(q.ID, globalCounter);
      globalCounter++;
    });
  });

  // Nhóm câu hỏi theo Media ID và sắp xếp theo global number nhỏ nhất
  const groupByMediaId = () => {
    const mediaMap = new Map();
    
    questions.forEach((q) => {
      const mediaId = q.Media?.ID || `no-media-${q.ID}`;
      
      if (!mediaMap.has(mediaId)) {
        mediaMap.set(mediaId, {
          media: q.Media,
          questions: [],
          minGlobalNumber: Infinity // Lưu global number nhỏ nhất trong nhóm
        });
      }
      
      const group = mediaMap.get(mediaId);
      group.questions.push(q);
      
      // Cập nhật global number nhỏ nhất
      const globalNum = questionNumberMap.get(q.ID);
      if (globalNum < group.minGlobalNumber) {
        group.minGlobalNumber = globalNum;
      }
    });
    
    // Sắp xếp các nhóm theo global number nhỏ nhất
    const groups = Array.from(mediaMap.values()).sort(
      (a, b) => a.minGlobalNumber - b.minGlobalNumber
    );
    
    // Sắp xếp câu hỏi trong mỗi nhóm
    groups.forEach(group => {
      group.questions.sort(
        (a, b) => questionNumberMap.get(a.ID) - questionNumberMap.get(b.ID)
      );
    });
    
    return groups;
  };

  const groupedQuestions = groupByMediaId();

  const isPart5 = part === "5";
  const hideChoices = part === "1" || part === "2";

  return (
    <div className="flex-1 overflow-auto p-6 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto space-y-8">
        {groupedQuestions.map((group, groupIdx) => {
          const { media, questions: groupQuestions } = group;

          // Kiểm tra có media không
          const hasMedia = media && (media.AudioUrl || media.ImageUrl || media.Script);

          return (
            <div
              key={groupIdx}
              className={`bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200 ${
                isPart5 || !hasMedia ? "" : "flex flex-col lg:flex-row"
              }`}
            >
              {/* MEDIA BÊN TRÁI */}
              {!isPart5 && hasMedia && (
                <div className="lg:w-2/5 flex-shrink-0 bg-gradient-to-br from-gray-50 to-gray-100 p-6 border-r border-gray-200">
                  <div className="lg:sticky lg:top-6 space-y-4">
                    {/* Media Type Badge */}
                    {media.Type && (
                      <div className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full mb-2">
                        {media.Type.replace(/_/g, ' ')}
                      </div>
                    )}

                    {/* Script/Passage */}
                    {media.Script && (
                      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <div className="whitespace-pre-line text-gray-800 leading-relaxed">
                          {media.Script}
                        </div>
                      </div>
                    )}

                    {/* Audio */}
                    {media.AudioUrl && (
                      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <div className="text-xs font-semibold text-gray-500 uppercase mb-2">
                          🎧 Audio
                        </div>
                        <audio controls className="w-full rounded-md">
                          <source src={media.AudioUrl} type="audio/mp3" />
                          Your browser does not support audio.
                        </audio>
                      </div>
                    )}

                    {/* Image */}
                    {media.ImageUrl && (
                      <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-200">
                        <img
                          src={media.ImageUrl}
                          alt="Question media"
                          className="w-full rounded-md object-cover"
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect fill="%23f0f0f0" width="400" height="300"/><text x="50%" y="50%" text-anchor="middle" fill="%23999" font-size="18">Image not available</text></svg>';
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* CÂU HỎI BÊN PHẢI */}
              <div className={`${isPart5 || !hasMedia ? "w-full" : "flex-1"} p-6`}>
                <div className="space-y-6">
                  {groupQuestions.map((q) => {
                    const questionNumber = questionNumberMap.get(q.ID);
                    const choices = q.Choices || [];

                    return (
                      <div
                        key={q.ID}
                        id={`q-${questionNumber}`}
                        className="p-5 bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
                      >
                        {/* Question Header */}
                        <div className="flex items-center gap-3 mb-4">
                          <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                            {questionNumber}
                          </div>
                          <div className="text-sm font-semibold text-indigo-600">
                            Question {questionNumber}
                          </div>
                        </div>

                        {/* Question Text */}
                        <p className="text-gray-800 mb-4 leading-relaxed font-medium text-lg">
                          {q.QuestionText || "Không có nội dung câu hỏi"}
                        </p>

                        {/* Answer Choices */}
                        {!hideChoices && choices.length > 0 && (
                          <AnswerOptions
                            questionId={q.ID}
                            choices={choices}
                            selectedAnswer={selectedAnswers[q.ID]}
                            onAnswerSelect={(choiceId) => onAnswerSelect(q.ID, choiceId)}
                          />
                        )}

                        {/* Part 1, 2: Radio buttons nhưng ẩn content */}
                        {hideChoices && choices.length > 0 && (
                          <AnswerOptions
                            questionId={q.ID}
                            choices={choices}
                            selectedAnswer={selectedAnswers[q.ID]}
                            onAnswerSelect={(choiceId) => onAnswerSelect(q.ID, choiceId)}
                            hideContent={true}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}