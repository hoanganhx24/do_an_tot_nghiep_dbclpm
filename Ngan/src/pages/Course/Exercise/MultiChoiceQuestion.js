import { Checkbox } from "antd";

function MultiChoiceQuestion({ q, i, isReadOnly, onAnswer, submit }) {
  return (
    <>
      <div className="question__question">
        <div className="question__question--number">{i + 1}</div>
        <div className="question__question--title">{q.questionText}</div>
      </div>
      {isReadOnly ? (
        // ===== CHẾ ĐỘ CHỈ ĐỌC: chỉ hiển thị đáp án đúng + giải thích =====
        <>
          <Checkbox.Group
            style={{ width: "100%", flexDirection: "column" }}
            disabled // không cho người dùng thay đổi
          >
            {q.choices.map((option, idx) => (
              <Checkbox
                key={idx}
                value={option}
                className="question__option"
                style={{
                  backgroundColor: option.isCorrect ? "#c6f5b6ff" : "white", // đáp án đúng tô màu
                  width: "100%",
                }}
              >
                <div className="question__option--title">{option.content}</div>
              </Checkbox>
            ))}
          </Checkbox.Group>

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
              <Checkbox.Group
                disabled
                style={{ width: "100%", flexDirection: "column" }}
              >
                {q.choices.map((option, idx) => (
                  <Checkbox
                    key={idx}
                    value={option.content}
                    className="question__option"
                    style={{
                      backgroundColor:
                        (q.answering?.includes(option) && option?.isCorrect)||
                        (option?.selected && option?.isCorrect)||
                        option?.isCorrect
                          ? "#c6f5b6ff"
                          : (q.answering?.includes(option) && !option?.isCorrect) || (option?.selected && !option?.isCorrect)
                          ? "#faceceff"
                          : "white",
                    }}
                  >
                    <div className="question__option--title">{option?.content}</div>
                  </Checkbox>
                ))}
              </Checkbox.Group>

              {q.explain && (
                <div style={{ marginTop: "10px" }}>
                  <h4>Giải thích: {q.explain}</h4>
                </div>
              )}
            </>
          ) : (
            <Checkbox.Group
              value={Array.isArray(q.answering) ? q.answering : [q.answering]}
              onChange={(checkedValues) => onAnswer(i, checkedValues)}
              style={{ width: "100%", flexDirection: "column" }}
            >
              {q.choices.map((option, idx) => (
                <Checkbox key={idx} value={option} className="question__option">
                  <div className="question__option--title">{option.content}</div>
                </Checkbox>
              ))}
            </Checkbox.Group>
          )}
        </>
      )}
    </>
  );
}
export default MultiChoiceQuestion;
