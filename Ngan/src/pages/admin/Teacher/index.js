import { Table, Button, Tooltip, Tag, Modal, notification } from "antd";
import { DeleteTwoTone, EyeTwoTone } from "@ant-design/icons";
import "./teacher.scss";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  deleteTeacher,
  getListTeachers,
} from "../../../services/TeacherService";
import { refreshToken, saveToken } from "../../../services/AuthService";
import { openNotification } from "../../../components/Notification";
import { logout } from "../../../components/function";

function ListTeacher() {
  const navigate = useNavigate();
  const [api, contextHolder] = notification.useNotification();
  const [open, setOpen] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [id, setID] = useState();
  const handleOk = async () => {
    const response = await deleteTeacher(id);
    console.log(response);
    if (response.code === 200) {
      setID(null);
      openNotification(
        api,
        "bottomRight",
        "Thành công",
        "Sa thải giáo viên thành công"
      );
      setTimeout(() => {
        setOpen(false);
        fetchAPIGet();
      }, 500);
    } else if (response.code === 401) {
      const refresh = await refreshToken();
      if (refresh.code === 200) {
        saveToken(refresh.data.token, refresh.data.refreshToken);
        const retryResponse = await deleteTeacher(id);
        if (retryResponse.code === 200) {
          setID(null);
          openNotification(
            api,
            "bottomRight",
            "Thành công",
            "Sa thải giáo viên thành công"
          );
          setTimeout(() => {
            setOpen(false);
            fetchAPIGet();
          }, 500);
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
      setID(null);
      openNotification(
        api,
        "bottomRight",
        "Thất bại",
        "Sa thải giáo viên thất bại"
      );
      setTimeout(() => {
        setOpen(false);
      }, 500);
    }
  };
  const showModal = (id) => {
    setID(id);
    setOpen(true);
  };
  const fetchAPIGet = async () => {
    const response = await getListTeachers();
    if (response.code === 200) {
      setTeachers(response.data);
    } else if (response.code === 401) {
      const refresh = await refreshToken();
      if (refresh.code === 200) {
        saveToken(refresh.data.token, refresh.data.refreshToken);
        const retryResponse = await getListTeachers();
        if (retryResponse.code === 200) {
          setTeachers(retryResponse.data);
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
    fetchAPIGet();
  }, []);

  const columns = [
    {
      title: "Họ và tên",
      dataIndex: "fullName",
      key: "fullName",
    },
    {
      title: "Giới tính",
      dataIndex: "sex",
      key: "sex",
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
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (_, record) => {
        return record.status === "ACTIVE" ? (
          <Tag color="green">Đang giảng dạy</Tag>
        ) : (
          <Tag color="red">Sa thải</Tag>
        );
      },
    },
    {
      title: "Hành động",
      key: "Actions",
      render: (_, record) => {
        return record.status == "ACTIVE" ? (
          <>
            <Tooltip placement="bottom" title="Sa thải">
              <Button
                icon={<DeleteTwoTone twoToneColor="#c41a1aff" />}
                style={{ marginRight: "10px" }}
                onClick={() => showModal(record.id)}
              />
            </Tooltip>

            <Tooltip placement="bottom" title="Xem chi tiết">
              <Button
                icon={<EyeTwoTone twoToneColor="#c4501aff" />}
                onClick={() => handleDetail(record)}
              />
            </Tooltip>
          </>
        ) : (
          <Tooltip placement="bottom" title="Xem chi tiết">
            <Button
              icon={<EyeTwoTone twoToneColor="#c4501aff" />}
              onClick={() => handleDetail(record)}
            />
          </Tooltip>
        );
      },
    },
  ];
  const handleCreateteacher = () => {
    navigate("/admin/createTeacher", {
      state: { mode: "create" },
    });
  };

  const handleDetail = (record) => {
    navigate("/admin/createTeacher", {
      state: { record, mode: "edit" },
    });
  };

  return (
    <>
      {contextHolder}
      <div className="flex">
        <h1 className="page-title">Quản lý giáo viên</h1>
        <div className="button__create__teacher">
          <Button onClick={handleCreateteacher} type="primary">Thêm giáo viên</Button>
        </div>
      </div>

      <Table columns={columns} dataSource={teachers} />

      <Modal
        open={open}
        title="Sa thải"
        onOk={handleOk}
        onCancel={() => setOpen(false)}
        footer={[
          <Button onClick={() => setOpen(false)}>Quay lại</Button>,
          <Button type="primary" onClick={handleOk}>
            Đồng ý
          </Button>,
        ]}
      >
        Bạn muốn sa thải giáo viên này?
      </Modal>
    </>
  );
}
export default ListTeacher;
