import { useNavigate } from "react-router-dom";
import { Button } from "antd";

function GoBack(){
    const navigate = useNavigate();
    const handleClick=()=>{
        navigate(-1);
    }
    return (
        <>
            <Button onClick={handleClick} style={{backgroundColor: "#f43d10ff", color:"white"}}>Trở lại</Button>
        </>
    )
}
export default GoBack;