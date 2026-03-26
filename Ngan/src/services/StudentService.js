import { get } from "../utils/request";

export const getListStudents = async() => {
    const result = await get("studentprofiles");
    return result;
}