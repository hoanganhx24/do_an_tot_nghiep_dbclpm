export default function TimeSetting({ customTime, setCustomTime, maxTime }) {
    return (
        <div className="bg-white shadow-xl rounded-2xl p-8 mb-8">
            <h2 className="text-xl font-bold mb-6">Cài đặt thời gian làm bài</h2>

            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <label className="block mb-3 font-semibold">Thời gian làm bài (phút):</label>

                <input
                    type="number"
                    min="5"
                    max={maxTime}
                    value={customTime}
                    onChange={(e) => setCustomTime(Number(e.target.value))}
                    className="border rounded-lg p-3 w-40 text-center"
                />

                <p className="text-sm text-gray-600 mt-3">(Tối đa {maxTime} phút)</p>
            </div>
        </div>
    );
}
