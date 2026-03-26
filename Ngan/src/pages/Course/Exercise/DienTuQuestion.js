import React, { useEffect, useState } from "react";
import { Input } from "antd";

function DienTuQuestion({ q, i, isReadOnly, submit, onAnswer }) {
  const [parts, setParts] = useState([]);

  useEffect(() => {
    const splitParts = q.questionText.split("_______");
    setParts(splitParts);
  }, [q.questionText]);

  return (
    <div className="question__question">
      <div className="question__question--number">{i + 1}</div>
      <div className="question__question--title">
        {/* ========== 1) CHẾ ĐỘ CHỈ ĐỌC ========== */}
        {isReadOnly ? (
          <>
            {parts.map((part, idx) => (
              <React.Fragment key={idx}>
                {part}
                {idx < parts.length - 1 && (
                  <strong style={{ color: "#52c41a", margin: "0 4px" }}>
                    {q.answers[idx]}
                  </strong>
                )}
              </React.Fragment>
            ))}

            {q.explain && (
              <div style={{ marginTop: "10px" }}>
                <h4>Giải thích: {q.explain}</h4>
              </div>
            )}
          </>
        ) : (
          /* ========== 2 & 3) CHẾ ĐỘ LÀM BÀI ========== */
          <>
            {parts.map((part, idx) => (
              <React.Fragment key={idx}>
                {part}

                {idx < parts.length - 1 && (
                  <Input
                    value={q.answering?.[idx] || ""}
                    disabled={submit} // nếu đã nộp thì khóa input
                    onChange={(e) => onAnswer(i, idx, e.target.value)}
                    style={{
                      width: 140,
                      margin: "0 6px",
                      borderBottom: "2px solid #1890ff",
                      borderRadius: 0,
                      borderTop: "none",
                      borderLeft: "none",
                      borderRight: "none",
                      textAlign: "center",

                      // ======= Màu sau khi nộp bài =======
                      background: submit
                        ? q.answering[idx] === q.answers[idx]
                          ? "#c6f5b6ff" // đúng
                          : "#faceceff" // sai
                        : "white",
                    }}
                  />
                )}
              </React.Fragment>
            ))}

            {/* Giải thích chỉ hiện khi submit */}
            {submit && q.explain && (
              <div style={{ marginTop: "10px" }}>
                <h4>Giải thích: {q.explain}</h4>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default DienTuQuestion;
