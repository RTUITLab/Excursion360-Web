import { Vector3, Color3, Mesh, GroundMesh } from '@babylonjs/core';
import { GridMaterial } from '@babylonjs/materials';
import React, { useRef, useState, Component } from 'react'
import { Engine, Scene, useBeforeRender, useClick, useHover } from 'react-babylonjs';
import { connect } from 'react-redux';


import { ExcursionScene } from '../../../models/ExcursionScene';
import { RootState } from '../../../redux/rootReducer';
import './EditorScene.scss';

interface SceneProps {
    scenes: ExcursionScene[] | null
}
class EditorScene extends React.Component<SceneProps> {
    public static defaultProps = {
        scenes: []
    };
    private gridMaterialCache: GridMaterial | null = null;
    groundRefFunc(instance: any) {
        if (!instance) {
            return;
        }
        if (!this.gridMaterialCache) {
            const gridMaterial = new GridMaterial("ground_material", instance._scene);
            gridMaterial.mainColor = Color3.White();
            gridMaterial.lineColor = Color3.Black();
            gridMaterial.opacity = 0.8;
            gridMaterial.sideOrientation = Mesh.DOUBLESIDE; // TODO fix double side grid
            this.gridMaterialCache = gridMaterial;
        }
        instance.material = this.gridMaterialCache;
    }

    render() {
        const { scenes } = this.props;
        return (
            <Engine antialias adaptToDeviceRatio canvasId='editor-scene-canvas' >
                <Scene>
                    <arcRotateCamera keysUp={["w".charCodeAt(0)]} name="camera1" target={Vector3.Zero()} alpha={Math.PI / 2} beta={Math.PI / 4} radius={8} />
                    <hemisphericLight name='light1' intensity={0.7} direction={Vector3.Up()} />
                    {scenes && scenes.map(s =>
                        <box name="box" key={s.id} position={new Vector3(s.position.x, s.position.y, s.position.z)}>

                        </box>
                    )}
                    {
                        // TODO fix double side grid
                        [{ rotation: 0, id: "top" }, { rotation: Math.PI, id: "bottom" }].map(i =>
                            <ground
                                ref={i => this.groundRefFunc(i)}
                                name={`base_ground_${i.id}`}
                                width={50}
                                height={50}
                                subdivisions={2}
                                rotation={new Vector3(0, 0,i.rotation)}
                                receiveShadows={true}
                                key={i.id}>
                            </ground>
                        )
                    }
                </Scene>
            </Engine>
        );
    }
}

const mapStateToProps = (state: RootState) => {
    return state.scenes;
}

export default connect(mapStateToProps, null)(EditorScene);