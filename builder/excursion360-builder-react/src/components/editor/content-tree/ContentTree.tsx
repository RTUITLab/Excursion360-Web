import React from 'react';
import { connect } from "react-redux";
import './ContentTree.scss';

import { ExcursionScene } from '../../../models/ExcursionScene';
import { ExcursionVector3 } from '../../../models/ExcursionVector3';
import { createScene } from "../../../redux/actions";
import { RootState } from '../../../redux/rootReducer';
import { CreateSceneAction } from '../../../redux/types';
interface ContentTreeProps {
    createScene: (scene: ExcursionScene) => CreateSceneAction,
    scenes: ExcursionScene[],
    selectedSceneIds: string[]
}
class ContentTree extends React.Component<ContentTreeProps> {
    indexer = 0;
    addScene(event: any) {
        this.props.createScene(
            new ExcursionScene(
                Date.now().toString(),
                `scene ${this.indexer++}`,
                new ExcursionVector3(this.props.scenes.length, 0, this.props.scenes.length)
            )
        );
    }
    render() {
        return (
            <div>
                <p>Content tree</p>
                <button onClick={e => this.addScene(e)} >Add scene</button>
                <ul className="objectsList">
                    {this.props.scenes && this.props.scenes.map(s =>
                        <li key={s.id}>
                            <p>{s.title}</p>
                            <p>{this.props.selectedSceneIds.includes(s.id) + ""}</p>
                            <input type="checkbox" checked={this.props.selectedSceneIds.includes(s.id)}/>
                        </li>
                    )}
                </ul>
            </div>
        );
    }
}
const mapStateToProps = (state: RootState) => {
    return { scenes: state.editor.scenes, selectedSceneIds: state.editor.selectedSceneIds };
}
const mapDispatchToProps = {
    createScene
}
export default connect(mapStateToProps, mapDispatchToProps)(ContentTree);