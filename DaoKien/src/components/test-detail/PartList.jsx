export default function PartList({ exam, parts }) {
    return (
        <div className="bg-gray-50 rounded-xl p-5 mb-8">
            <h2 className="text-lg font-semibold mb-4">Các phần thi trong đề</h2>

            <div className="space-y-3">
                {parts.map((section) => {
                    const qInPart = exam.Questions.filter(
                        (q) => q.Media?.Section === section
                    );

                    // Lấy tất cả type và loại bỏ trùng nhau
                    const types = [
                        ...new Set(qInPart.map((q) => q.Media?.Type).filter(Boolean))
                    ];

                    return (
                        <div key={section} className="flex items-center gap-3 py-2">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-blue-700">Part {section}</span>
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                                    {qInPart.length} câu
                                </span>
                            </div>

                            <div className="h-4 w-px bg-gray-300"></div>

                            <div className="flex flex-wrap gap-2">
                                {types.map((t) => (
                                    <span
                                        key={t}
                                        className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full"
                                    >
                                        {t}
                                    </span>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// export default function PartList({ exam, parts }) {
//     return (
//         <div className="bg-gray-50 rounded-xl p-5 mb-8">
//             <h2 className="text-lg font-semibold mb-4">Các phần thi trong đề</h2>

//             <div className="space-y-3">
//                 {parts.map((section) => {
//                     const qInPart = exam.Questions.filter(
//                         (q) => q.Media?.Section === section
//                     );

//                     // Lấy tất cả type và loại bỏ trùng nhau
//                     const types = [
//                         ...new Set(qInPart.map((q) => q.Media?.Type).filter(Boolean))
//                     ];

//                     return (
//                         <div key={section} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
//                             <div className="flex items-center gap-2">
//                                 <span className="font-semibold text-blue-700">Part {section}</span>
//                                 <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
//                                     {qInPart.length} câu
//                                 </span>
//                             </div>

//                             <div className="h-4 w-px bg-gray-300"></div>

//                             <div className="flex flex-wrap gap-2">
//                                 {types.map((t) => (
//                                     <span
//                                         key={t}
//                                         className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full"
//                                     >
//                                         {t}
//                                     </span>
//                                 ))}
//                             </div>
//                         </div>
//                     );
//                 })}
//             </div>
//         </div>
//     );
// }