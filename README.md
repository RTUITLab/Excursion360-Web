# Web viewer for 360 images
|master|develop|
---|---
|[![Build status](https://dev.azure.com/rtuitlab/ITLab/_apis/build/status/Excursion360-master)](https://dev.azure.com/rtuitlab/ITLab/_build/latest?definitionId=31)|

## How to start

* Install Node.JS, npm

* Create file ```.env.local``` 
```
SCENE_URL=url to your scene description
LOGO_URL=url to logo for show on loading
VIVE_CONTROLLER_MODEL_BASE_URL=url to path with htc vive controller model and textures
```
* Run command ```npm install``` in project folder
* Run command ```npm start``` in project folder
* Open in browser [localhost:8088](http://localhost:8088/)
