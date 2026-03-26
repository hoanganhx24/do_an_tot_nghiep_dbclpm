import "./question.scss";

import TrueFalseQuestion from "./TrueFalseQuestion";
function TrueFalse({ ex, onAnswer, isReadOnly, submit }) {
  return (
    <>
      {ex.questions.map((q, i) => (
        <>
          <div className="question" key={i}>
            <TrueFalseQuestion q={q} i={i} isReadOnly={isReadOnly} onAnswer={onAnswer} submit={submit}/>
          </div>
        </>
      ))}
    </>
  );
}
export default TrueFalse;
