import { Table } from "antd";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

function ListCourses(props) {
  const location = useLocation();
  const [courses, setCourses] = useState([]);
  useEffect(() => {
    setCourses([]);
    location.pathname.includes("createTeacher")
      ? props.courses?.forEach((item) => {
          item.courses.forEach((element) => {
            var d = {
              code: item.code,
              id: element.id,
              title: element.title,
              description: element.description,
            };
            setCourses((prev) => [...prev, d]);
          });
        })
      : props.courses?.forEach((item) => {
          item.courses.forEach((element) => {
            var d = {
              code: item.code,
              id: element.id,
              title: element.title,
              description: element.description,
            };
            setCourses([...courses, d]);
          });
        });
  }, [props]);
  console.log(courses);
  const columnsStudent = [
    {
      title: "Tên khóa học",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Cấp độ",
      dataIndex: "LevelTag",
      key: "LevelTag",
    },
    {
      title: "Tiến độ học",
      dataIndex: "Process",
      key: "Process",
    },
  ];
  const columnsTeacher = [
    {
      title: "Tên khóa học",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Cấp độ",
      dataIndex: "code",
      key: "code",
    },
  ];

  return (
    <>
      <Table
        columns={
          location.pathname.includes("createTeacher")
            ? columnsTeacher
            : columnsStudent
        }
        dataSource={courses}
      />
    </>
  );
}
export default ListCourses;
