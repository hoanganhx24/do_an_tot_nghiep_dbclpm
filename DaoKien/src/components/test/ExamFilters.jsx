import { Search } from "lucide-react";

export default function ExamFilters({
    exams,
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery
}) {
    const uniqueTypes = [...new Set(exams.map(e => e.Type))].filter(Boolean);
    const categories = ["Tất cả", ...uniqueTypes];

    const getCategoryLabel = (category) => {
        if (category === "Tất cả") return "Tất cả";
        return category;
    };

    return (
        <>
            <div className="mb-6 flex flex-wrap gap-3">
                {categories.map(category => (
                    <button
                        key={category}
                        onClick={() => setActiveCategory(category)}
                        className={`rounded-xl px-5 py-2.5 text-sm font-semibold border-2 transition-all duration-300 shadow-sm ${
                            activeCategory === category
                                ? "bg-blue-600 text-white border-blue-600 shadow-lg scale-105"
                                : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300 hover:border-blue-300 hover:scale-102"
                        }`}
                    >
                        {getCategoryLabel(category)}
                    </button>
                ))}
            </div>

            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm đề thi theo tên..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition-all"
                    />
                </div>
            </div>
        </>
    );
}

// import { Search } from "lucide-react"

// export default function ExamFilters({
//     exams,
//     activeCategory,
//     setActiveCategory,
//     searchQuery,
//     setSearchQuery
// }) {
//     const categories = ["Tất cả", ...new Set(exams.map(e => e.Type))]

//     return (
//         <>
//             {/* Categories */}
//             <div className="mb-8 flex flex-wrap gap-3">
//                 {categories.map(category => (
//                     <button
//                         key={category}
//                         onClick={() => setActiveCategory(category)}
//                         className={`rounded-lg px-4 py-2 text-sm font-medium border transition-colors ${
//                             activeCategory === category
//                                 ? "bg-blue-600 text-white border-blue-600"
//                                 : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
//                         }`}
//                     >
//                         {category}
//                     </button>
//                 ))}
//             </div>

//             {/* Search */}
//             <div className="mb-6 flex gap-3">
//                 <div className="relative flex-1">
//                     <input
//                         type="text"
//                         placeholder="Nhập từ khoá: tên đề..."
//                         value={searchQuery}
//                         onChange={(e) => setSearchQuery(e.target.value)}
//                         className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-12 shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
//                     />
//                     <Search className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
//                 </div>
//             </div>
//         </>
//     )
// }
