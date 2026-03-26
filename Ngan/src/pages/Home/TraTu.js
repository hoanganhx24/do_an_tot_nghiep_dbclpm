import { Input, notification } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { openNotification } from "../../components/Notification";
import { AutoComplete } from "antd";
import { useRef, useState } from "react";
import {
  getListSuggest,
  getSearchInDictionary,
} from "../../services/VocaService";
const { Search } = Input;
function TraTu() {
  const navigate = useNavigate();
  const [api, contextHolder] = notification.useNotification();
  const onSearch = async (value) => {
    if (!value) {
      openNotification(api, "bottomRight", "Lỗi", "Bạn chưa nhập từ");
    } else {
      const res = await getSearchInDictionary(value);
      console.log(res);
      if (res.code === 200) {
        navigate("/home/dictionary", {
          state: { word: value, data: res.data },
        });
      } else {
        openNotification(api, "bottomRight", "Lỗi", res.message);
      }
    }
  };

  const [value, setValue] = useState("");
  const [options, setOptions] = useState([]);
  const debounceRef = useRef(null);
  // Gọi API suggestion
  const fetchSuggestions = async (text) => {
    console.log(text);
    if (!text) {
      setOptions([]);
      return;
    }

    try {
      const res = await getListSuggest(text);
      console.log(res);
      if (res.code === 200) {
        const opts = res.data.map((word) => ({ value: word }));
        setOptions(opts);
      } else {
        openNotification(api, "bottomRight", "Lỗi", res.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = (text) => {
    setValue(text);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(text);
    }, 400); // 400ms sau khi dừng gõ
  };

  const handleSelect = async (word) => {
    console.log("từ: " + word);
    setValue(word);
  };
  return (
    <>
      {contextHolder}
      <div style={{ justifySelf: "center", width: "60%" }}>
        <div className="font64">Tra từ dễ dàng</div>
        <div className="font64">hiểu nghĩa sâu xa</div>
        <div className="font500_22">
          Dictionary – Vũ trụ từ vựng đa ngôn ngữ trong tầm tay!
        </div>
        <div style={{ marginTop: "15px" }}>
          <AutoComplete
            className="search-box"
            size="large"
            value={value}
            options={options}
            style={{ width: "100%" }}
            onSearch={handleSearch}
            onSelect={handleSelect}
          >
            <Input.Search
              placeholder="Tra từ tại đây"
              onSearch={onSearch}
              value={value}
            />
          </AutoComplete>
        </div>
      </div>
    </>
  );
}
export default TraTu;
