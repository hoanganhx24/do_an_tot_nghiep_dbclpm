import { Button, Input } from "antd";
import "./vocal.css";
import { SoundTwoTone } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { getStudentDictionary } from "../../services/VocaService";

function Highlighter({ sentence, word }) {
  const parts = sentence.split(new RegExp(`(${word})`, "gi"));

  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === word.toLowerCase() ? (
          <span key={index} style={{ color: "red", fontWeight: 700 }}>
            {part}
          </span>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </>
  );
}

function Vocal() {
  const [listWord, setListWord] = useState([]);
  const getDictionaryOfStudent = async () => {
    const res = await getStudentDictionary();
    console.log(res);
    if (res.code === 200) {
      setListWord(res.data);
    }
  };

  useEffect(() => {
    getDictionaryOfStudent();
  }, []);

  const [isFront, setIsFront] = useState(true);
  const flipCard = (e) => {
    if (!isFront && isContinue) {
      return;
    }
    const card = e.currentTarget;
    const isFlipped = card.classList.toggle("is-flipped");
    setIsFront(!isFlipped);
    if (isFront) {
      setIsContinue(false);
      setIsCheck(false);
      setValue();
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isContinue, setIsContinue] = useState(false);
  const [isCheck, setIsCheck] = useState(false);
  const [value, setValue] = useState();
  const showModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const [currentIndex, setCurrentIndex] = useState(0);
  const nextWord = () => {
    if (currentIndex < listWord.dictionaries.length - 1)
      setCurrentIndex((prev) => prev + 1);
    else {
      setCurrentIndex(0);
      setIsModalOpen(!isModalOpen);
    }

    // Reset trạng thái
    setIsFront(true);
    setIsContinue(false);
    setIsCheck(false);
    setValue("");

    // Bỏ class lật thẻ
    const card = document.querySelector(".flashcard");
    if (card) {
      card.classList.remove("is-flipped");
    }
  };

  return (
    <>
      <div className="marginTop50">
        {listWord?.dictionaries?.length > 0 && (
          <Button className="button__On" onClick={showModal}>
            {!isModalOpen ? "Ôn tập từ vựng" : "Danh sách từ vựng"}
          </Button>
        )}

        {!isModalOpen ? (
          <>
            {listWord?.dictionaries?.length === 0 ? (
              <h1>Chưa có từ trong từ điển của bạn!</h1>
            ) : (
              listWord?.dictionaries?.map((word) => (
                <div className="nghia">
                  <div className="flex1">
                    <h1 style={{ color: "#0071f9" }}>{word.word}</h1>
                    <div className="tl">{word.partOfSpeechString}</div>
                  </div>
                  <div
                    className="flex1"
                    style={{
                      borderBottom: "1px solid #ddd",
                      paddingBottom: "10px",
                    }}
                  >
                    <h3 style={{ margin: 0 }}>/{word.ipa}/</h3>
                    <SoundTwoTone
                      style={{ fontSize: "20px", cursor: "pointer" }}
                      onClick={() => {
                        if (word.audio) {
                          const audio = new Audio(word.audio);
                          audio.play();
                        }
                      }}
                    />
                  </div>
                  <div className="flex1">
                    <h3 className="font700_20">{word.definition}</h3>
                  </div>
                  <div className="font20">Ví dụ:</div>
                  <div style={{ paddingLeft: "20px" }}>
                    <div className="font700_16" style={{ margin: "8px 0" }}>
                      {word.example}
                    </div>
                  </div>
                </div>
              ))
            )}
          </>
        ) : (
          currentIndex < listWord.dictionaries.length && (
            <div className="boc__flash">
              <div className="flashcard" onClick={flipCard}>
                <div className="loa__tron">
                  <SoundTwoTone
                    twoToneColor="#f68566ff"
                    className="loa"
                    onClick={() => {
                      if (listWord.dictionaries[currentIndex].audio) {
                        const audio = new Audio(
                          listWord.dictionaries[currentIndex].audio
                        );
                        audio.play();
                      }
                    }}
                  />
                </div>
                {isCheck && (
                  <div
                    className="check__tu"
                    style={
                      value === listWord.dictionaries[currentIndex].word
                        ? { backgroundColor: "rgb(239, 255, 253)" }
                        : { backgroundColor: "rgba(255, 239, 239, 1)" }
                    }
                  >
                    <div className="flex1">
                      <h1 style={{ marginTop: "5px" }}>
                        {listWord.dictionaries[currentIndex].word}
                      </h1>
                      <div className="tl">
                        {listWord.dictionaries[currentIndex].partOfSpeechString}
                      </div>
                    </div>
                    <h3 style={{ margin: 0 }}>
                      /{listWord.dictionaries[currentIndex].ipa}/
                    </h3>
                    <div className="flex1">
                      <h3 className="font700_20">
                        {listWord.dictionaries[currentIndex].definition}
                      </h3>
                    </div>
                  </div>
                )}
                <div className="inner">
                  <div className="front">
                    <div
                      className="font700_16 marginTop20"
                      style={{ marginBottom: "8px" }}
                    >
                      <Highlighter
                        sentence={listWord.dictionaries[currentIndex].example}
                        word={listWord.dictionaries[currentIndex].word}
                      />
                    </div>
                  </div>
                  <div className="back">
                    {!isContinue ? (
                      <>
                        <div className="flex1">
                          <h1 style={{ color: "#0071f9" }}>
                            {listWord.dictionaries[currentIndex].word}
                          </h1>
                          <div className="tl">noun</div>
                        </div>
                        <h3 style={{ margin: 0 }}>
                          /
                          {
                            listWord.dictionaries[currentIndex]
                              .partOfSpeechString
                          }
                          /
                        </h3>
                        <div className="flex1">
                          <h3 className="font700_20">
                            {listWord.dictionaries[currentIndex].definition}
                          </h3>
                        </div>
                      </>
                    ) : (
                      <>
                        <h3>Nhập từ bạn nghe được</h3>
                        <Input
                          size="large"
                          style={{ width: "60%" }}
                          onChange={(e) => setValue(e.target.value)}
                          disabled={isCheck}
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="marginTop20" style={{ justifySelf: "center" }}>
                {isFront ? (
                  <Button onClick={nextWord}>Tôi đã biết từ này</Button>
                ) : !isContinue ? (
                  <Button onClick={() => setIsContinue(true)}>Tiếp theo</Button>
                ) : !isCheck ? (
                  <Button onClick={() => setIsCheck(true)}>Kiểm tra</Button>
                ) : (
                  <Button onClick={nextWord}>Tiếp tục</Button>
                )}
              </div>
            </div>
          )
        )}
      </div>
    </>
  );
}

export default Vocal;
