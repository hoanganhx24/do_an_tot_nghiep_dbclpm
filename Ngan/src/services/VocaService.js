import { getId } from "../components/token";
import { get, post } from "../utils/request";

export const getListSuggest = async(word) => {
    const result = await get(`dictionary/suggestion?word=${word}`);
    return result;
}

export const getSearchInDictionary = async(word) => {
    const studentID = getId();
    const result = await get(`dictionary?word=${word}&&studentId=${studentID}`);
    return result;
}

export const saveStudentDictionary = async(word) => {
    const result = await post(`student-dictionarys`,word);
    return result;
}

export const getStudentDictionary = async() => {
    const studentID = getId();
    const result = await get(`student-dictionarys/student/${studentID}`);
    return result;
}