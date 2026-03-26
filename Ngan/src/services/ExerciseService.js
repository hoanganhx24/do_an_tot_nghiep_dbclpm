import { getId } from "../components/token";
import { del, get, post, postFormData, put2, putFormData } from "../utils/request";

export const getListExercisesOfTeacherLesson = async(id) => {
    const result = await get(`exercises/lesson/${id}/summary`);
    return result;
}

export const createExerciseOfTeacherLesson = async(data) => {
    const result = await postFormData(`exercises`, data);
    return result;
}

export const updateExerciseOfTeacherLesson = async(data) => {
    const result = await putFormData(`exercises`, data);
    return result;
}

export const createQuestionOfExercise = async(data) => {
    const result = await postFormData(`questions`, data);
    return result;
}

export const updateQuestionOfExercise = async(data) => {
    const result = await putFormData(`questions`, data);
    return result;
}

export const getListQuestionOfExercise = async(id) => {
    const result = await get(`exercises/${id}`);
    return result;
}

export const deleteQuestionOfExercise = async(id) => {
    const result = await del(`questions/${id}`);
    return result;
}

export const deleteExerciseOfTeacherLesson = async(id) => {
    const result = await del(`exercises/${id}`);
    return result;
}

export const getListExercisesOfTest = async(id) => {
    const result = await get(`assessments/test/${id}/summary`);
    return result;
}

export const createExerciseOfTest = async(data) => {
    const result = await postFormData(`assessments`, data);
    return result;
}

export const updateExerciseOfTest = async(data) => {
    const result = await putFormData(`assessments`, data);
    return result;
}

export const deleteExerciseOfTest = async(id) => {
    const result = await del(`assessments/${id}`);
    return result;
}

export const getListQuestionOfExerciseTest = async(id) => {
    const result = await get(`assessments/${id}`);
    return result;
}

export const createQuestionOfExerciseTest = async(data) => {
    const result = await postFormData(`assessmentquesstions`, data);
    return result;
}

export const updateQuestionOfExerciseTest = async(data) => {
    const result = await putFormData(`assessmentquesstions`, data);
    return result;
}

export const deleteQuestionOfExerciseTest = async(id) => {
    const result = await del(`assessmentquesstions/${id}`);
    return result;
}

export const getListExercisesOfLessonStudent = async(id) => {
    const studentId = getId();
    const result = await get(`exercises/lesson/${id}/student/${studentId}`);
    return result;
}

export const getExerciseDetailOfLessonStudent = async(id) => {
    const studentId = getId();
    const result = await get(`exercises/student?id=${id}&&studentProfileId=${studentId}`);
    return result;
}

export const saveAnswerEx = async(data) => {
    const result = await put2(`attempts`,data);
    return result;
}

