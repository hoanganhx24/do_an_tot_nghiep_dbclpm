import MultiChoiceQuestion from "./MultiChoiceQuestion";

function Multichoice({ ex, onAnswer, isReadOnly, submit }) {
  return (
    <>
      {ex.questions && ex.questions.map((q, i) => (
        <>
          <div className="question" key={i}>
            <MultiChoiceQuestion q={q} i={i} isReadOnly={isReadOnly} onAnswer={onAnswer} submit={submit}/>
          </div>
        </>
      ))}
    </>
  );
}
export default Multichoice;
