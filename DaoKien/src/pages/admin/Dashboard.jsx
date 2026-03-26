import { useEffect, useState } from "react";
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Area,
    AreaChart
} from "recharts";
import {
    Users,
    BookOpen,
    MessageSquare,
    TrendingUp,
    Calendar,
    Award,
    Clock,
    Target,
    Activity,
    FileText,
    Eye,
    CheckCircle,
    AlertCircle,
    ArrowUp,
    ArrowDown
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;
// const ADMIN_TOKEN = import.meta.env.VITE_ADMIN_TOKEN;
const ADMIN_TOKEN = localStorage.getItem("accessToken");

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalExams: 0,
        totalComments: 0,
        totalAttempts: 0,
        activeUsers: 0,
        newUsersThisMonth: 0,
        totalQuestions: 0,
        avgCompletionRate: 0
    });

    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState("7days");

    // Mock data - thay bằng API thật của bạn
    const monthlyData = [
        { month: "Jan", users: 120, attempts: 450, exams: 15 },
        { month: "Feb", users: 145, attempts: 520, exams: 18 },
        { month: "Mar", users: 180, attempts: 680, exams: 22 },
        { month: "Apr", users: 220, attempts: 820, exams: 25 },
        { month: "May", users: 280, attempts: 1050, exams: 30 },
        { month: "Jun", users: 350, attempts: 1300, exams: 35 }
    ];

    const examTypeData = [
        { name: "Full Test", value: 450, color: "#3b82f6" },
        { name: "Practice", value: 680, color: "#10b981" },
        { name: "Mini Test", value: 320, color: "#f59e0b" }
    ];

    const dailyActivityData = [
        { day: "Mon", active: 85 },
        { day: "Tue", active: 92 },
        { day: "Wed", active: 88 },
        { day: "Thu", active: 95 },
        { day: "Fri", active: 120 },
        { day: "Sat", active: 140 },
        { day: "Sun", active: 115 }
    ];

    const partPerformanceData = [
        { part: "Part 1", avgScore: 82, attempts: 1200 },
        { part: "Part 2", avgScore: 75, attempts: 1180 },
        { part: "Part 3", avgScore: 68, attempts: 1150 },
        { part: "Part 4", avgScore: 71, attempts: 1130 },
        { part: "Part 5", avgScore: 79, attempts: 1160 },
        { part: "Part 6", avgScore: 73, attempts: 1140 },
        { part: "Part 7", avgScore: 70, attempts: 1120 }
    ];

    useEffect(() => {
        fetchDashboardData();
    }, [timeRange]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Mock data - Thay bằng các API call thực tế
            setTimeout(() => {
                setStats({
                    totalUsers: 1250,
                    totalExams: 145,
                    totalComments: 3420,
                    totalAttempts: 8500,
                    activeUsers: 350,
                    newUsersThisMonth: 85,
                    totalQuestions: 4200,
                    avgCompletionRate: 78
                });
                setLoading(false);
            }, 1000);

            // Ví dụ API calls thật:
            /*
            const [users, exams, comments, attempts] = await Promise.all([
              fetch(`${API_URL}/users/stats`, { headers: { Authorization: `Bearer ${ADMIN_TOKEN}` } }),
              fetch(`${API_URL}/exams/stats`, { headers: { Authorization: `Bearer ${ADMIN_TOKEN}` } }),
              fetch(`${API_URL}/comments/stats`, { headers: { Authorization: `Bearer ${ADMIN_TOKEN}` } }),
              fetch(`${API_URL}/attempts/stats`, { headers: { Authorization: `Bearer ${ADMIN_TOKEN}` } })
            ]);
            */
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
            setLoading(false);
        }
    };

    const StatCard = ({ icon: Icon, title, value, change, changeType, color, subtitle }) => (
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all duration-300 border border-gray-100">
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${color}`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
                {change && (
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${changeType === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                        {changeType === 'up' ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                        {change}%
                    </div>
                )}
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
            <p className="text-3xl font-bold text-gray-900 mb-1">{value.toLocaleString()}</p>
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
    );

    const RecentActivity = () => {
        const activities = [
            { id: 1, type: "exam", message: "New exam created: TOEIC Practice Test #145", time: "2 mins ago", icon: BookOpen, color: "text-blue-600" },
            { id: 2, type: "user", message: "New user registered: john.doe@email.com", time: "15 mins ago", icon: Users, color: "text-green-600" },
            { id: 3, type: "comment", message: "New comment on Exam #23", time: "1 hour ago", icon: MessageSquare, color: "text-purple-600" },
            { id: 4, type: "attempt", message: "100+ attempts completed today", time: "2 hours ago", icon: CheckCircle, color: "text-orange-600" }
        ];

        return (
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-blue-600" />
                        Recent Activity
                    </h3>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        View All
                    </button>
                </div>
                <div className="space-y-4">
                    {activities.map((activity) => (
                        <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                            <div className={`p-2 rounded-lg bg-gray-100 ${activity.color}`}>
                                <activity.icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-800 font-medium">{activity.message}</p>
                                <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const TopExams = () => {
        const topExams = [
            { id: 1, title: "TOEIC Full Test 2024 - Vol 1", attempts: 1250, avgScore: 785, trend: "up" },
            { id: 2, title: "Practice Test - Listening Focus", attempts: 980, avgScore: 420, trend: "up" },
            { id: 3, title: "Reading Comprehension Test", attempts: 850, avgScore: 395, trend: "down" },
            { id: 4, title: "Grammar & Vocabulary Practice", attempts: 720, avgScore: 380, trend: "up" }
        ];

        return (
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Award className="w-5 h-5 text-yellow-500" />
                        Top Performing Exams
                    </h3>
                </div>
                <div className="space-y-3">
                    {topExams.map((exam, index) => (
                        <div key={exam.id} className="flex items-center gap-4 p-4 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                                {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-gray-900 text-sm truncate">{exam.title}</h4>
                                <div className="flex items-center gap-4 mt-1">
                                    <span className="text-xs text-gray-500">{exam.attempts} attempts</span>
                                    <span className="text-xs text-gray-500">Avg: {exam.avgScore}</span>
                                </div>
                            </div>
                            <div className={`flex items-center gap-1 ${exam.trend === 'up' ? 'text-green-600' : 'text-red-600'
                                }`}>
                                {exam.trend === 'up' ? <TrendingUp size={16} /> : <ArrowDown size={16} />}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-700">
                                Dashboard Overview
                            </h1>
                            <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your TOEIC platform.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <select
                                value={timeRange}
                                onChange={(e) => setTimeRange(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="7days">Last 7 days</option>
                                <option value="30days">Last 30 days</option>
                                <option value="90days">Last 90 days</option>
                                <option value="year">This year</option>
                            </select>
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                                Export Report
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        icon={Users}
                        title="Total Users"
                        value={stats.totalUsers}
                        change={12.5}
                        changeType="up"
                        color="from-blue-500 to-blue-600"
                        subtitle={`+${stats.newUsersThisMonth} this month`}
                    />
                    <StatCard
                        icon={BookOpen}
                        title="Total Exams"
                        value={stats.totalExams}
                        change={8.3}
                        changeType="up"
                        color="from-green-500 to-green-600"
                        subtitle="4 added this week"
                    />
                    <StatCard
                        icon={Target}
                        title="Total Attempts"
                        value={stats.totalAttempts}
                        change={15.2}
                        changeType="up"
                        color="from-purple-500 to-purple-600"
                        subtitle={`${stats.activeUsers} active today`}
                    />
                    <StatCard
                        icon={MessageSquare}
                        title="Comments"
                        value={stats.totalComments}
                        change={5.7}
                        changeType="up"
                        color="from-orange-500 to-orange-600"
                        subtitle="320 this week"
                    />
                </div>

                {/* Charts Row 1 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* User Growth */}
                    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-blue-600" />
                            User Growth & Engagement
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={monthlyData}>
                                <defs>
                                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorAttempts" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: '12px' }} />
                                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        padding: '12px'
                                    }}
                                />
                                <Legend />
                                <Area
                                    type="monotone"
                                    dataKey="users"
                                    stroke="#3b82f6"
                                    fillOpacity={1}
                                    fill="url(#colorUsers)"
                                    name="Users"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="attempts"
                                    stroke="#10b981"
                                    fillOpacity={1}
                                    fill="url(#colorAttempts)"
                                    name="Attempts"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Exam Distribution */}
                    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-purple-600" />
                            Exam Type Distribution
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={examTypeData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {examTypeData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Charts Row 2 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Daily Activity */}
                    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-green-600" />
                            Daily Active Users
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={dailyActivityData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="day" stroke="#6b7280" style={{ fontSize: '12px' }} />
                                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Bar dataKey="active" fill="#10b981" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Part Performance */}
                    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Target className="w-5 h-5 text-blue-600" />
                            Performance by Part
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={partPerformanceData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis type="number" stroke="#6b7280" style={{ fontSize: '12px' }} />
                                <YAxis dataKey="part" type="category" stroke="#6b7280" style={{ fontSize: '12px' }} width={80} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Bar dataKey="avgScore" fill="#3b82f6" radius={[0, 8, 8, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Bottom Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <RecentActivity />
                    <TopExams />
                </div>

                {/* Quick Actions */}
                <div className="mt-8 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 text-white">
                    <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-4 transition-all text-center">
                            <Users className="w-6 h-6 mx-auto mb-2" />
                            <span className="text-sm font-medium">Manage Users</span>
                        </button>
                        <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-4 transition-all text-center">
                            <BookOpen className="w-6 h-6 mx-auto mb-2" />
                            <span className="text-sm font-medium">Add Exam</span>
                        </button>
                        <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-4 transition-all text-center">
                            <FileText className="w-6 h-6 mx-auto mb-2" />
                            <span className="text-sm font-medium">View Reports</span>
                        </button>
                        <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-4 transition-all text-center">
                            <MessageSquare className="w-6 h-6 mx-auto mb-2" />
                            <span className="text-sm font-medium">Moderate Comments</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}