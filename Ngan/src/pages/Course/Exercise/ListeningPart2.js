import ListeningPart2Question from "./ListeningPart2Question";
import "./question.scss";

function ListeningPart2({ ex, onAnswer, isReadOnly, submit,type }) {
  return (
    <>
      <audio
        controls
        style={{ width: "100%", margin: "10px 0" }}
        src="/Recording.mp3"
      />
      {ex.questions.map((q, i) => (
        <div className="question" key={i}>
          <ListeningPart2Question
            q={q}
            i={i}
            isReadOnly={isReadOnly}
            onAnswer={onAnswer}
            submit={submit}
            type={type}
          />
        </div>
      ))}
    </>
  );
}

export default ListeningPart2;
