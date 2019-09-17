const readLine = require("./utils/read-line");
const writeFile = require("./utils/write-file");
const infer = require("./infer");
const fsExtra = require("fs-extra");
const path = require("path");
const shell = require("shelljs");

const stringsXmlPath = "./src/android-app/app/src/main/res/values/strings.xml";
const iconsPath = "./android-app/app/src/main/res/";
const iconFileName = `${iconsPath}/mipmap/ic_launcher.png`;
const roundIconFileName = `${iconsPath}/mipmap/ic_launcher_round.png`;
const builtUnsignedAppPath =
  "./android-app/app/build/outputs/apk/debug/app-debug.apk";
const gradlePropertiesFilePath = "./src/android-app/gradle.properties";

let appInfo;

const stringsXmlContent = (appName, siteUrl) =>
  `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">${appName}</string>
    <string name="app_url">${siteUrl}</string>
</resources>`;

const gradleProperties = appName =>
  `org.gradle.jvmargs=-Xmx1536m
  android.useAndroidX=true
  android.enableJetifier=true
  packageId=com.codemonk_labs.${appName.toLowerCase()}`;

function buildUnsignedApp() {
  const platform = infer.inferOs();
  switch (platform) {
    case "darwin":
    case "linux":
      return "./gradlew assembleDebug";
    case "win32":
      return "gradlew assembleDebug";
    default:
      throw new Error(`Error: Unknown platform ${platform}`);
  }
}

async function initializeAppInfo() {
  const appName = await readLine("Name of your android application: ");
  const siteUrl = await readLine(
    "(Please specify correct url with http:// or https://) \nWebsite url: "
  );
  return Promise.resolve({ appName, siteUrl });
}

async function assignNameAndUrl() {
  const { appName, siteUrl } = appInfo;
  try {
    await writeFile(stringsXmlPath, stringsXmlContent(appName, siteUrl));
  } catch (e) {
    console.log(e);
  }
}

async function assignPackageId() {
  const { appName } = appInfo;
  try {
    await writeFile(gradlePropertiesFilePath, gradleProperties(appName));
  } catch (e) {
    console.log(e);
  }
}

function assignIcon() {
  const { siteUrl } = appInfo;
  return new Promise(async (resolve, reject) => {
    const icon = await infer.inferIcon(siteUrl);
    try {
      fsExtra.copySync(icon, path.resolve(__dirname, iconFileName));
      fsExtra.copySync(icon, path.resolve(__dirname, roundIconFileName));
      resolve();
    } catch (e) {
      reject(e);
    }
  });
}


function clearOutputFolder() {
  const outputPath = path.resolve(__dirname, '../output/');
  fsExtra.emptyDirSync(outputPath);
}

async function buildApp() {
  shell.cd("src/android-app");
  const { appName } = appInfo;
  // TODO: generate Signed apk
  // const signApp = await readLine("Do you want to sign this app? (y/N): ");
  // if (signApp.toLowerCase() !== "y") {    
  shell.exec(buildUnsignedApp());
  fsExtra.copySync(
    path.resolve(__dirname, builtUnsignedAppPath),
    path.resolve(__dirname, `../output/${appName}.apk`)
  );
  // } else {
  // TODO: shell.exec(buildSignedApp());
  // }
}

initializeAppInfo().then(app => {
  appInfo = app;
  clearOutputFolder();
  Promise.all([assignNameAndUrl(), assignPackageId()]).then(
    buildApp
  );
});
