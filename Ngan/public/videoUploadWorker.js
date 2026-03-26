self.onmessage = async (e) => {
  const { file, chunkSize, uploadUrl, completeUrl, fileId, fileName } = e.data;

  if (!file) {
    self.postMessage({ type: "error", message: "No file received" });
    return;
  }

  try {
    const totalChunks = Math.ceil(file.size / chunkSize);
    let offset = 0;
    let index = 0;

    // Upload từng chunk
    while (offset < file.size) {
      const chunk = file.slice(offset, offset + chunkSize);

      const formData = new FormData();
      formData.append("fileId", fileId);
      formData.append("chunkIndex", index);
      formData.append("chunk", chunk);

      await fetch(uploadUrl, {
        method: "POST",
        body: formData,
      });

      offset += chunkSize;
      index++;

      const progress = Math.round((index / totalChunks) * 100);

      self.postMessage({
        type: "progress",
        progress,
        currentChunk: index,
        totalChunks,
      });
    }

    // Merge file
    const mergeForm = new FormData();
    mergeForm.append("fileId", fileId);
    mergeForm.append("totalChunks", totalChunks);
    mergeForm.append("fileName", fileName);

    const response = await fetch(completeUrl, {
      method: "POST",
      body: mergeForm,
    });

    const result = await response.json(); // ✔ FIXED: response.json(), không phải res.json()
    if (result.code === 200) {
      self.postMessage({
        type: "done",
        videoPath: result.data, // đường dẫn backend trả về
      });
    } else {
      self.postMessage({
        type: "error",
        message: "Upload error",
      });
    }
  } catch (err) {
    self.postMessage({
      type: "error",
      message: err?.message || "Upload error",
    });
  }
};
