# Инструмент для отображения экскурсий в формате 360
[![Build Status](https://dev.azure.com/rtuitlab/RTU%20IT%20Lab/_apis/build/status/RTUITLab.Excursion360-Web?branchName=master)](https://dev.azure.com/rtuitlab/RTU%20IT%20Lab/_build/latest?definitionId=203&branchName=master)

## Как начать работу

* Установить Node.JS(гарантированно работает на версии 20.7.0), npm

* Установить зависимости
```bash
npm i
```

* Создать файл ```.env.local```
```env
CONFIG_FILE_PATH=путь к файлу конфигурации, config.json по умолчанию
NEED_DEBUG_LAYER=[false|true] нужна ли логика отображения инспектора
```
* Создать файл `build/config.json`, на него как раз ссылались в файле выше
```json
{
    "sceneUrl": "веб адрес размещенной экскурсии",
    "logoUrl": "Путь к логотипу, который будет показан при загрузке ресурсов",
    "forceInputProfileWebXr": "профиль для отображаемых контроллеров"
}
```
> Список рабочих профилей можно найти в папке `build/xrrepo/profiles`. Например можно написать `pico-4`.
* Запустите проект
```bash
npm start
```
* Перейдите по ссылке [https://localhost:8088](https://localhost:8088/), https необходим для корректной работы WebXR.

## VR
Проверена работа в:
* Pico 4
### Управление
* `a-button`/`xr-standard-squeeze`(хватание): остановка/воспроизведение фоновой музыки
* `b-button`/`xr-standard-touchpad`(тачпад): возврат к первой сцене экскурсии, если включен флаг `fastReturnToFirstStateEnabled`
* `x-button`: выполнение `window.history.back()` для возврата к прошлой сцене

### Обновление 3D моделей для WebXR
Проект использует собственную сборку профилей для WebXR устройств, для возможности запуска без использования интернета. Для обновления моделей/профилей выполните команду

```bash
node ./scripts/downloadWebXrProfiles.js
```

## Советы

* Используйте папку `build` для размешения сборки экскурсии при отладке(её содержимое уже в gitignore). Так, можно положить сборку в папку `build/excursion` и в поле `sceneUrl` файла `build/config.json` указать просто `excursion`.
