import React from 'react';
import { connect } from "react-redux";

import { ExcursionScene } from '../../../models/ExcursionScene';
import { ExcursionVector3 } from '../../../models/ExcursionVector3';
import { createScene } from "../../../redux/actions";
import { RootState } from '../../../redux/rootReducer';
import { CreateSceneAction } from '../../../redux/types';
interface ContentTreeProps {
    createScene: (scene: ExcursionScene) => CreateSceneAction,
    scenes: ExcursionScene[]    
}
class ContentTree extends React.Component<ContentTreeProps> {

    addScene(event: any) {
        this.props.createScene(
            new ExcursionScene(
                Date.now().toString(),
                "scene",
                new ExcursionVector3(this.props.scenes.length, 0, this.props.scenes.length)
            )
        );
    }
    render() {
        return (
            <div>
                <p>Content tree</p>
                <button onClick={e => this.addScene(e)} >Add scene</button>
            </div>
        );
    }
}
const mapStateToProps = (state: RootState) => {
    return state.scenes;
}
const mapDispatchToProps = {
    createScene
}
export default connect(mapStateToProps, mapDispatchToProps)(ContentTree);