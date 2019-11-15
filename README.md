# Web viewer for 360 images
|master|develop|
---|---
|[![Build status](https://dev.azure.com/rtuitlab/ITLab/_apis/build/status/Excursion360-master)](https://dev.azure.com/rtuitlab/ITLab/_build/latest?definitionId=31)|

## How to start

* Install Node.JS, npm

* Create file ```.env.local```
```env
CONFIG_FILE_PATH=path to configuration file, config.json by default
NEED_DEBUG_LAYER=[false|true]
```
* Create file ```build/config.json```
```json
{
    "sceneURL": "URL of excursion folder",
    "logoUrl": "LOGO for state change",
    "viveControllerModelBaseUrl": "URL to vive controllers"
}
```
* Run command ```npm install``` in project folder
* Run command ```npm start``` in project folder
* Open in browser [localhost:8088](http://localhost:8088/)
