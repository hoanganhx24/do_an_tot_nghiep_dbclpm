import { useEffect, useState } from "react";
import ExamFilters from "../../components/test/ExamFilters";
import ExamList from "../../components/test/ExamList";
import { BookOpen, Clock, Filter, Award } from "lucide-react";

export default function Tests() {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("Tất cả");

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api/exam";
    // const STUDENT_TOKEN = import.meta.env.VITE_STUDENT_TOKEN || "";

    const STUDENT_TOKEN = localStorage.getItem("accessToken");

    useEffect(() => {
        fetchExams();
    }, []);

    const fetchExams = async () => {
        try {
            setLoading(true);



            const res = await fetch(`${API_URL}/exams`, {
                headers: {
                    Authorization: `Bearer ${STUDENT_TOKEN}`,
                    "Content-Type": "application/json"
                }
            });

            if (!res.ok) throw new Error("Failed to fetch exams");

            const result = await res.json();
            const data = result.success ? result.data : (Array.isArray(result) ? result : []);
            setExams(data);
        } catch (err) {
            console.error("Error fetching exams:", err);
            setExams([]);
        } finally {
            setLoading(false);
        }
    };

    const mergedExams = exams.map(exam => ({
        ...exam,
        TypeName: exam.Type || "Khác"
    }));

    const filteredExams = mergedExams.filter(exam => {
        const matchCategory =
            activeCategory === "Tất cả" ||
            exam.Type === activeCategory ||
            exam.TypeName.toLowerCase().includes(activeCategory.toLowerCase());

        const matchSearch = exam.Title?.toLowerCase().includes(searchQuery.toLowerCase());

        return matchCategory && matchSearch;
    });

    const stats = {
        total: exams.length,
        fullTest: exams.filter(e => e.Type === "FULL_TEST").length,
        practice: exams.filter(e => e.Type === "PRACTICE").length
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Đang tải đề thi...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-700">
                                Thư viện đề thi
                            </h1>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">

                <div className="flex gap-8">
                    <div className="flex-1">
                        <ExamFilters
                            exams={exams}
                            activeCategory={activeCategory}
                            setActiveCategory={setActiveCategory}
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                        />

                        <ExamList exams={filteredExams} />
                    </div>
                </div>
            </main>
        </div>
    );
}


// "use client"
// import { useEffect, useState } from "react"
// import ExamFilters from "../../components/tests/ExamFilters"
// import ExamList from "../../components/tests/ExamList"
// // import ExamSidebar from "../../components/tests/ExamSidebar"

// export default function Tests() {
//     const [exams, setExams] = useState([])
//     const [searchQuery, setSearchQuery] = useState("")
//     const [activeCategory, setActiveCategory] = useState("Tất cả")

//     useEffect(() => {
//         const fetchExams = async () => {
//             try {
//                 const res = await fetch("http://localhost:3001/api/exam/exams", {
//                     headers: {
//                         Authorization: `Bearer ${import.meta.env.VITE_STUDENT_TOKEN}`,
//                     }
//                 })
//                 const data = await res.json()
//                 setExams(Array.isArray(data) ? data : data.data)
//             } catch (err) { console.error(err) }
//         }
//         fetchExams()
//     }, [])

//     const mergedExams = exams.map(exam => ({
//         ...exam,
//         TypeName: exam.Type || "Khác"
//     }))

//     const filteredExams = mergedExams.filter(exam => {
//         const matchCategory =
//             activeCategory === "Tất cả" ||
//             exam.TypeName.toLowerCase().includes(activeCategory.toLowerCase())

//         const matchSearch =
//             exam.Title.toLowerCase().includes(searchQuery.toLowerCase())

//         return matchCategory && matchSearch
//     })

//     return (
//         <div className="min-h-screen bg-gray-50">
//             <header className="border-b bg-white shadow-sm">
//                 <div className="mx-auto max-w-7xl px-6 py-8">
//                     <h1 className="text-3xl font-bold text-gray-900">Thư viện đề thi</h1>
//                 </div>
//             </header>

//             <main className="mx-auto max-w-7xl px-6 py-8">
//                 <div className="flex gap-8">
//                     <div className="flex-1">
//                         <ExamFilters
//                             exams={exams}
//                             activeCategory={activeCategory}
//                             setActiveCategory={setActiveCategory}
//                             searchQuery={searchQuery}
//                             setSearchQuery={setSearchQuery}
//                         />

//                         <ExamList exams={filteredExams} />
//                     </div>

//                     {/* <ExamSidebar /> */}
//                 </div>
//             </main>
//         </div>
//     )
// }