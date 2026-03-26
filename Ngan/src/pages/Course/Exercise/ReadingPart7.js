import OnlyChoiceQuestion from "./OnlyChoiceQuestion";
import "./question.scss";

function ReadingPart7({ ex, onAnswer, isReadOnly, submit }) {
  return (
    <>
      {ex.paragraphs.map((pa) => (
        <div dangerouslySetInnerHTML={{ __html: pa }} />
      ))}
      {ex.questions.map((q, i) => (
        <div className="question" key={i}>
          <OnlyChoiceQuestion q={q} i={i} isReadOnly={isReadOnly} onAnswer={onAnswer} submit={submit}/>
        </div>
      ))}
    </>
  );
}

export default ReadingPart7;
