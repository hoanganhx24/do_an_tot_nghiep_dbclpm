import "./question.scss";
import OnlyChoiceQuestion from "./OnlyChoiceQuestion";

function OnlyChoice({ ex, onAnswer, isReadOnly, submit }) {
  return (
    <>
      {ex.questions.map((q, i) => (
        <div className="question" key={i}>
          <OnlyChoiceQuestion q={q} i={i} isReadOnly={isReadOnly} onAnswer={onAnswer} submit={submit}/>
        </div>
      ))}
    </>
  );
}

export default OnlyChoice;
