import ListItemStudent from "./ListItemStudent";
import ListItemTeacher from "./ListItemTeacher";
import "./ListLesson.scss";
import MiniTestStudent from "./MiniTestStudent";
import MiniTestTeacher from "./MiniTestTeacher";
function ListLessons(props) {
  const role = props.role;
  const modules = props.modules;
  const courseId = props.id;
  const status = props.status;
  const type = props.type;
  console.log(type);
  const track = props.track;
  return (
    <>
      <div className="list__header">
        <div className="list__header--title">Danh sách bài học</div>
        <div className="list__header--quantity">{modules?.length} bài học</div>
      </div>
      <div className="list__body">
        {role === "Teacher" ? (
          <>
            {modules?.length === 0 ? (
              <h3>Không có bài học nào</h3>
            ) : (
              <>
                {modules?.map((module) => (
                  <>
                    {module.type === "LESSON" ? (
                      <ListItemTeacher
                        module={module}
                        onReload={props.onReload}
                        status={status}
                        track={track}
                      />
                    ) : (
                      <MiniTestTeacher
                        module={module}
                        onReload={props.onReload}
                        status={status}
                        track={track}
                      />
                    )}
                  </>
                ))}
              </>
            )}
          </>
        ) : (
          <>
            {modules?.length === 0 ? (
              <h3>Không có bài học nào</h3>
            ) : (
              <>
                {modules?.map((module, index) => (
                  <>
                    {module.type === "LESSON" ? (
                      <ListItemStudent
                        module={module}
                        index={index}
                        courseId={courseId}
                        type={type}
                      />
                    ) : (
                      <MiniTestStudent
                        module={module}
                        index={index}
                        courseId={courseId}
                        type={type}
                      />
                    )}
                  </>
                ))}
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}
export default ListLessons;
