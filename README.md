# Web viewer for 360 images
[![Build Status](https://dev.azure.com/rtuitlab/RTU%20IT%20Lab/_apis/build/status/Excursion360-Web?branchName=master)](https://dev.azure.com/rtuitlab/RTU%20IT%20Lab/_build/latest?definitionId=147&branchName=master)

# Archived until the next sprint

## How to start

* Install Node.JS, npm

* Install packages
```bash
npm i
```

* Create file ```.env.local```
```env
CONFIG_FILE_PATH=path to configuration file, config.json by default
NEED_DEBUG_LAYER=[false|true]
```
* Create file ```build/config.json```
```json
{
    "sceneUrl": "URL of excursion folder",
    "logoUrl": "LOGO for state change"
}
```
* Run command ```npm install``` in project folder
* Run command ```npm start``` in project folder
* Open in browser [https://localhost:8088](https://localhost:8088/), https is required for correct work WebXR.


## Tips

* Use `build` directory to place excursion build(already gitignore).
* Fill `sceneUrl` of `build/config.json` to folder name of excursion.
