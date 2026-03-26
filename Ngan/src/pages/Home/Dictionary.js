import { Button, Input, notification } from "antd";
import { useLocation } from "react-router-dom";
import { SoundTwoTone, VerticalAlignBottomOutlined } from "@ant-design/icons";
import { useRef, useState } from "react";
import {
  getListSuggest,
  getSearchInDictionary,
  saveStudentDictionary,
} from "../../services/VocaService";
import { openNotification } from "../../components/Notification";
import { AutoComplete } from "antd";
import { getId } from "../../components/token";
const { Search } = Input;
function Dictionary() {
  const location = useLocation();
  const [api, content] = notification.useNotification();

  const [data, setData] = useState(location.state?.data);
  const onSearch = async (value) => {
    if (!value) {
      openNotification(api, "bottomRight", "Lỗi", "Bạn chưa nhập từ");
    } else {
      const res = await getSearchInDictionary(value);
      console.log(res);
      if (res.code === 200) {
        setData(res.data);
      } else {
        openNotification(api, "bottomRight", "Lỗi", res.message);
      }
    }
  };

  const [value, setValue] = useState(location.state?.word);
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
    setOptions([]);
  };

  const saveDictionary = async (item) => {
    const form = {
      studentProfileId: getId(),
      definitionExampleId: item.id,
    };
    const res = await saveStudentDictionary(form);
    console.log(res);
    if (res.code === 200) {
      openNotification(api, "bottomRight", "Thành công", "Lưu từ thành công");
      const res1 = await getSearchInDictionary(value);
      console.log(res1);
      if (res1.code === 200) {
        setData(res1.data);
      } else {
        openNotification(api, "bottomRight", "Lỗi", res.message);
      }
    } else {
      openNotification(api, "bottomRight", "Lỗi", res.message);
    }
  };
  return (
    <>
      {content}
      <div style={{ justifySelf: "center", marginTop: "70px", width: "50%" }}>
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

      {data.partsOfSpeech?.map((item) => (
        <div className="nghia">
          <div className="flex1">
            <h1 style={{ color: "#0071f9" }}>{data?.word}</h1>
            <div className="tl">{item.partOfSpeech}</div>
          </div>
          <div
            className="flex1"
            style={{ borderBottom: "1px solid #ddd", paddingBottom: "10px" }}
          >
            <h3 style={{ margin: 0 }}>/{item.ipa}/</h3>
            <SoundTwoTone
              style={{ fontSize: "20px", cursor: "pointer" }}
              onClick={() => {
                if (item.audio) {
                  const audio = new Audio(item.audio);
                  audio.play();
                }
              }}
            />
          </div>

          <div className="flex1" style={{ margin: "15px" }}>
            <div>
              <div className="flex1">
                <h3 className="font700_20">{item.senses[0].definition}</h3>
                {item.senses[0].saved === false && (
                  <Button
                    icon={<VerticalAlignBottomOutlined />}
                    style={{
                      padding: "5px",
                      width: "30px",
                      height: "30px",
                      borderRadius: "50%",
                    }}
                    onClick={() => saveDictionary(item.senses[0])}
                  />
                )}
              </div>

              <div className="font20">Ví dụ:</div>
              <div style={{ paddingLeft: "20px" }}>
                <div className="font700_16" style={{ marginBottom: "8px" }}>
                  {item.senses[0].example}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
export default Dictionary;
