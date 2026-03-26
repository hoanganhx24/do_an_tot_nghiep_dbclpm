import OnlyChoiceQuestion from "./OnlyChoiceQuestion";
import "./question.scss";

function ListeningPart34({ ex, onAnswer, isReadOnly, submit }) {
  return (
    <>
      <audio
        controls
        style={{ width: "100%", margin: "10px 0" }}
        src="/Recording.mp3"
      />
      <img
        src="https://s4-media1.study4.com/media/tez_media/img/eco_toeic_1000_test_1_eco_toeic_1000_test_1_1.png"
        style={{ marginTop: "10px", width: "100%" }}
      />
      {ex.questions.map((q, i) => (
        <div className="question" key={i}>
          <OnlyChoiceQuestion
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

export default ListeningPart34;
