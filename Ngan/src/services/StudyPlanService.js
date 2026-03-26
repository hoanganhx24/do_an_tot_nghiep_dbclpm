import { getId } from "../components/token";
import { get, post } from "../utils/request";

export const getStudyPlanOverview = async() => {
    const studentId = getId();
    const result = await get(`study-plans/overview/student/${studentId}`);
    return result;
}

export const getMinDayForStudy = async(id) => {
    const studentId = getId();
    const result = await get(`study-plans/min-day-for-study/${id}/student/${studentId}`);
    return result;
}

export const verifyInformation = async(data) => {
    const studentId = getId();
    const result = await post(`study-plans/verify-information`, data);
    return result;
}

export const createPlan= async(data) => {
    const studentId = getId();
    const result = await post(`study-plans`, data);
    return result;
}

export const checkExitPlanStudy = async() => {
    const studentId = getId();
    const result = await get(`study-plans/checkExist?studentId=${studentId}`);
    return result;
}

export const getStudyPlanDetail = async(id) => {
    const result = await get(`study-plans/${id}`);
    return result;
}

export const getInformationAboutStudyplan = async(id) => {
    const result = await get(`study-plans/${id}/information-about-studyplan`);
    return result;
}