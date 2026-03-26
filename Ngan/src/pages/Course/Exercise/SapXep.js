import SentenceBuilder from "./SentenceBuilder";

function SapXep({ ex, onAnswer, isReadOnly, submit }) {
  return (
    <>
      {ex.questions.map((q, i) => (
        <div className="question" key={i}>
          <SentenceBuilder
            q={q}
            i={i}
            isReadOnly={isReadOnly}
            onAnswer={onAnswer}
            submit={submit}
          />
        </div>
      ))}
    </>
  );
}
export default SapXep;
