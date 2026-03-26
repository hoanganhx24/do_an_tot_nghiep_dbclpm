import { Radio } from "antd";
import "react-quill/dist/quill.snow.css";

function ReadingPart7Question({ q, isReadOnly, onAnswer, index, submit }) {
  const ques = q;
  return (
    <>
      {ques.paragraphs.map((pa) => (
        <div dangerouslySetInnerHTML={{ __html: pa }} />
      ))}

      {ques.assessmentQuestions.map((q, i) => (
        <>
          <div className="question__question" style={{ marginTop: "10px" }}>
            <div className="question__question--number">{i + 1}</div>
            <div className="question__question--title">{q.question}</div>
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
                    value={option}
                    className="question__option"
                    style={{
                      backgroundColor: option.isCorrect ? "#c6f5b6ff" : "white", // đáp án đúng tô màu
                      width: "100%",
                    }}
                  >
                    <div className="question__option--title">
                      {option.content}
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
            // ===== CHẾ ĐỘ LÀM BÀI: giống logic cũ của bạn =====
            <>
              {submit ? (
                <>
                  <Radio.Group disabled style={{ width: "100%" }}>
                    {q.choices.map((option, idx) => (
                      <Radio
                        key={idx}
                        value={option}
                        className="question__option"
                        style={{
                          width: "100%",
                          backgroundColor:
                            (option.isCorrect &&
                              q.answering.content === option.content) ||
                            option.isCorrect
                              ? "#c6f5b6ff"
                              : !option.isCorrect &&
                                q.answering.content === option.content
                              ? "#faceceff"
                              : "white",
                        }}
                      >
                        <div className="question__option--title">
                          {option.content}
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
                  onChange={(e) => onAnswer(index, i, e.target.value)}
                  style={{ width: "100%" }}
                  value={q.answering}
                >
                  {q.choices.map((option, idx) => (
                    <Radio
                      key={idx}
                      value={option}
                      className="question__option"
                      style={{ width: "100%" }}
                    >
                      <div className="question__option--title">
                        {option.content}
                      </div>
                    </Radio>
                  ))}
                </Radio.Group>
              )}
            </>
          )}
        </>
      ))}
    </>
  );
}
export default ReadingPart7Question;
