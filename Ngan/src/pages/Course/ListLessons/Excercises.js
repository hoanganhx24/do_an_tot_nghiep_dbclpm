import DienTu from "../Exercise/DienTu";
import Multichoice from "../Exercise/Multichoice";
import OnlyChoice from "../Exercise/OnlyChoice";
import TrueFalse from "../Exercise/TrueFalse";

function Excercises() {
  const exercises = [
    {
      type: "onlychoice",
      title: "Bài học 1: Hiểu về Token",
      status: "done",
      questions: [
        {
          question: "Token là gì?",
          options: [
            "Mã truy cập",
            "Mật khẩu",
            "Tên đăng nhập",
            "Dữ liệu người dùng",
          ],
          answer: "Mã truy cập",
          answered: null,
          explain: "Token là chuỗi được dùng để xác thực người dùng.",
        },
        {
          question: "Refresh token có tác dụng gì?",
          options: [
            "Gia hạn token",
            "Xóa dữ liệu",
            "Đăng xuất",
            "Bảo mật tài khoản",
          ],
          answer: "Gia hạn token",
          answered: null,
          explain: "Refresh token dùng để lấy lại access token khi hết hạn.",
        },
      ],
    },
    {
      type: "onlychoice",
      title: "Bài học 1: Hiểu về Token",
      status: "start",
      questions: [
        {
          question: "Token là gì?",
          options: [
            "Mã truy cập",
            "Mật khẩu",
            "Tên đăng nhập",
            "Dữ liệu người dùng",
          ],
          answer: "Mã truy cập",
          answered: null,
          explain: "Token là chuỗi được dùng để xác thực người dùng.",
        },
        {
          question: "Refresh token có tác dụng gì?",
          options: [
            "Gia hạn token",
            "Xóa dữ liệu",
            "Đăng xuất",
            "Bảo mật tài khoản",
          ],
          answer: "Gia hạn token",
          answered: null,
          explain: "Refresh token dùng để lấy lại access token khi hết hạn.",
        },
      ],
    },
  ];
  const renderExercise = (list) => {
    return list.map((ex, idx) => {
      switch (ex.type) {
        case "true_false":
          return (
            <div key={idx}>
              <div style={{ fontWeight: "500", paddingBottom: "10px" }}>
                Exercise {idx + 1}: {ex.title}
              </div>
              <TrueFalse ex={ex} />
            </div>
          );

        case "multichoice":
          return (
            <div key={idx}>
              <div style={{ fontWeight: "500", paddingBottom: "10px" }}>
                Exercise {idx + 1}: {ex.title}
              </div>
              <Multichoice ex={ex} />
            </div>
          );

        case "dien_tu":
          return (
            <div key={idx}>
              <div style={{ fontWeight: "500", paddingBottom: "10px" }}>
                Exercise {idx + 1}: {ex.title}
              </div>
              <DienTu ex={ex} />
            </div>
          );

        case "onlychoice":
          return (
            <div key={idx}>
              <div style={{ fontWeight: "500", paddingBottom: "10px" }}>
                Exercise {idx + 1}: {ex.title}
              </div>
              <OnlyChoice ex={ex} />
            </div>
          );

        default:
          return null;
      }
    });
  };

  return (
    <>
      <div
        style={{
          margin: "10px",
          border: "1px solid #ddd",
          borderRadius: "10px",
        }}
        className="hidden-scrollbar"
      >
        <div style={{ padding: "20px" }}>
          {<div>{renderExercise(exercises)}</div>}
        </div>
      </div>
    </>
  );
}
export default Excercises;
