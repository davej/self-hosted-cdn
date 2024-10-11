export default function makeDownloadFileName(
  objectName: string,
  meta?: { downloadType?: string }
): string {
  const fileName = objectName.split("/").pop();

  if (meta?.downloadType === "download") {
    return removeBuildIdFromFileName(fileName);
  }
  return fileName;
}

function removeBuildIdFromFileName(fileName: string) {
  if (fileName.includes("-build-")) {
    return fileName.replace(/-build-\w+-?/, "");
  } else {
    return fileName.replace(/Build \w+-/, "");
  }
}
