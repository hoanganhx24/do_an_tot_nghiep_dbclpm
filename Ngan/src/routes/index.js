import LayoutAdmin from "../layout/LayoutAdmin";
import LayoutTeacher from "../layout/LayoutTeacher";
import ListStudents from "../pages/admin/Student";
import ListTeacher from "../pages/admin/Teacher";
import CreateTeacher from "../pages/admin/Teacher/CreateTeacher";
import ListCourses from "../pages/Course/ListCourses";
import Login from "../pages/Home/Login";
import Register from "../pages/Home/Register";
import MyCourses from "../pages/teacher";
import CreateCourse from "../pages/Course/CreateCourse";
import DetailCourse from "../pages/teacher/DetailCourse";
import CreateSession from "../pages/Course/Session/CreateSession";
import LayoutStudent from "../layout/LayoutStudent";
import MyCoursesStudent from "../pages/student/MyCourses";
import Overview from "../pages/student/Overview";
import StudyPlan from "../pages/student/StudyPlan";
import Profile from "../pages/student/Profile";
import CourseDetail from "../pages/student/MyCourses/CourseDetail";
import LayoutStudy from "../layout/LayoutStudy";
import SessionDetail from "../pages/student/MyCourses/SessionDetail";
import LayoutExcercise from "../layout/LayoutExcercise";
import ExcerciseDetail from "../pages/student/MyCourses/ExcerciseDetail";
import ListExcercises from "../pages/Course/Exercise/ListExcercises";
import ListTests from "../pages/admin/Test/ListTests";
import MiniTestDetail from "../pages/student/MyCourses/MiniTestDetail";
import LayoutTest from "../layout/LayoutTest";
import LayoutMiniTest from "../layout/LayoutMiniTest";
import LayoutHome from "../layout/LayoutHome";
import LayoutLogin from "../layout/LayoutLogin";
import TestIn from "../pages/Home/TestIn";
import Vocal from "../pages/Home/Vocal";
import TraTu from "../pages/Home/TraTu";
import Dictionary from "../pages/Home/Dictionary";
import ListExercisesTest from "../pages/Course/Exercise/ListExercisesTest";
import ListFirstTestExcercises from "../pages/admin/Test/ListFirstTestExcercises";
import Account from "../pages/Home/Account";
import CreateDienTu from "../pages/Course/Exercise/CreateDienTu";
import HomePage from "../pages/Home/HomePage";
import ForgetPass from "../pages/Home/ForgetPass";
import RequireAuth from "./RequireAuth";
import RequireRole from "./RequireRole";
import RequireFirstLogin from "./RequireFirstLogin";
export const routes = [
  {
    path: "/client",
    element: <LayoutLogin />,
    children: [
      {
        path: "/client/login",
        element: <Login />,
      },
      {
        path: "/client/register",
        element: <Register />,
      },
      {
        path: "/client/main",
        element: <HomePage />,
      },
    ],
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <RequireRole allow={["ADMIN"]} />,
        children: [
          {
            path: "/admin",
            element: <LayoutAdmin />,
            children: [
              {
                path: "/admin/teachers",
                element: <ListTeacher />,
              },
              {
                path: "/admin/createTeacher",
                element: <CreateTeacher />,
              },
              {
                path: "/admin/students",
                element: <ListStudents />,
              },
              {
                path: "/admin/courses",
                element: <ListCourses />,
              },
              {
                path: "/admin/detail-course",
                element: <DetailCourse />,
              },
              {
                path: "/admin/create-course",
                element: <CreateCourse />,
              },
              {
                path: "/admin/list-excercises",
                element: <ListExcercises />,
              },
              {
                path: "/admin/tests",
                element: <ListTests />,
              },
              {
                path: "/admin/tests/list-excercises",
                element: <ListFirstTestExcercises />,
              },
              {
                path: "/admin/list-miniTest",
                element: <ListExercisesTest />,
              },
              {
                path: "/admin/account",
                element: <Account />,
              },
            ],
          },
        ],
      },
      {
        element: <RequireRole allow={["TEACHER"]} />,
        children: [
          {
            path: "/teacher",
            element: <LayoutTeacher />,
            children: [
              {
                path: "/teacher/courses",
                element: <MyCourses />,
              },
              {
                path: "/teacher/create-course",
                element: <CreateCourse />,
              },
              {
                path: "/teacher/detail-course",
                element: <DetailCourse />,
              },
              {
                path: "/teacher/create-session",
                element: <CreateSession />,
              },
              {
                path: "/teacher/list-excercises",
                element: <ListExcercises />,
              },
              {
                path: "/teacher/list-miniTest",
                element: <ListExercisesTest />,
              },
              {
                path: "/teacher/account",
                element: <Account />,
              },
            ],
          },
        ],
      },
      {
        element: <RequireRole allow={["STUDENT"]} />,
        children: [
          {
            path: "/student",
            element: <LayoutStudent />,
            children: [
              {
                path: "/student/my_courses",
                element: <MyCoursesStudent />,
              },
              {
                path: "/student/course-detail",
                element: <CourseDetail />,
              },
              {
                path: "/student/overview",
                element: <Overview />,
              },
              {
                path: "/student/study_plan",
                element: <StudyPlan />,
              },
              {
                path: "/student/profile",
                element: <Profile />,
              },
            ],
          },
          {
            path: "/study",
            element: <LayoutStudy />,
            children: [
              {
                path: "/study/detail-session",
                element: <SessionDetail />,
              },
              {
                path: "/study/mini-test",
                element: <MiniTestDetail />,
              },
            ],
          },
          {
            path: "/exercise",
            element: <LayoutExcercise />,
          },
          {
                path: "/test",
                element: <LayoutTest />,
          },
          {
            path: "/minitest",
            element: <LayoutMiniTest />,
          },
          {
            path: "/home",
            element: <LayoutHome />,
            children: [
              {
                path: "/home/test-in",
                element: <TestIn />,
              },
              {
                path: "/home/vocal",
                element: <Vocal />,
              },
              {
                path: "/home/tratu",
                element: <TraTu />,
              },
              {
                path: "/home/dictionary",
                element: <Dictionary />,
              },
              {
                path: "/home/account",
                element: <Account />,
              },
              {
                path: "/home/main",
                element: <HomePage />,
              },
            ],
          },
        ],
      },
    ],
  },
];
