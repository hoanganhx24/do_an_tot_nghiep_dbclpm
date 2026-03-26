import { get, patch, post, put, put2 } from "../utils/request"

export const getListTeachers = async() => {
    const result = await get("teacherprofiles");
    return result;
}

export const getListTeachersActive = async() => {
    const result = await get("teacherprofiles/active");
    return result;
}

export const getTeacherDetail = async(id) => {
    const result = await get(`teachers/${id}`);
    return result;
}

export const createTeacher = async(option) => {
    const result = await post ("teacherprofiles/create", option);
    return result;
}

export const updateTeacher = async(option) => {
    const result = await put2 ("teacherprofiles", option);
    return result;
}

export const deleteTeacher = async(id) => {
    const result = await put (`teacherprofiles/${id}/terminate`);
    return result;
}