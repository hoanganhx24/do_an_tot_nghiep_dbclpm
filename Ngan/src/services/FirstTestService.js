import { getId } from "../components/token";
import { get, post } from "../utils/request";
export const getFirstTests = async(data) => {
    const result = await get("tests/firstTests/summary");
    return result;
}
export const createFirstTest = async(data) => {
    const result = await post("tests/firstTest",data);
    return result;
}

export const getQuestionsOfFirstTest = async() => {
    const result = await get(`assessments/firsttest`);
    return result;
}

export const getQuestionsOfMiniTest = async(id) => {
    const result = await get(`assessments/mini-test/${id}`);
    return result;
}

export const getQuestionsHistoryOfFirstTest = async(id) => {
    const result = await get(`testattempt/${id}/testAttemptDetail`);
    return result;
}

export const saveResultFirstTest = async(data) => {
    const result = await post("testattempt",data);
    return result;
}

export const saveResultMiniTest = async(data) => {
    const result = await post("testattempt/mini-test",data);
    return result;
}

export const getFlow = async() => {
    const studentId = getId();
    const result = await get(`enrollments/studyFolow/${studentId}`);
    return result;
}

export const unlock = async(data) => {
    const result = await post("testprogress",data);
    return result;
}