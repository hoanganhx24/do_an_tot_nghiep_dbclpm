import { useEffect, useRef, useState } from "react";
import { getLessonAdminTeacher } from "../../../services/CourseService";
import { refreshToken, saveToken } from "../../../services/AuthService";
import { API_DOMAIN } from "../../../utils/request";

function Document({ lessonId }) {
  const [videoUrl, setVideoUrl] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);

  const videoRef = useRef(null); 
  const currentVideoPath = useRef(null);

  // ========================
  // GỌI RANGE CHUNK GIỐNG CODE BẠN GỬI
  // ========================
  const fetchNextRangeChunk = () => {
    if (!currentVideoPath.current) return;

    const VIDEO_URL =
      API_DOMAIN +
      "videos/stream?pathFile=" +
      currentVideoPath.current;

    // Ví dụ: Request từ 2MB trở đi
    fetch(VIDEO_URL, {
      method: "GET",
      headers: {
        Range: "bytes=2000000-"
      }
    })
      .then((res) => {
        console.log(
          "📦 Received partial content:",
          res.status,
          res.headers.get("Content-Range")
        );
        return res.arrayBuffer();
      })
      .then((data) => {
        console.log("📦 Received chunk size:", data.byteLength, "bytes");
      })
      .catch((err) => {
        console.error("❌ Error fetching chunk:", err);
      });
  };

  // ========================
  // VIDEO EVENT
  // ========================
  const setupVideoEvents = () => {
    const video = videoRef.current;
    if (!video) return;

    video.addEventListener("timeupdate", () => {
      const current = video.currentTime;
      const total = video.duration;

      if (!total || total === Infinity) return; // duration chưa load

      const percent = (current / total) * 100;

      if (percent > 95) {
        console.log("⏳ Almost done → Request next chunk");
        fetchNextRangeChunk();
      }
    });
  };

  // ========================
  // FETCH LESSON
  // ========================
  const fetchApiGetLesson = async () => {
    const response = await getLessonAdminTeacher(lessonId);

    if (response.code === 200) {
      const data = response.data;

      console.log("📚 Lesson:", data);

      // LƯU PATH
      currentVideoPath.current = data.videoPath;

      // VIDEO URL = VIDEO STREAM DIRECT
      const fullUrl =
        API_DOMAIN +
        "videos/stream?pathFile=" +
        data.videoPath;

      setVideoUrl(fullUrl);

      // PDF
      if (data.materials?.length > 0) {
        const m = data.materials[0];
        const bin = atob(m.materialData);
        const arr = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
        const pdfBlob = new Blob([arr], { type: m.type });
        setPdfUrl(URL.createObjectURL(pdfBlob));
      }
    }else if (response.code === 401) {
      const refresh = await refreshToken();
      if (refresh.code === 200) {
        saveToken(refresh.data.token, refresh.data.refreshToken);
      }
    }
  };

  useEffect(() => {
    fetchApiGetLesson();
  }, [lessonId]);

  useEffect(() => {
    if (videoUrl) {
      setTimeout(() => setupVideoEvents(), 200);
    }
  }, [videoUrl]);

  return (
    <>
      {videoUrl && (
        <div style={{ marginTop: "10px" }}>
          <h4>Video giảng dạy:</h4>
          <video
            ref={videoRef}
            src={videoUrl}
            width="100%"
            height="400"
            controls
            style={{ background: "black" }}
          ></video>
        </div>
      )}

      {pdfUrl && (
        <div style={{ marginTop: "15px" }}>
          <h4>Tài liệu:</h4>
          <iframe
            src={pdfUrl}
            width="100%"
            height="600"
            style={{ border: "1px solid #ccc" }}
          ></iframe>
        </div>
      )}
    </>
  );
}

export default Document;
