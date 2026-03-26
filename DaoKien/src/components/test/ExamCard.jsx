import { Link } from "react-router-dom";
import { Clock, BookOpen, Calendar } from "lucide-react";

export default function ExamCard({ exam }) {
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
    };

    const getTypeColor = (type) => {
        if (type === "FULL_TEST") return "bg-purple-100 text-purple-800";
        if (type === "PRACTICE") return "bg-green-100 text-green-800";
        return "bg-gray-100 text-gray-800";
    };

    return (
        <div className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 flex flex-col group">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-400 p-4">
                <div className="flex items-center justify-between mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(exam.Type)}`}>
                        {exam.Type || exam.TypeName}
                    </span>
                    {exam.TimeCreate && (
                        <span className="text-white text-xs flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(exam.TimeCreate)}
                        </span>
                    )}
                </div>
                <h3 className="text-white font-bold text-lg line-clamp-2 min-h-[3.5rem]">
                    {exam.Title}
                </h3>
            </div>

            <div className="flex-1 p-5 space-y-3">
                <div className="flex items-center gap-3 text-gray-700">
                    <div className="bg-blue-100 p-2 rounded-lg">
                        <Clock className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Thời gian làm bài</p>
                        <p className="font-semibold">{exam.TimeExam} phút</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 text-gray-700">
                    <div className="bg-indigo-100 p-2 rounded-lg">
                        <BookOpen className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Loại đề thi</p>
                        <p className="font-semibold">{exam.Type || exam.TypeName}</p>
                    </div>
                </div>
            </div>

            <div className="border-t border-gray-200">
                <Link to={`/user/tests/${exam.ID}`} className="block">
                    <button className="w-full px-6 py-4 text-center font-semibold text-blue-600 hover:bg-blue-50 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                        Bắt đầu làm bài
                    </button>
                </Link>
            </div>
        </div>
    );
}
// import { Link } from "react-router-dom"
// import { Clock, Layers, ListChecks } from "lucide-react"

// export default function ExamCard({ exam }) {
//     const totalQuestions = "—"
//     const partCount = "—"

//     return (
//         <div className="bg-white rounded-xl shadow-sm border hover:shadow-lg transition-shadow flex flex-col overflow-hidden">
//             <div className="flex-1 p-4">
//                 <h3 className="mb-3 text-base font-semibold text-gray-900">{exam.Title}</h3>

//                 <p className="text-xs text-gray-500 mb-3">
//                     Loại: <span className="font-medium text-gray-700">{exam.TypeName}</span>
//                 </p>

//                 <div className="text-xs text-gray-600 flex items-center gap-2 mb-2">
//                     <Clock className="h-4 w-4" />
//                     <span>Thời gian làm bài: {exam.TimeExam} phút</span>
//                 </div>

//                 <div className="text-xs text-gray-600 flex items-center gap-2 mb-2">
//                     <Layers className="h-4 w-4" />
//                     <span>Các phần trong đề: {partCount}</span>
//                 </div>

//                 <div className="text-xs text-gray-600 flex items-center gap-2">
//                     <ListChecks className="h-4 w-4" />
//                     <span>Số câu hỏi: {totalQuestions}</span>
//                 </div>
//             </div>

//             <Link to={`/user/tests/${exam.ID}`} className="block">
//                 <button className="w-full border-t border-gray-200 px-4 py-3 text-center font-medium text-blue-600 hover:bg-blue-50 transition-colors flex justify-center">
//                     Chi tiết
//                 </button>
//             </Link>
//         </div>
//     )
// }
