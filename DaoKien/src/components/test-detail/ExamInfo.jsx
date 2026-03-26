import { CheckCircle2, Clock, FileText } from "lucide-react";

export default function ExamInfo({ exam, parts }) {
    const totalQuestions = exam?.Questions?.length || 0;

    return (
        <div className="bg-white shadow-xl rounded-2xl p-8 mb-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoItem
                    icon={CheckCircle2}
                    label="Loại đề"
                    value={exam.ExamType?.Code || "Không xác định"}
                />
                <InfoItem
                    icon={Clock}
                    label="Thời gian chuẩn"
                    value={`${exam.TimeExam} phút`}
                />
                <InfoItem
                    icon={FileText}
                    label="Số phần thi"
                    value={`${parts.length} phần`}
                />
                <InfoItem
                    icon={FileText}
                    label="Tổng số câu hỏi"
                    value={`${totalQuestions} câu`}
                />
            </div>
        </div>
    );
}

function InfoItem({ icon: Icon, label, value }) {
    return (
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <Icon className="w-6 h-6 text-blue-600" />
            <div>
                <p className="text-sm text-gray-500 font-medium">{label}</p>
                <p className="font-bold text-gray-900 text-lg">{value}</p>
            </div>
        </div>
    );
}
