import React, { useEffect, useState } from "react";
import "./question.scss";
import { Input } from "antd";
import DienTuQuestion from "./DienTuQuestion";

function DienTu({ ex, onAnswer, isReadOnly, submit}) {
  return (
    <>
      {ex.questions.map((q, i) => (
        <div className="question" key={i}>
          <DienTuQuestion q={q} i={i} isReadOnly={isReadOnly} onAnswer={onAnswer} submit={submit}/>
        </div>
      ))}
    </>
  );
}

export default DienTu;
