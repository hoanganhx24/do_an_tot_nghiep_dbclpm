import { Radio } from "antd";

function TrueFalseQuestion({ q, i, isReadOnly, onAnswer, submit }) {
  return (
    <>
      <div className="question__question">
        <div className="question__question--number">{i + 1}</div>
        <div className="question__question--title">{q.questionText}</div>
      </div>

      {isReadOnly ? (
        // ===== CHẾ ĐỘ CHỈ ĐỌC: chỉ hiển thị đáp án đúng + giải thích =====
        <>
          <Radio.Group
            style={{ width: "100%" }}
            disabled // không cho người dùng thay đổi
          >
            {q?.choices?.map((option, idx) => (
              <Radio
                key={idx}
                value={option?.content}
                className="question__option"
                style={{
                  backgroundColor: option.isCorrect ? "#c6f5b6ff" : "white", // đáp án đúng tô màu
                  width: "100%",
                }}
              >
                <div className="question__option--title">{option?.content}</div>
              </Radio>
            ))}
          </Radio.Group>

          {q.explain && (
            <div style={{ marginTop: "10px" }}>
              <h4>Giải thích: {q.explain}</h4>
            </div>
          )}
        </>
      ) : (
        // ===== CHẾ ĐỘ LÀM BÀI: giống logic cũ của bạn =====
        <>
          {submit ? (
            <>
              <Radio.Group
                style={{ width: "100%" }}
                disabled // không cho người dùng thay đổi
              >
                {q?.choices?.map((option, idx) => (
                  <Radio
                    key={idx}
                    value={option}
                    className="question__option"
                    style={{
                      width: "100%",
                      backgroundColor:
                        (option?.isCorrect &&
                          q.answering?.content === option?.content) ||
                        (option?.isCorrect && option?.selected) || option?.isCorrect
                          ? "#c6f5b6ff"
                          : !option?.isCorrect &&
                            ((q.answering?.content === option?.content) || option?.selected)
                          ? "#faceceff"
                          : "white",
                    }}
                  >
                    <div className="question__option--title">
                      {option?.content}
                    </div>
                  </Radio>
                ))}
              </Radio.Group>

              {q.explain && (
                <div style={{ marginTop: "10px" }}>
                  <h4>Giải thích: {q.explain}</h4>
                </div>
              )}
            </>
          ) : (
            <Radio.Group
              onChange={(e) => onAnswer(i, e.target.value)}
              style={{ width: "100%" }}
              value={q.answering}
            >
              {q?.choices?.map((option, idx) => (
                <Radio
                  key={idx}
                  value={option}
                  className="question__option"
                  style={{ width: "100%" }}
                >
                  <div className="question__option--title">
                    {option?.content}
                  </div>
                </Radio>
              ))}
            </Radio.Group>
          )}
        </>
      )}
    </>
  );
}
export default TrueFalseQuestion;
