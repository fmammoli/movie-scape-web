"use client"

import { Camera, useFrame } from "@react-three/fiber"
import { Suspense, useEffect, useRef, useState } from "react"
import { OrbitControls, PerspectiveCamera } from "@react-three/drei"
import { Group, Mesh, PerspectiveCamera as ThreePerspectiveCamera, Vector3 } from "three"
import { useControls } from "leva"

import * as handPoseDetection from '@tensorflow-models/hand-pose-detection';

function convertTo3DCoordinates(x: number, y: number, videoWidth:number, videoHeight:number, camera: Camera) {
    const normalizedX = (x / videoWidth) * 2 - 1
    const normalizedY = -(y / videoHeight) * 2 + 1;

    const vector = new Vector3(normalizedX, normalizedY, -1).unproject(camera);
    return vector
}

function HandlControlledScene2({video}:{video: HTMLVideoElement | null}){

    const directionalLightRef = useRef(null);
    const {lightColor, lightIntensity} = useControls({lightColor:"white", lightIntensity:{value:10, min:0, max:20}});
    const boxRef = useRef<Mesh>(null);
    const cameraRef = useRef<ThreePerspectiveCamera>(null);

    const [detector, setDetector] = useState<handPoseDetection.HandDetector>();

    useEffect(()=>{
        async function loadHandPoseDetection() {
            const model = handPoseDetection.SupportedModels.MediaPipeHands;
            const detectorConfig = {
                runtime: "mediapipe",
                solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/hands',
                modelType: 'full'
            }
            const detector = await handPoseDetection.createDetector(model, {runtime:"mediapipe",solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/hands', modelType: 'full'})
            console.log("hand pose loaded succefully")
            setDetector(detector)
        }

        loadHandPoseDetection()
        
    },[])

    async function detectHands(delta:number, video: HTMLVideoElement){
        if(detector && video.readyState === 4){
            const hands = await detector.estimateHands(video)       
            if(hands.length > 0){
                if(boxRef.current){
                    if(hands[0].handedness === "Right"){
                        console.log("right")
                        boxRef.current.rotation.y += - Math.sin(delta)
                        
                    }
                    if(hands[0].handedness === "Left"){
                        console.log("left")
                        boxRef.current.rotation.y += Math.sin(delta)
                    }
                    const pos = {
                        hand: hands[0],
                        box: boxRef.current.position
                    }
                    console.log(pos)
                    if(cameraRef.current){
                        const vect = convertTo3DCoordinates(hands[0].keypoints[8].x, hands[0].keypoints[8].y, video.videoWidth, video.videoHeight, cameraRef.current)
                        boxRef.current.position.x = vect.x * -100
                        boxRef.current.position.y = vect.y * 100
                        if(hands[0].keypoints3D?.[8].z){
                            //boxRef.current.position.z = hands[0].keypoints3D[8].z * -100 ?? 0
                        }
                        
                        // if(hands[0].keypoints3D){
                        //     boxRef.current.position.x = hands[0].keypoints3D[0].x * 10
                        //     boxRef.current.position.y = hands[0].keypoints3D[0].y * 10
                        //     boxRef.current.position.z = hands[0].keypoints3D[0].z ?? 0
                        // }
                        
                    }
                }
            }
        
        }
        
    }
    
    useFrame((state, delta) =>{
        
        if(video){
            detectHands(delta, video)
        }
    })

    return (
    <>
        <PerspectiveCamera ref={cameraRef}></PerspectiveCamera>
        <ambientLight></ambientLight>
        <directionalLight position={[0,0,2]} color={lightColor} intensity={lightIntensity}></directionalLight>
        <Suspense fallback={null}>
            <mesh position={[0,0,0]} ref={boxRef}>
                <boxGeometry attach="geometry" args={[1,1,1]} />
                <meshStandardMaterial attach="material" color={"#6be092"} />
            </mesh>
        </Suspense>
        <OrbitControls></OrbitControls>
    </>
    )
}


export default HandlControlledScene2