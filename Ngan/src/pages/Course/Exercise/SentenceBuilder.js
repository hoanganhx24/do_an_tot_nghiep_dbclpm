import React, { useState, useEffect } from "react";
import "./sentence.css";

function SentenceBuilder({ q, i, isReadOnly, submit, onAnswer }) {
  const correctWords = q.correctSentence.map((w, idx) => ({ id: idx, text: w }));

  const [bank, setBank] = useState([]);
  const [sentence, setSentence] = useState([]);

  // === INIT STATE ===
  useEffect(() => {
    if (isReadOnly) {
      // CHỈ ĐỌC → CHỈ HIỂN THỊ ĐÁP ÁN ĐÚNG
      setSentence(correctWords);
      setBank([]);
    } else if (!submit) {
      // CHƯA NỘP → CHẾ ĐỘ KÉO THẢ
      const initBank = correctWords;
      setBank(initBank);
      setSentence([]);
    } else {
      // ĐÃ NỘP → HIỂN THỊ CÂU USER CHỌN + CHECK ĐÚNG SAI
      const userSentence = q.userSentence.map((w, idx) => ({
        id: idx,
        text: w,
      }));
      setSentence(userSentence);
      setBank([]);
    }
  }, [isReadOnly, submit, q]);

  // === DRAG EVENTS (CHỈ HOẠT ĐỘNG KHI CHƯA NỘP + KHÔNG Ở CHẾ ĐỘ READONLY) ===
  const dragEnabled = !isReadOnly && !submit;

  const handleDragStart = (e, word, source) => {
    if (!dragEnabled) return;
    e.dataTransfer.setData("text/plain", JSON.stringify({ id: word.id, source }));
  };

  const handleDragOver = (e) => {
    if (!dragEnabled) return;
    e.preventDefault();
  };

  const handleDropToSentence = (e) => {
    if (!dragEnabled) return;
    e.preventDefault();

    const data = e.dataTransfer.getData("text/plain");
    if (!data) return;

    const { id, source } = JSON.parse(data);

    if (source === "bank") {
      const word = bank.find((w) => w.id === id);
      if (!word) return;

      setBank((prev) => prev.filter((w) => w.id !== id));
      setSentence((prev) => {
        const newSentence = [...prev, word];
        onAnswer?.(i, newSentence.map((x) => x.text)); // gửi về parent
        return newSentence;
      });
    }
  };

  const handleDropToBank = (e) => {
    if (!dragEnabled) return;
    e.preventDefault();

    const data = e.dataTransfer.getData("text/plain");
    if (!data) return;

    const { id, source } = JSON.parse(data);

    if (source === "sentence") {
      const word = sentence.find((w) => w.id === id);
      if (!word) return;

      setSentence((prev) => {
        const newSentence = prev.filter((w) => w.id !== id);
        onAnswer?.(i, newSentence.map((x) => x.text));
        return newSentence;
      });

      setBank((prev) => [...prev, word]);
    }
  };

  const currentSentence = sentence.map((w) => w.text).join(" ");

  const checkCorrect = (index, text) =>
    text === q.correctSentence[index]
      ? "#c6f5b6ff"
      : "#faceceff";

  return (
    <div className="sentence-builder">
      <div className="question__question">
        <div className="question__question--number">{i + 1}</div>
        <div className="question__question--title">{q.questionText}</div>
      </div>

      {/* BANK */}
      <div
        className="sb-bank"
        onDragOver={handleDragOver}
        onDrop={handleDropToBank}
      >
        <div className="sb-word-list">
          {bank.map((word) => (
            <div
              key={word.id}
              className="sb-word"
              draggable={dragEnabled}
              onDragStart={(e) => handleDragStart(e, word, "bank")}
            >
              {word.text}
            </div>
          ))}
        </div>
      </div>

      {/* SENTENCE */}
      <div
        className="sb-sentence"
        onDragOver={handleDragOver}
        onDrop={handleDropToSentence}
      >
        <div className="sb-word-list">
          {sentence.map((word, idx) => (
            <div
              key={word.id}
              className="sb-word sb-word-in-sentence"
              draggable={dragEnabled}
              onDragStart={(e) => handleDragStart(e, word, "sentence")}
              style={{
                background: submit ? checkCorrect(idx, word.text) : "white",
              }}
            >
              {word.text}
            </div>
          ))}
        </div>

        <div className="sb-current-sentence">
          {currentSentence || "Kéo từ vào đây để bắt đầu"}
        </div>

        {/* GIẢI THÍCH */}
        {submit && q.explain && (
          <div style={{ marginTop: "10px" }}>
            <h4>Giải thích: {q.explain}</h4>
          </div>
        )}
      </div>
    </div>
  );
}

export default SentenceBuilder;
