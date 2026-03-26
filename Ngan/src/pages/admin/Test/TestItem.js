import { useNavigate } from "react-router-dom";

function TestItem({test}) {
  console.log(test);

  const navigate = useNavigate();
  const handleClick = () => {
    navigate("/admin/tests/list-excercises", {
        state: { test },
      });
  }
  return (
    <>
      <div style={{ width: "285px" }} onClick={handleClick}>
        <div className="item__header miniTest" style={{ paddingLeft: "24px" }}>
          <img src="/images/Vocabulary.png" style={{ width: "50px" }} />
          <div className="item__header--des">
            <div className="item__header--des--title" style={{marginBottom:0}}>{test.name}</div>
          </div>
        </div>
      </div>
    </>
  );
}
export default TestItem;
