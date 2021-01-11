import React, { Component } from 'react';
import ContentTree from '../editor/content-tree/ContentTree';
import SceneInspector from '../editor/scene-inspector/SceneInspector';
import Scene from '../editor/scene/Scene';
import Toolbar from '../editor/toolbar/Toolbar';
import LogsViewer from '../logs-viewer/LogsViewer';
import './AppEditorLayout.scss';

class div extends Component {
    render() {
        return (
            <div className="container">
                <div className="scene">
                    <Scene />
                </div>
                <div className="toolbar">
                    <Toolbar />
                </div>
                <div className="contentTree">
                    <ContentTree />
                </div>
                <div className="logsViewer">
                    <LogsViewer />
                </div>
                <div className="sceneInspector">
                    <SceneInspector />
                </div>
            </div>
        );
    }
}

export default div