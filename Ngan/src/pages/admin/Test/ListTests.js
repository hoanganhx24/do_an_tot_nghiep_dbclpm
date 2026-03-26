import { Button, notification } from "antd";
import TestItem from "./TestItem";
import { useEffect, useState } from "react";
import {logout} from "../../../components/function";
import {
  createFirstTest,
  getFirstTests,
} from "../../../services/FirstTestService";
import { refreshToken, saveToken } from "../../../services/AuthService";
import { openNotification } from "../../../components/Notification";
function ListTests() {
  const [tests, setTests] = useState([]);
  const [api, contextHolder] = notification.useNotification();

  const fetchApiGetTests = async () => {
    const response = await getFirstTests();
    console.log(response);
    if (response.code === 200) {
      setTests(response.data);
    } else if (response.code === 401) {
      const refresh = await refreshToken();
      if (refresh.code === 200) {
        saveToken(refresh.data.token, refresh.data.refreshToken);
        const retryResponse = await getFirstTests();
        if (retryResponse.code === 200) {
          setTests(retryResponse.data);
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
    fetchApiGetTests();
  }, []);

  const handleCreateTest = async () => {
    const value = {
      type: "FIRST_TEST",
      name: "Test " + (tests.length + 1),
    };
    const response = await createFirstTest(value);
    console.log(response);
    if (response.code === 200) {
      openNotification(
        api,
        "bottomRight",
        "Thành công",
        "Tạo bài test đầu vào thành công"
      );
      fetchApiGetTests();
    } else if (response.code === 401) {
      const refresh = await refreshToken();
      if (refresh.code === 200) {
        saveToken(refresh.data.token, refresh.data.refreshToken);
        const retryResponse = await createFirstTest(value);
        if (retryResponse.code === 200) {
          openNotification(
            api,
            "bottomRight",
            "Thành công",
            "Tạo bài test đầu vào thành công"
          );
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
  return (
    <>
      {contextHolder}
      <div className="flex">
        <h1 className="page-title">Danh sách các bài test</h1>
        <Button type="primary" onClick={handleCreateTest}>
          Thêm bài test
        </Button>
      </div>
      <div className="flex1" style={{ flexFlow: "wrap" }}>
        {tests.length === 0 ? (
          <h3>Chưa có dữ liệu</h3>
        ) : (
          tests.map((test) => <TestItem test={test} />)
        )}
      </div>
    </>
  );
}
export default ListTests;
