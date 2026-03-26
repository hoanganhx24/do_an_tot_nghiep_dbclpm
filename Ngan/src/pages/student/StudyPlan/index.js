import { useEffect, useState } from "react";
import CreateStudyPlan from "./CreateStudyPlan";
import DetailStudyPlan from "./DetailStudyPlan";
import { checkExitPlanStudy } from "../../../services/StudyPlanService";
import { refreshToken, saveToken } from "../../../services/AuthService";
import { notification } from "antd";
import { openNotification } from "../../../components/Notification";
import { logout } from "../../../components/function";

function StudyPlan() {
  const [plan, setPlan] = useState();
  const [trackId, setTrackId] = useState();
  const [api, context] = notification.useNotification();
  const checkExitPlan = async () => {
    const response = await checkExitPlanStudy();
    console.log(response);
    if (response.code === 200) {
      setPlan(true);
      setTrackId(response.data);
    } else if (response.code === 401) {
      const refresh = await refreshToken();
      if (refresh.code === 200) {
        saveToken(refresh.data.token, refresh.data.refreshToken);
        const retryResponse = await checkExitPlanStudy();
        if (retryResponse.code === 200) {
          setPlan(true);
          setTrackId(retryResponse.data);
        } else {
          openNotification(api, "bottomRight", "Lỗi", retryResponse.message);
        }
      } else {
        openNotification(
          api,
          "bottomRight",
          "Cảnh báo",
          "Phiên đăng nhập của bạn đã hết hạn"
        );
        setTimeout(() => {
          logout();
        }, 1000);
      }
    }
  };

  const handleCreated = async () => {
    await checkExitPlan();
  };

  useEffect(() => {
    checkExitPlan();
  }, []);
  return (
    <>
      {context}
      {!plan ? (
        <CreateStudyPlan setPlan={setPlan} onCreated={handleCreated}/>
      ) : (
        <DetailStudyPlan setPlan={setPlan} trackId={trackId} />
      )}
    </>
  );
}
export default StudyPlan;
