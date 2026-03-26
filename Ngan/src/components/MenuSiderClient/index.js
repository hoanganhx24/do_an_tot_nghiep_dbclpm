import { Menu } from "antd";
import { Link, useLocation } from "react-router-dom";

function MenuSiderClient(){
    const location = useLocation();
    const items  = [
        {
            key: "/client/main",
            label: <Link to="/client/main">Trang chủ</Link>,
        },
        {
            label: <Link to="/client/tratu">Tra từ</Link>,
            key: "/client/tratu"
        },
    ]
    return(
        <>
            <Menu mode="horizontal" items={items} disabledOverflow selectedKeys={[location.pathname]}/>
        </>
    )
}
export default MenuSiderClient;