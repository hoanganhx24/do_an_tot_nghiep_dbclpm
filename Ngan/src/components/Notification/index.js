export const openNotification = (api,placement, mess, des) => {
    api.info({
      message: mess,
      description: des,
      placement,
    });
  };