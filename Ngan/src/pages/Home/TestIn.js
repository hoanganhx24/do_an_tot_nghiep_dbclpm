import { Button } from "antd";
import { useNavigate } from "react-router-dom";

function TestIn(){
    const navigator = useNavigate();
    return(
        <>
            <div className="profile__item flex1" style={{marginTop:"65px", whiteSpace:"wrap", padding:"0 50px"}}>
                <div style={{width:"50%"}}>
                    <div style={{fontWeight:700, fontSize:"44px", marginBottom:"20px"}}>Bài Test Trình Độ TOEIC</div>
                    <div className="font20"><span className="font700_20">Nhanh & Hiệu quả:</span> Biết được trình độ TOEIC hiện tại của bạn.</div>
                    <div className="font20"><span className="font700_20">Chính xác & Tin cậy:</span> Công nghệ kiểm tra thích ứng giảm thiểu câu hỏi không phù hợp, tăng độ chính xác.</div>
                    <div className="font20"><span className="font700_20">Cá nhân hóa lộ trình:</span>Đề xuất lộ trình học phù hợp dựa trên kết quả bài test.</div>
                    <div className="font20"><span className="font700_20">100% miễn phí:</span> Thực hiện bài kiểm tra mà không phải chi trả bất kỳ khoản phí nào.</div>
                    <Button type="primary" style={{width:"250px", height:"56px", borderRadius:"20px"}} className="font700_20" onClick={()=>navigator("/test")}>Bắt đầu làm bài test</Button>
                </div>
                <div style={{width:"50%"}}>
                    <img src="/images/image_1_51df7d0304.webp" style={{width:"600px"}}/>
                </div>
            </div>
        </>
    )
}
export default TestIn;