import { Table, Button, Tooltip, Tag, Modal, notification } from "antd";
import { LockTwoTone, EyeTwoTone } from "@ant-design/icons";
import "./teacher.scss";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { openNotification } from "../../../components/Notification";
import { logout } from "../../../components/function";
import { getListStudents } from "../../../services/StudentService";
import { refreshToken, saveToken } from "../../../services/AuthService";

function ListStudents() {

  const [api, content] = notification.useNotification();
  const [students, setStudents] = useState([]);

  const fetchGGetListStudent = async () => {
    const response = await getListStudents();
    console.log(response);
    if (response.code === 200) {
      response.data.forEach((item) => {
        var d = {
          email: item.user.email,
          id: item.id,
          status: item.user.status,
          fullName: item.user?.fullName || "",
          phone: item.user?.phone || "",
          address: item.user?.address || "",
          birhday: item.user?.birhday || ""
        };
        setStudents((prev) => [...prev, d]);
      });
    } else if (response.code === 401) {
      const refresh = await refreshToken();
      if (refresh.code === 200) {
        saveToken(refresh.data.token, refresh.data.refreshToken);
        const retryResponse = await getListStudents();
        if (retryResponse.code === 200) {
          retryResponse.data.forEach((item) => {
            var d = {
              email: item.user.email,
              id: item.id,
              status: item.user.status,
            };
            setStudents((prev) => [...prev, d]);
          });
        } else {
          openNotification(api, "bottomRight", "Lỗi", retryResponse.message);
        }
      } else {
        openNotification(
          api,
          "bottomRight",
          "Cảnh báo",
          "Phiên đăng nhập của bạn đã hết hạn"
        );
        setTimeout(() => {
          logout();
        }, 1000);
      }
    } else {
      openNotification(api, "bottomRight", "Lỗi", response.message);
    }
  };
  useEffect(() => {
    setStudents([]);
    fetchGGetListStudent();
  }, []);

  const columns = [
    {
      title: "Họ tên",
      dataIndex: "fullName",
      key: "fullName",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "Ngày sinh",
      dataIndex: "birhday",
      key: "birhday",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (_, record) => {
        return record.status === "ACTIVE" ? (
          <Tag color="green">Đang hoạt động</Tag>
        ) : (
          <Tag color="red">Khóa tài khoản</Tag>
        );
      },
    },
  ];

  return (
    <>
      {content}
      <h1 className="page-title">Danh sách học viên</h1>
      <Table columns={columns} dataSource={students} />
    </>
  );
}
export default ListStudents;
