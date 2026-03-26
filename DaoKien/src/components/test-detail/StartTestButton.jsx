export default function StartTestButton({ onStart }) {
    return (
        <div className="text-center mt-8 mb-12">
            <button
                onClick={onStart}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-10 py-4 rounded-2xl"
            >
                🚀 Bắt đầu làm bài
            </button>
        </div>
    );
}
