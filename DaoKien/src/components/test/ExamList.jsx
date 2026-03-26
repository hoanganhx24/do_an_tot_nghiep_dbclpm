import ExamCard from "./ExamCard";
import { BookOpen } from "lucide-react";

export default function ExamList({ exams }) {
    if (exams.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Không tìm thấy đề thi phù hợp</p>
                <p className="text-gray-400 text-sm mt-2">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {exams.map(exam => (
                <ExamCard key={exam.ID} exam={exam} />
            ))}
        </div>
    );
}
// import ExamCard from "./ExamCard"

// export default function ExamList({ exams }) {
//     if (exams.length === 0)
//         return <p className="text-center text-gray-500">Không tìm thấy đề thi phù hợp.</p>

//     return (
//         <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
//             {exams.map(exam => (
//                 <ExamCard key={exam.ID} exam={exam} />
//             ))}
//         </div>
//     )
// }
