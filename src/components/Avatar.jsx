import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useGraph, useLoader } from '@react-three/fiber'
import { useFrame } from '@react-three/fiber'
import { useAnimations, useFBX, useGLTF } from '@react-three/drei'
import { SkeletonUtils } from 'three-stdlib'
import { useControls } from 'leva'
import * as THREE from 'three'
import { NodeShaderStage } from 'three/examples/jsm/nodes/Nodes'


const corresponding = {
    A: "viseme_PP",
    B: "viseme_kk",
    C: "viseme_I",
    D: "viseme_AA",
    E: "viseme_O",
    F: "viseme_U",
    G: "viseme_FF",
    H: "viseme_TH",
    X: "viseme_PP",
};

export function Avatar(props) {

    const { playAudio, script } = useControls({
        playAudio: false,
        script: { value: "Gorsuch", options: ["Gorsuch"] },
    });

    const audio = useMemo(() => new Audio(`Audios/${script}.mp3`), [script]);
    const jsonFile = useLoader(THREE.FileLoader, `/Audios/${script}.json`);
    const lipsync = JSON.parse(jsonFile);
    const { animations: talkingAnimation } = useFBX(`/animations/Talking.fbx`);
    const { animations: HelloAnimation } = useFBX(`/animations/Hello.fbx`);
    const { animations: thinkingAnimation } = useFBX(`/animations/Idle.fbx`);

    talkingAnimation[0].name = "Talking";
    HelloAnimation[0].name = "Hello";
    thinkingAnimation[0].name = "Thinking";

    const [animation, setAnimation] = useState("Talking");

    const group = useRef();
    const { actions } = useAnimations(
        [talkingAnimation[0], HelloAnimation[0], thinkingAnimation[0]],
        group
    );

    useEffect(() => {
        actions[animation].reset().fadeIn(0.5).play();
        return () => actions[animation].fadeOut(0.5);
    }, [animation]);


    useFrame(() => {

        const currentAudioTime = audio.currentTime;

        if (audio.paused || audio.ended) {
            setAnimation("Thinking");
        }

        Object.values(corresponding).forEach((value) => {
            nodes.Wolf3D_Head.morphTargetInfluences[nodes.Wolf3D_Head.morphTargetDictionary[value]] = 0;
            nodes.Wolf3D_Teeth.morphTargetInfluences[nodes.Wolf3D_Teeth.morphTargetDictionary[value]] = 0;

        });
        // console.log(nodes.Wolf3D_Head.morphTargetInfluences)
        for (let i = 0; i < lipsync.mouthCues.length; i++) {
            const mouthCue = lipsync.mouthCues[i];
            if (currentAudioTime >= mouthCue.start && currentAudioTime <= mouthCue.end) {
                // console.log(mouthCue);
                nodes.Wolf3D_Head.morphTargetInfluences[nodes.Wolf3D_Head.morphTargetDictionary[corresponding[mouthCue.value]]] = 1;
                nodes.Wolf3D_Teeth.morphTargetInfluences[nodes.Wolf3D_Teeth.morphTargetDictionary[corresponding[mouthCue.value]]] = 1;
            }
        }
    });
    useEffect(() => {
        if (playAudio) {
            audio.play();
            if (script == "Gorsuch") {
                setAnimation("Talking");
            }
        } else {
            audio.pause();
            setAnimation("Thinking");
        }
    }, [playAudio, script]);

    useEffect(() => {
        console.log(nodes.Wolf3D_Head.morphTargetDictionary);

    }, [])

    const { scene } = useGLTF('/models/674b527e1fcdb2befd1b4594.glb')
    const clone = React.useMemo(() => SkeletonUtils.clone(scene), [scene])
    const { nodes, materials } = useGraph(clone)
    return (
        <group {...props} dispose={null} ref={group}>
            <primitive object={nodes.Hips} />
            <skinnedMesh geometry={nodes.Wolf3D_Hair.geometry} material={materials.Wolf3D_Hair} skeleton={nodes.Wolf3D_Hair.skeleton} />
            <skinnedMesh geometry={nodes.Wolf3D_Glasses.geometry} material={materials.Wolf3D_Glasses} skeleton={nodes.Wolf3D_Glasses.skeleton} />
            <skinnedMesh geometry={nodes.Wolf3D_Body.geometry} material={materials.Wolf3D_Body} skeleton={nodes.Wolf3D_Body.skeleton} />
            <skinnedMesh geometry={nodes.Wolf3D_Outfit_Bottom.geometry} material={materials.Wolf3D_Outfit_Bottom} skeleton={nodes.Wolf3D_Outfit_Bottom.skeleton} />
            <skinnedMesh geometry={nodes.Wolf3D_Outfit_Footwear.geometry} material={materials.Wolf3D_Outfit_Footwear} skeleton={nodes.Wolf3D_Outfit_Footwear.skeleton} />
            <skinnedMesh geometry={nodes.Wolf3D_Outfit_Top.geometry} material={materials.Wolf3D_Outfit_Top} skeleton={nodes.Wolf3D_Outfit_Top.skeleton} />
            <skinnedMesh name="EyeLeft" geometry={nodes.EyeLeft.geometry} material={materials.Wolf3D_Eye} skeleton={nodes.EyeLeft.skeleton} morphTargetDictionary={nodes.EyeLeft.morphTargetDictionary} morphTargetInfluences={nodes.EyeLeft.morphTargetInfluences} />
            <skinnedMesh name="EyeRight" geometry={nodes.EyeRight.geometry} material={materials.Wolf3D_Eye} skeleton={nodes.EyeRight.skeleton} morphTargetDictionary={nodes.EyeRight.morphTargetDictionary} morphTargetInfluences={nodes.EyeRight.morphTargetInfluences} />
            <skinnedMesh name="Wolf3D_Head" geometry={nodes.Wolf3D_Head.geometry} material={materials.Wolf3D_Skin} skeleton={nodes.Wolf3D_Head.skeleton} morphTargetDictionary={nodes.Wolf3D_Head.morphTargetDictionary} morphTargetInfluences={nodes.Wolf3D_Head.morphTargetInfluences} />
            <skinnedMesh name="Wolf3D_Teeth" geometry={nodes.Wolf3D_Teeth.geometry} material={materials.Wolf3D_Teeth} skeleton={nodes.Wolf3D_Teeth.skeleton} morphTargetDictionary={nodes.Wolf3D_Teeth.morphTargetDictionary} morphTargetInfluences={nodes.Wolf3D_Teeth.morphTargetInfluences} />
        </group>
    )
}

useGLTF.preload('/models/674b527e1fcdb2befd1b4594.glb')