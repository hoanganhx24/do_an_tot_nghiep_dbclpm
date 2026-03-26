import { useState, useEffect } from "react";
import { X, Image, Volume2, Save, RotateCcw, AlertCircle, CheckCircle, Loader2, Upload, Trash2 } from "lucide-react";

export default function EditMediaQuestionModal({ media, onClose }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mediaData, setMediaData] = useState(null);
    
    const [formMedia, setFormMedia] = useState(null);
    const [formQuestions, setFormQuestions] = useState([]);
    const [originalQuestions, setOriginalQuestions] = useState([]);
    
    const [updateStatus, setUpdateStatus] = useState({});
    const [mediaUpdateStatus, setMediaUpdateStatus] = useState(null);
    
    const [imageUploading, setImageUploading] = useState(false);
    const [audioUploading, setAudioUploading] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
    // const ADMIN_TOKEN = import.meta.env.VITE_ADMIN_TOKEN || "";
    const ADMIN_TOKEN = localStorage.getItem("accessToken");

    useEffect(() => {
        fetchMediaDetail();
    }, []);

    const fetchMediaDetail = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`${API_URL}/media-groups/${media.MediaQuestionID}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${ADMIN_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch media detail: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                setMediaData(result.data);
                setFormMedia({
                    Title: result.data.Title,
                    Description: result.data.Description,
                    Difficulty: result.data.Difficulty,
                    Tags: result.data.Tags || [],
                    Media: result.data.Media
                });
                
                const questions = result.data.Questions || [];
                setFormQuestions(JSON.parse(JSON.stringify(questions)));
                setOriginalQuestions(JSON.parse(JSON.stringify(questions)));
            } else {
                throw new Error('API returned success: false');
            }
        } catch (err) {
            setError(err.message);
            console.error('Error fetching media detail:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (file) => {
        if (!file) return;
        
        setImageUploading(true);
        try {
            const formData = new FormData();
            formData.append('image', file); // Changed from 'file' to 'image'

            const response = await fetch(`${API_URL}/upload/image`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${ADMIN_TOKEN}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const result = await response.json();
            
            if (result.success) {
                setFormMedia(prev => ({
                    ...prev,
                    Media: { 
                        ...prev.Media, 
                        ImageUrl: result.data.url,
                        ImageFilename: result.data.filename
                    }
                }));
                setMediaUpdateStatus(null);
            } else {
                throw new Error(result.message || 'Upload failed');
            }
        } catch (err) {
            alert('Lỗi upload ảnh: ' + err.message);
            console.error('Image upload error:', err);
        } finally {
            setImageUploading(false);
        }
    };

    const handleAudioUpload = async (file) => {
        if (!file) return;
        
        setAudioUploading(true);
        try {
            const formData = new FormData();
            formData.append('audio', file); // Changed from 'file' to 'audio'

            const response = await fetch(`${API_URL}/upload/audio`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${ADMIN_TOKEN}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const result = await response.json();
            
            if (result.success) {
                setFormMedia(prev => ({
                    ...prev,
                    Media: { 
                        ...prev.Media, 
                        AudioUrl: result.data.url,
                        AudioFilename: result.data.filename
                    }
                }));
                setMediaUpdateStatus(null);
            } else {
                throw new Error(result.message || 'Upload failed');
            }
        } catch (err) {
            alert('Lỗi upload audio: ' + err.message);
            console.error('Audio upload error:', err);
        } finally {
            setAudioUploading(false);
        }
    };

    const getFilenameFromUrl = (url) => {
        if (!url) return null;
        const parts = url.split('/');
        return parts[parts.length - 1];
    };

    const handleDeleteFile = async (url, type) => {
        if (!url) return;
        
        const filename = getFilenameFromUrl(url);
        if (!filename) return;
        
        try {
            const response = await fetch(`${API_URL}/upload`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${ADMIN_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ filename })
            });

            if (!response.ok) {
                throw new Error('Delete failed');
            }

            if (type === 'image') {
                setFormMedia(prev => ({
                    ...prev,
                    Media: { ...prev.Media, ImageUrl: "", ImageFilename: "" }
                }));
            } else if (type === 'audio') {
                setFormMedia(prev => ({
                    ...prev,
                    Media: { ...prev.Media, AudioUrl: "", AudioFilename: "" }
                }));
            }
            setMediaUpdateStatus(null);
        } catch (err) {
            alert('Lỗi xóa file: ' + err.message);
            console.error('Delete file error:', err);
        }
    };

    const handleMediaChange = (field, value) => {
        setFormMedia(prev => ({ ...prev, [field]: value }));
        setMediaUpdateStatus(null);
    };

    const handleMediaFieldChange = (field, value) => {
        setFormMedia(prev => ({
            ...prev,
            Media: { ...prev.Media, [field]: value }
        }));
        setMediaUpdateStatus(null);
    };

    const handleQuestionChange = (index, field, value) => {
        setFormQuestions(prev => {
            const updated = [...prev];
            updated[index][field] = value;
            return updated;
        });
        setUpdateStatus(prev => ({ ...prev, [index]: null }));
    };

    const handleChoiceChange = (qIndex, cIndex, field, value) => {
        setFormQuestions(prev => {
            const updated = [...prev];
            updated[qIndex].Choices[cIndex][field] = value;

            if (field === "IsCorrect" && value) {
                updated[qIndex].Choices.forEach((ch, i) => {
                    ch.IsCorrect = i === cIndex;
                });
            }

            return updated;
        });
        setUpdateStatus(prev => ({ ...prev, [qIndex]: null }));
    };

    const isQuestionChanged = (index) => {
        const current = formQuestions[index];
        const original = originalQuestions[index];
        
        if (!current || !original) return false;
        
        if (current.QuestionText !== original.QuestionText) return true;
        
        if (current.Choices.length !== original.Choices.length) return true;
        
        for (let i = 0; i < current.Choices.length; i++) {
            if (current.Choices[i].Content !== original.Choices[i].Content ||
                current.Choices[i].IsCorrect !== original.Choices[i].IsCorrect) {
                return true;
            }
        }
        
        return false;
    };

    const handleUpdateQuestion = async (index) => {
        const question = formQuestions[index];
        
        try {
            setUpdateStatus(prev => ({ ...prev, [index]: 'loading' }));

            const response = await fetch(`${API_URL}/questions/${question.ID}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${ADMIN_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    QuestionText: question.QuestionText,
                    Choices: question.Choices.map(c => ({
                        Content: c.Content,
                        Attribute: c.Attribute,
                        IsCorrect: c.IsCorrect
                    }))
                })
            });

            if (!response.ok) {
                throw new Error('Update failed - Question may be in use');
            }

            const result = await response.json();
            
            if (result.success) {
                setUpdateStatus(prev => ({ ...prev, [index]: 'success' }));
                
                const updatedOriginal = [...originalQuestions];
                updatedOriginal[index] = JSON.parse(JSON.stringify(formQuestions[index]));
                setOriginalQuestions(updatedOriginal);
                
                setTimeout(() => {
                    setUpdateStatus(prev => ({ ...prev, [index]: null }));
                }, 3000);
            } else {
                throw new Error(result.message || 'Update failed');
            }
        } catch (err) {
            setUpdateStatus(prev => ({ 
                ...prev, 
                [index]: 'error',
                [`${index}_message`]: 'Cập nhật thất bại: Câu hỏi đã được sử dụng trong bài thi'
            }));
        }
    };

    const handleUpdateMedia = async () => {
        try {
            setMediaUpdateStatus('loading');

            // Build Media object with only valid fields
            const mediaPayload = {
                Skill: formMedia.Media.Skill,
                Type: formMedia.Media.Type,
                Section: formMedia.Media.Section
            };
            
            // Only add optional fields if they have valid values
            if (formMedia.Media.Script && formMedia.Media.Script.trim()) {
                mediaPayload.Script = formMedia.Media.Script.trim();
            }
            if (formMedia.Media.ImageUrl && formMedia.Media.ImageUrl.trim()) {
                mediaPayload.ImageUrl = formMedia.Media.ImageUrl.trim();
            }
            if (formMedia.Media.AudioUrl && formMedia.Media.AudioUrl.trim()) {
                mediaPayload.AudioUrl = formMedia.Media.AudioUrl.trim();
            }

            const response = await fetch(`${API_URL}/media-groups/${media.MediaQuestionID}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${ADMIN_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    Title: formMedia.Title,
                    Description: formMedia.Description,
                    Difficulty: formMedia.Difficulty,
                    Tags: formMedia.Tags,
                    Media: mediaPayload
                })
            });

            if (!response.ok) {
                throw new Error('Update failed');
            }

            const result = await response.json();
            
            if (result.success) {
                setMediaUpdateStatus('success');
                setTimeout(() => {
                    setMediaUpdateStatus(null);
                }, 3000);
            } else {
                throw new Error(result.message || 'Update failed');
            }
        } catch (err) {
            setMediaUpdateStatus('error');
            console.error('Error updating media:', err);
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-8 rounded-2xl shadow-2xl">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 text-center">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-red-800 text-center mb-2">Lỗi</h3>
                    <p className="text-red-600 text-center mb-4">{error}</p>
                    <button 
                        onClick={onClose}
                        className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-2xl shadow-2xl relative ring-1 ring-gray-200 flex flex-col overflow-hidden">
                
                {/* HEADER */}
                <div className="sticky top-0 bg-white z-10 p-6 border-b text-center relative">
                    <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-700">
                        Chỉnh sửa Media #{media.MediaQuestionID}
                    </h2>
                    <button
                        onClick={onClose}
                        className="absolute top-1/2 right-6 -translate-y-1/2 text-gray-600 hover:text-black transition-colors duration-200"
                    >
                        <X size={32} />
                    </button>
                </div>

                <div className="overflow-y-auto p-8 flex-1">
                    
                    {/* MEDIA SECTION */}
                    <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-xl shadow-inner mb-10 ring-1 ring-blue-200">
                        <h3 className="text-xl font-semibold mb-6 flex items-center gap-3 text-gray-800">
                            <Image size={24} className="text-blue-600" /> Thông tin Media
                        </h3>

                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="font-semibold text-gray-700 mb-2 block">Tiêu đề</label>
                                <input
                                    type="text"
                                    value={formMedia?.Title || ''}
                                    onChange={(e) => handleMediaChange("Title", e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                                />
                            </div>

                            <div>
                                <label className="font-semibold text-gray-700 mb-2 block">Mô tả</label>
                                <textarea
                                    rows={2}
                                    value={formMedia?.Description || ''}
                                    onChange={(e) => handleMediaChange("Description", e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                                />
                            </div>

                            <div>
                                <label className="font-semibold text-gray-700 mb-2 block">Độ khó</label>
                                <select
                                    value={formMedia?.Difficulty || 'EASY'}
                                    onChange={(e) => handleMediaChange("Difficulty", e.target.value)}
                                    className="w-48 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                                >
                                    <option value="EASY">Dễ</option>
                                    <option value="MEDIUM">Trung bình</option>
                                    <option value="HARD">Khó</option>
                                </select>
                            </div>

                            {/* IMAGE SECTION */}
                            <div>
                                <label className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                    <Image size={16} /> Image URL
                                </label>
                                <input
                                    type="text"
                                    value={formMedia?.Media?.ImageUrl || ''}
                                    onChange={(e) => handleMediaFieldChange("ImageUrl", e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 mb-3"
                                />
                                
                                <label className={`flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-all ${imageUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                    {imageUploading ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            <span className="text-sm text-gray-600">Đang tải lên...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Upload size={16} />
                                            <span className="text-sm text-gray-600">📁 Tải ảnh mới lên</span>
                                        </>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        disabled={imageUploading}
                                        onChange={(e) => {
                                            if (e.target.files[0]) {
                                                handleImageUpload(e.target.files[0]);
                                            }
                                        }}
                                        className="hidden"
                                    />
                                </label>

                                {formMedia?.Media?.ImageUrl && (
                                    <div className="mt-3 relative group">
                                        <img
                                            src={formMedia.Media.ImageUrl}
                                            alt="Preview"
                                            className="w-full h-48 object-cover rounded-xl shadow-md"
                                        />
                                        <button
                                            onClick={() => handleDeleteFile(formMedia.Media.ImageUrl, 'image')}
                                            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* AUDIO SECTION */}
                            <div>
                                <label className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                    <Volume2 size={16} /> Audio URL
                                </label>
                                <input
                                    type="text"
                                    value={formMedia?.Media?.AudioUrl || ''}
                                    onChange={(e) => handleMediaFieldChange("AudioUrl", e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 mb-3"
                                />
                                
                                <label className={`flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-all ${audioUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                    {audioUploading ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            <span className="text-sm text-gray-600">Đang tải lên...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Upload size={16} />
                                            <span className="text-sm text-gray-600">🎵 Tải audio mới lên</span>
                                        </>
                                    )}
                                    <input
                                        type="file"
                                        accept="audio/*"
                                        disabled={audioUploading}
                                        onChange={(e) => {
                                            if (e.target.files[0]) {
                                                handleAudioUpload(e.target.files[0]);
                                            }
                                        }}
                                        className="hidden"
                                    />
                                </label>

                                {formMedia?.Media?.AudioUrl && (
                                    <div className="mt-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
                                        <audio controls src={formMedia.Media.AudioUrl} className="w-full" />
                                        <button
                                            onClick={() => handleDeleteFile(formMedia.Media.AudioUrl, 'audio')}
                                            className="mt-2 text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                                        >
                                            <Trash2 size={14} />
                                            Xóa audio
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="font-semibold text-gray-700 mb-2 block">Script</label>
                                <textarea
                                    rows={4}
                                    value={formMedia?.Media?.Script || ''}
                                    onChange={(e) => handleMediaFieldChange("Script", e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                onClick={handleUpdateMedia}
                                disabled={mediaUpdateStatus === 'loading'}
                                className={`px-6 py-3 rounded-xl font-semibold shadow-lg flex items-center gap-2 ${
                                    mediaUpdateStatus === 'success' 
                                        ? 'bg-green-600 text-white'
                                        : mediaUpdateStatus === 'error'
                                        ? 'bg-red-600 text-white'
                                        : mediaUpdateStatus === 'loading'
                                        ? 'bg-gray-400 text-white cursor-not-allowed'
                                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
                                }`}
                            >
                                {mediaUpdateStatus === 'loading' ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Đang cập nhật...
                                    </>
                                ) : mediaUpdateStatus === 'success' ? (
                                    <>
                                        <CheckCircle className="w-4 h-4" />
                                        Đã cập nhật
                                    </>
                                ) : mediaUpdateStatus === 'error' ? (
                                    <>
                                        <AlertCircle className="w-4 h-4" />
                                        Cập nhật thất bại
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Cập nhật Media
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* QUESTIONS SECTION */}
                    <h3 className="text-2xl font-semibold mb-6 text-gray-800">Câu hỏi & Đáp án</h3>

                    <div className="space-y-8">
                        {formQuestions.map((q, qIndex) => (
                            <div key={q.ID} className="bg-white border border-gray-200 rounded-xl p-6 shadow-md">
                                
                                <div className="flex justify-between items-start mb-4">
                                    <h4 className="font-semibold text-lg text-gray-800">
                                        Câu hỏi {q.OrderInGroup}
                                    </h4>
                                    
                                    {isQuestionChanged(qIndex) && (
                                        <button
                                            onClick={() => handleUpdateQuestion(qIndex)}
                                            disabled={updateStatus[qIndex] === 'loading'}
                                            className={`px-4 py-2 rounded-lg font-medium shadow-md flex items-center gap-2 ${
                                                updateStatus[qIndex] === 'success'
                                                    ? 'bg-green-600 text-white'
                                                    : updateStatus[qIndex] === 'error'
                                                    ? 'bg-red-600 text-white'
                                                    : updateStatus[qIndex] === 'loading'
                                                    ? 'bg-gray-400 text-white cursor-not-allowed'
                                                    : 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800'
                                            }`}
                                        >
                                            {updateStatus[qIndex] === 'loading' ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                    Đang lưu...
                                                </>
                                            ) : updateStatus[qIndex] === 'success' ? (
                                                <>
                                                    <CheckCircle className="w-4 h-4" />
                                                    Đã lưu
                                                </>
                                            ) : updateStatus[qIndex] === 'error' ? (
                                                <>
                                                    <AlertCircle className="w-4 h-4" />
                                                    Thất bại
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="w-4 h-4" />
                                                    Cập nhật
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>

                                {updateStatus[qIndex] === 'error' && updateStatus[`${qIndex}_message`] && (
                                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                        {updateStatus[`${qIndex}_message`]}
                                    </div>
                                )}

                                <textarea
                                    rows={3}
                                    value={q.QuestionText}
                                    onChange={(e) => handleQuestionChange(qIndex, "QuestionText", e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 mb-4"
                                />

                                <p className="mt-4 font-semibold text-gray-700 mb-3">Đáp án:</p>

                                <div className="space-y-3">
                                    {q.Choices.map((c, cIndex) => (
                                        <div
                                            key={c.ID}
                                            className={`p-4 rounded-lg border-2 transition-all ${
                                                c.IsCorrect
                                                    ? "bg-green-50 border-green-400"
                                                    : "bg-gray-50 border-gray-300"
                                            }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <span className="font-bold text-gray-800 text-lg">
                                                    {c.Attribute}.
                                                </span>

                                                <input
                                                    type="text"
                                                    value={c.Content}
                                                    onChange={(e) =>
                                                        handleChoiceChange(qIndex, cIndex, "Content", e.target.value)
                                                    }
                                                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                                                />

                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name={`correct-${q.ID}`}
                                                        checked={c.IsCorrect}
                                                        onChange={() =>
                                                            handleChoiceChange(qIndex, cIndex, "IsCorrect", true)
                                                        }
                                                        className="w-5 h-5 accent-green-600"
                                                    />
                                                    <span className="text-sm font-medium text-gray-700">Đúng</span>
                                                </label>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* CLOSE BUTTON */}
                    <div className="flex justify-end gap-4 mt-10">
                        <button
                            onClick={onClose}
                            className="px-6 py-3 rounded-xl bg-gray-300 hover:bg-gray-400 transition-all duration-300 font-semibold shadow-md hover:shadow-lg flex items-center gap-2"
                        >
                            <RotateCcw className="w-4 h-4" />
                            Đóng
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}