import makeDownloadFileName from "../makeDownloadFileName";

describe(makeDownloadFileName.name, () => {
  it("returns the original filename when no metadata (from update cdn)", () => {
    const fileName = makeDownloadFileName(
      "app-1.0.0-build-231113r6n9icu7f.AppImage",
      {}
    );
    expect(fileName).toEqual("app-1.0.0-build-231113r6n9icu7f.AppImage");
  });

  describe("removes build id when no build specified", () => {
    it("for AppImage", () => {
      const fileName = makeDownloadFileName(
        "app-1.0.0-build-231113r6n9icu7f.AppImage",
        { downloadType: "download" }
      );
      expect(fileName).toEqual("app-1.0.0.AppImage");
    });

    it("for dmg", () => {
      const fileName = makeDownloadFileName(
        "App 1.0.0 - Build 231113r6n9icu7f-arm64.dmg",
        { downloadType: "download" }
      );
      expect(fileName).toEqual("App 1.0.0 - arm64.dmg");
    });

    it("for zip", () => {
      const fileName = makeDownloadFileName(
        "App 1.0.0 - Build 231113r6n9icu7f-x64-mac.zip",
        { downloadType: "download" }
      );
      expect(fileName).toEqual("App 1.0.0 - x64-mac.zip");
    });

    it("for exe", () => {
      const fileName = makeDownloadFileName(
        "App Setup 1.0.0 - Build 231113r6n9icu7f-x64.exe",
        { downloadType: "download" }
      );
      expect(fileName).toEqual("App Setup 1.0.0 - x64.exe");
    });
  });
});
