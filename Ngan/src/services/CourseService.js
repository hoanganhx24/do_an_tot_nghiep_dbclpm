import { getId } from "../components/token";
import { del, get, patch, post, postFormData, put, put2, putFormData } from "../utils/request"

export const getListCoursesOfTeacher = async(type, id) => {
    const result = await get(`tracks/courses/teacher?type=${type}&&teacherId=${id}`);
    return result;
}

export const getListCoursesOfAdmin = async(type) => {
    const result = await get(`tracks/courses?type=${type}`);
    return result;
}

export const getListCoursesOfStudent = async(id) => {
    const result = await get(`enrollments/student/${id}`);
    return result;
}

export const getDetailCourse = async(courseId,version) => {
    var result;
    if(!version && version !== 0) result = await get(`courses/teacher?courseId=${courseId}`);
    else result = await get(`courses/teacher?courseId=${courseId}&&version=${version}`);
    return result;
}

export const getDetailCourseStudent = async(courseId,studentId) => {
    var result = await get(`courses/${courseId}/student/${studentId}`);
    return result;
}

export const createCourse = async(formData) => {
    const result = await postFormData("courses",formData);
    return result;
}

export const getMaxOrderOfCourse = async(id) => {
    const result = await get(`modules/maxOrder/${id}`);
    return result;
}

export const createModuleOfCourse = async(data) => {
    const result = await post("modules",data);
    return result;
}

export const updateModuleOfCourse = async(data) => {
    const result = await put2("modules",data);
    return result;
}

export const deleteModuleOfCourse = async(id) => {
    const result = await del(`modules/${id}`);
    return result;
}

export const getOrderIndexOfLesson = async(id) => {
    const result = await get(`lessons/max-order/${id}`);
    return result;
} 

export const getLesson = async(id) => {
    const studentId = getId();
    const result = await get(`lessons/${id}/student/${studentId}`);
    return result;
}

export const getLessonAdminTeacher = async(id) => {
    const result = await get(`lessons/${id}`);
    return result;
}

export const createLessionOfModule = async(formData) => {
    const result = await postFormData("lessons",formData);
    return result;
}

export const updateLessionOfModule = async(formData) => {
    const result = await putFormData("lessons",formData);
    return result;
}

export const createTestOfModule = async(data) => {
    const result = await post("tests",data);
    return result;
}

export const deleteTestOfModule = async(id) => {
    const result = await del(`tests/${id}`);
    return result;
}

export const publicCourse = async(id) => {
    const result = await put(`courses/publish/${id}`);
    return result;
}

export const getLessonPath = async(id) => {
    const result = await get(`lessons/path/${id}`);
    return result;
}

export const getLessonIdNext = async(id,type) => {
    const result = await get(`lessons/next-lessonID?id=${id}&&type=${type}`);
    return result;
}

export const getLessonIdPrevious = async(id,type) => {
    const result = await get(`lessons/previous-lessonID?id=${id}&&type=${type}`);
    return result;
}

export const getMiniTestSummary = async(id) => {
    const result = await get(`tests/miniTest/summary/${id}`);
    return result;
}

export const getMiniTestStar = async(id) => {
    const studentId = getId();
    const result = await get(`tests/${id}/student/${studentId}/completedStar`);
    return result;
}

export const getHistoryMiniTest = async(id) => {
    const studentId = getId();
    const result = await get(`tests/${id}/student/${studentId}/testAttempts`);
    return result;
}

export const getIteractiveExercises = async(id) => {
    const studentId = getId();
    const result = await get(`exercises/interactive/${id}/student/${studentId}`);
    return result;
}

export const saveProcessLesson = (data) => {
    const result = post("lesson-progress",data);
    return result;
}

export const deleteLessonOfModule = async(id) => {
    const result = await del(`lessons/${id}`);
    return result;
}