const fs = require('fs');

const webXRBaseRepositoryUrl =
  "https://immersive-web.github.io/webxr-input-profiles/packages/viewer/dist";

const inBuild = (path) => `./build/xrrepo/profiles/${path}`;

(async () => {
  const response = await fetch(
    `${webXRBaseRepositoryUrl}/profiles/profilesList.json`
  );
  const jsonProfiles = await response.json();
  console.log(jsonProfiles);

  for (const profileKey in jsonProfiles) {
    console.log(profileKey);
    const profileWebPath = jsonProfiles[profileKey].path;
    const folderFile = profileWebPath.split("/");
    if (folderFile.length !== 2) {
      throw new Error(
        `В пути к профилю не два элемента пути ${profileKey}: ${JSON.stringify(
          jsonProfiles[profileKey]
        )}`
      );
    }
    const folder = folderFile[0];
    const file = folderFile[1];
    if (!fs.existsSync(inBuild(folder))) {
      fs.mkdirSync(inBuild(folder));
    }
    const profileContent = await fetch(
      `${webXRBaseRepositoryUrl}/profiles/${profileWebPath}`
    );
    const profileJson = await profileContent.json();
    for (const layout of Object.values(profileJson.layouts)) {
      const layoutAssetPath = layout.assetPath;
      const layoutAssetContent = await fetch(
        `${webXRBaseRepositoryUrl}/profiles/${folder}/${layoutAssetPath}`
      );
      const layoutAssetArrayBuffer = await layoutAssetContent.arrayBuffer();
      fs.writeFileSync(
        inBuild(`${folder}/${layoutAssetPath}`),
        Buffer.from(layoutAssetArrayBuffer)
      );
    }
    fs.writeFileSync(inBuild(`${folder}/${file}`), JSON.stringify(profileJson));
  }
  fs.writeFileSync(inBuild('profilesList.json'), JSON.stringify(jsonProfiles));
})();
