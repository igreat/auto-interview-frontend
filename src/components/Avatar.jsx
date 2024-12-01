import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useGraph, useLoader } from '@react-three/fiber'
import { useFrame } from '@react-three/fiber'
import { useAnimations, useFBX, useGLTF } from '@react-three/drei'
import { SkeletonUtils } from 'three-stdlib'
import { useControls } from 'leva'


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
    const { audioRef, lipsync } = props;
    const [audioStarted, setAudioStarted] = useState(false);

    useEffect(() => {
        if (!audioRef.current) {
            setAnimation("Thinking");
            return;
        }
        if (audioRef.current && !audioStarted) {
            audioRef.current.play();
            setAnimation("Talking");
            setAudioStarted(true);
        } else {
            setAnimation("Thinking");
        }
    }, [audioRef.current, audioStarted]);

    // const { playAudio, script } = useControls({
    //     playAudio: false,
    //     script: { value: "Gorsuch", options: ["Gorsuch"] },
    // });

    // const audio = useMemo(() => new Audio(`Audios/${script}.wav`), [script]);
    // const jsonFile = useLoader(THREE.FileLoader, `/Audios/${script}.json`);
    // const lipsync = JSON.parse(jsonFile);

    const { animations: talkingAnimation } = useFBX(`/animations/Talking.fbx`);
    const { animations: HelloAnimation } = useFBX(`/animations/Hello.fbx`);
    const { animations: thinkingAnimation } = useFBX(`/animations/Idle.fbx`);


    talkingAnimation[0].name = "Talking";
    HelloAnimation[0].name = "Hello";
    thinkingAnimation[0].name = "Thinking";

    const [animation, setAnimation] = useState("Thinking");

    const group = useRef();
    const { actions } = useAnimations(
        [talkingAnimation[0], HelloAnimation[0], thinkingAnimation[0]],
        group
    );

    useEffect(() => {
        actions[animation].reset().fadeIn(0.5).play();
        return () => actions[animation].fadeOut(0.5);
    }, [animation]);

    // useEffect(() => {
    //     if (audioRef) {
    //         audioRef.addEventListener("play", () => actions["Talking"]?.play());
    //         audioRef.addEventListener("ended", () => actions["Thinking"]?.play());
    //     }
    // }, [audioRef, actions]);

    useFrame(() => {
        if (!audioRef.current) {
            setAnimation("Thinking");
            return;
        }
        const currentAudioTime = audioRef.current.currentTime;
        if (audioRef.paused || audioRef.ended) {
            setAnimation("Thinking");
            return;
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

    // // detect ending so that I can set the animation to thinking and audioStarted to false
    // useEffect(() => {
    //     if (audioRef.current) {
    //         audioRef.addEventListener("ended", () => {
    //             setAnimation("Thinking");
    //             setAudioStarted(false);
    //         });
    //     }
    // }, [audioRef]);

    const { scene } = useGLTF('/public/models/MainModel.glb')
    const clone = React.useMemo(() => SkeletonUtils.clone(scene), [scene])
    const { nodes, materials } = useGraph(clone)
    return (

        <group {...props} dispose={null}>
            <primitive object={nodes.Hips} ref={group} />
            <skinnedMesh geometry={nodes.Wolf3D_Hair.geometry} material={materials.Wolf3D_Hair} skeleton={nodes.Wolf3D_Hair.skeleton} />
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

useGLTF.preload('/models/MainModel.glb')