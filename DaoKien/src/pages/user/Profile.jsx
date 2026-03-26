import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState("info");
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editedUser, setEditedUser] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // const API_DOMAIN = "http://10.185.176.202:8081/";
  const API_DOMAIN = "http://localhost:8081/";
  const API_URL = import.meta.env.VITE_API_URL;
  const token = typeof window !== 'undefined' ? localStorage.getItem("accessToken") : null;

  useEffect(() => {
    fetchUserData();
    fetchAttemptHistory();
  }, []);

  const parseJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => 
        '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      ).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        setMessage({ type: 'error', text: 'Không tìm thấy token' });
        return;
      }

      const obj = parseJwt(refreshToken);
      const email = obj?.sub;

      const response = await fetch(API_DOMAIN + `users/${email}`, {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      const result = await response.json();
      
      if (result.code === 200) {
        setUser(result.data);
        setEditedUser(result.data);
        
        setProfile({
          ID: 1,
          UserID: result.data.id,
          TargetScore: result.data.targetScore || 800,
          PlacementLevel: result.data.placementLevel || "Intermediate"
        });
      } else {
        setMessage({ type: 'error', text: result.message || 'Lỗi khi tải thông tin' });
      }
    } catch (err) {
      console.error("Lỗi khi tải thông tin người dùng:", err);
      setMessage({ type: 'error', text: 'Không thể tải thông tin người dùng' });
    } finally {
      setLoading(false);
    }
  };

  const fetchAttemptHistory = async () => {
    try {
      const response = await fetch(`${API_URL}/attempts/history?submittedOnly=true`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.data) {
          const formattedResults = data.data.map((attempt) => {
            const totalScore = (attempt.ScoreReading || 0) + (attempt.ScoreListening || 0);
            const startTime = new Date(attempt.StartedAt);
            const endTime = new Date(attempt.SubmittedAt);
            const timeTest = Math.round((endTime - startTime) / 60000);

            return {
              ID: attempt.ID,
              ExamId: attempt.ExamID,
              title: attempt.exam?.Title || "Bài thi không có tiêu đề",
              totalScore,
              ScoreReading: attempt.ScoreReading || 0,
              ScoreListening: attempt.ScoreListening || 0,
              ScorePercent: attempt.ScorePercent || 0,
              startAt: new Date(attempt.StartedAt).toLocaleString('vi-VN'),
              finishAt: new Date(attempt.SubmittedAt).toLocaleString('vi-VN'),
              timeTest,
              Type: attempt.Type,
              examType: attempt.exam?.examType?.Description || "Không rõ"
            };
          });

          setResults(formattedResults);
        }
      }
    } catch (err) {
      console.error("Lỗi khi tải lịch sử thi:", err);
    }
  };

  const handleEditToggle = () => {
    if (editMode) {
      setEditedUser(user);
    }
    setEditMode(!editMode);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedUser({ ...editedUser, [name]: value });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const dataToUpdate = {
        email: user.email || user.Email, // ✅ Thêm email vào body
        fullName: editedUser.fullName || editedUser.FullName,
        phone: editedUser.phone || editedUser.Phone,
        birthday: editedUser.birthday || editedUser.Birthday,
        address: editedUser.address || editedUser.Address
      };

      const response = await fetch(API_DOMAIN + 'users', {
        method: "PUT",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(dataToUpdate)
      });

      const result = await response.json();

      if (result.code === 200) {
        setUser(editedUser);
        setEditMode(false);
        setMessage({ type: 'success', text: 'Cập nhật thông tin thành công!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: result.message || 'Lỗi khi cập nhật' });
      }
    } catch (err) {
      console.error("Lỗi khi lưu thông tin:", err);
      setMessage({ type: 'error', text: 'Không thể lưu thông tin' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center py-20 text-gray-400 italic">
          Không thể tải dữ liệu người dùng
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="flex flex-col items-center mb-8 relative">
            <div className="relative">
              <img
                src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                alt="avatar"
                className="w-32 h-32 rounded-full border-4 border-blue-500 shadow-lg"
              />
              <button
                onClick={editMode ? handleSave : handleEditToggle}
                disabled={saving}
                className="absolute bottom-2 right-2 bg-blue-600 text-white p-2 rounded-full shadow hover:bg-blue-700 transition-all disabled:bg-gray-400"
                title={editMode ? "Lưu thay đổi" : "Chỉnh sửa thông tin"}
              >
                {editMode ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                  </svg>
                )}
              </button>
            </div>

            <h2 className="text-3xl font-bold text-blue-700 mt-4">{user.fullName || user.FullName}</h2>
            <p className="text-gray-500">{user.email || user.Email}</p>
          </div>

          {message.text && (
            <div className={`mb-4 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {message.text}
            </div>
          )}

          <div className="flex justify-center mb-8 rounded-lg overflow-hidden shadow-sm">
            <button
              className={`flex-1 py-3 font-semibold transition-all ${
                activeTab === "info"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              onClick={() => setActiveTab("info")}
            >
              Thông tin cá nhân
            </button>
            <button
              className={`flex-1 py-3 font-semibold transition-all ${
                activeTab === "history"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              onClick={() => setActiveTab("history")}
            >
              Lịch sử luyện thi
            </button>
          </div>

          {activeTab === "info" ? (
            <div className="bg-gray-50 p-8 rounded-2xl shadow-inner space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                    Họ và tên
                  </label>
                  {editMode ? (
                    <input
                      type="text"
                      name="fullName"
                      value={editedUser.fullName || editedUser.FullName || ''}
                      onChange={handleChange}
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-gray-800 font-medium">{user.fullName || user.FullName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                    Email
                  </label>
                  <p className="text-gray-800 font-medium">{user.email || user.Email}</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                    </svg>
                    Số điện thoại
                  </label>
                  {editMode ? (
                    <input
                      type="text"
                      name="phone"
                      value={editedUser.phone || editedUser.Phone || ''}
                      onChange={handleChange}
                      maxLength="10"
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-gray-800 font-medium">{user.phone || user.Phone || 'Chưa cập nhật'}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    Ngày sinh
                  </label>
                  {editMode ? (
                    <input
                      type="date"
                      name="birthday"
                      value={editedUser.birthday || editedUser.Birthday || ''}
                      onChange={handleChange}
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-gray-800 font-medium">{user.birthday || user.Birthday || 'Chưa cập nhật'}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    Địa chỉ
                  </label>
                  {editMode ? (
                    <input
                      type="text"
                      name="address"
                      value={editedUser.address || editedUser.Address || ''}
                      onChange={handleChange}
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-gray-800 font-medium">{user.address || user.Address || 'Chưa cập nhật'}</p>
                  )}
                </div>

                {/* <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Mục tiêu TOEIC
                  </label>
                  <p className="text-blue-700 font-bold text-lg">
                    {profile.TargetScore ? `${profile.TargetScore} điểm` : "Chưa đặt mục tiêu"}
                  </p>
                </div> */}
              </div>

              {editMode && (
                <div className="flex gap-3 justify-center mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={handleEditToggle}
                    disabled={saving}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
                  >
                    {saving ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Đang lưu...
                      </>
                    ) : (
                      'Lưu thay đổi'
                    )}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 p-6 rounded-2xl shadow-inner">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h3 className="text-xl font-semibold text-blue-700">
                  Lịch sử các bài luyện thi
                </h3>
                <Link
                  to="/user/statistics"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow hover:shadow-md"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                  </svg>
                  Xem thống kê
                </Link>
              </div>

              {results.length > 0 ? (
                <ul className="space-y-4">
                  {results.map((r) => (
                    <li
                      key={r.ID}
                      className="bg-white shadow rounded-xl p-4 hover:shadow-lg transition-all"
                    >
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-2">
                        <div className="flex-1">
                          <p className="font-semibold text-blue-700 text-lg">
                            {r.title} (#{r.ExamId})
                          </p>
                          <p className="text-gray-500 text-sm">{r.examType}</p>
                          <p className="text-gray-500 text-sm">
                            Làm bài: {r.startAt} → {r.finishAt}
                          </p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-3 md:mt-0">
                          <div className="flex items-center gap-2">
                            <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                            </svg>
                            <span className="text-lg font-bold text-green-600">
                              {r.totalScore} điểm
                            </span>
                          </div>
                          <Link to ={`/user/result/${r.ID}`}
                            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-all shadow hover:shadow-md"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                            </svg>
                            Xem chi tiết
                          </Link>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-4 text-gray-600 text-sm mt-3 pt-3 border-t border-gray-100">
                        <span className="flex items-center gap-1">
                          <span className="font-semibold">📖 Reading:</span> {r.ScoreReading}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="font-semibold">🎧 Listening:</span> {r.ScoreListening}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="font-semibold">📊 Tỷ lệ:</span> {r.ScorePercent}%
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="font-semibold">⏱ Thời gian:</span> {r.timeTest} phút
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-12">
                  <svg className="w-20 h-20 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  <p className="text-gray-500 italic text-lg">Chưa có lịch sử làm bài</p>
                  <p className="text-gray-400 text-sm mt-2">Hãy bắt đầu làm bài thi để xem kết quả tại đây</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;