const os = require("os");

function inferPlatform() {
  const platform = os.platform();
  if (
    platform === "darwin" ||
    platform === "mas" ||
    platform === "win32" ||
    platform === "linux"
  ) {
    return platform;
  }

  throw new Error(`Untested platform ${platform} detected`);
}

module.exports = inferPlatform;
