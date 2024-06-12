"use client"

import { Camera, useFrame, useLoader } from "@react-three/fiber"
import { Suspense, useEffect, useRef, useState } from "react"
import { OrbitControls, PerspectiveCamera, PivotControls } from "@react-three/drei"
import { Group, Mesh, PerspectiveCamera as ThreePerspectiveCamera, Vector3, FrontSide, BackSide, TextureLoader } from "three"
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
    const thumbRef = useRef<Mesh>(null);
    const indexRef = useRef<Mesh>(null);
    const boxRef3 = useRef<Mesh>(null);
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

    const prevHandsRef = useRef<handPoseDetection.Hand[] | null>(null)

    async function detectHands(delta:number, video: HTMLVideoElement){
        if(detector && video.readyState === 4 && thumbRef.current && indexRef.current && boxRef3.current){
            const hands = await detector.estimateHands(video)       
            if(hands.length > 0){

                //detect pinch
                if(hands[0].handedness === "Right"){
                    //boxRef.current.rotation.y += - Math.sin(delta)
                }
                if(hands[0].handedness === "Left"){
                    //boxRef.current.rotation.y += Math.sin(delta)
                }
                const pos = {
                    hand: hands[0],
                    box: thumbRef.current.position
                }
                if(cameraRef.current){
                    const vectIndex = convertTo3DCoordinates(hands[0].keypoints[8].x, hands[0].keypoints[8].y, video.videoWidth, video.videoHeight, cameraRef.current)
                    indexRef.current.position.x = vectIndex.x * -100
                    indexRef.current.position.y = vectIndex.y * 100

                    const vectThumb = convertTo3DCoordinates(hands[0].keypoints[4].x, hands[0].keypoints[4].y, video.videoWidth, video.videoHeight, cameraRef.current)
                    thumbRef.current.position.x = vectThumb.x * -100
                    thumbRef.current.position.y = vectThumb.y * 100

                    const currentDist = vectIndex.distanceTo(vectThumb)
                    
                    const isCurrentPinch = currentDist <= 0.004 ? true : false

                    if(prevHandsRef && prevHandsRef.current){
                        const prevVectPointerFinger = convertTo3DCoordinates(prevHandsRef.current[0].keypoints[8].x, prevHandsRef.current[0].keypoints[8].y, video.videoWidth, video.videoHeight, cameraRef.current)
                        const prevVectThumbFinger = convertTo3DCoordinates(prevHandsRef.current[0].keypoints[4].x, prevHandsRef.current[0].keypoints[4].y, video.videoWidth, video.videoHeight, cameraRef.current)
                        const prevDist = prevVectPointerFinger.distanceTo(prevVectThumbFinger)

                        const isPrevPinch = prevDist <= 0.004 ? true : false
                        
                        if(isCurrentPinch && isPrevPinch){
                            //console.log("pinching")
                            const dist = prevVectThumbFinger.distanceTo(vectThumb)
                            if(dist > 0.0004){
                                const  x = vectThumb.x - prevVectThumbFinger.x
                                
                                boxRef3.current.rotateY(-Math.sin(x * 100))
                                const  y = vectThumb.y - prevVectThumbFinger.y
                                //boxRef3.current.rotateX(-Math.sin(y * 100))
                            }       
                        } else {
                            //console.log("not pitching")
                        }
                    }
                }
             prevHandsRef.current = hands
            }

            thumbRef.current
        
        }
        
    }
    
    useFrame((state, delta) =>{
        if(video){
            detectHands(delta, video)
        }
    })

    //const videoMap = useLoader(TextureLoader, "/mudflat_scatter.mp4")


    const [zigzagMap] = useState(() => {
        const vid = document.createElement("video");
        vid.src = "/zigzag.mp4";
        vid.crossOrigin = "Anonymous";
        vid.loop = true;
        vid.muted = true;
        vid.play();
        return vid;
    });


    const [lluviaMap] = useState(() => {
        const vid = document.createElement("video");
        vid.src = "/lluvia.mp4";
        vid.crossOrigin = "Anonymous";
        vid.loop = true;
        vid.muted = true;
        vid.play();
        return vid;
    });


    const [mudflatScatterMap] = useState(() => {
        const vid = document.createElement("video");
        vid.src = "/mudflat_scatter.mp4";
        vid.crossOrigin = "Anonymous";
        vid.loop = true;
        vid.muted = true;
        vid.play();
        return vid;
    });
    
    return (
    <>
        <PerspectiveCamera ref={cameraRef}></PerspectiveCamera>
        <ambientLight></ambientLight>
        <directionalLight position={[0,0,2]} color={lightColor} intensity={lightIntensity}></directionalLight>
        <Suspense fallback={null}>
           
            <mesh position={[0,0,0]} ref={boxRef3} onClick={(event)=>video?.pause()}>
                <boxGeometry attach="geometry" args={[3, 3, 3]} />
                <meshStandardMaterial attach="material-0" color={"blue"} opacity={0.5} transparent></meshStandardMaterial>
                <meshStandardMaterial attach="material-1" opacity={0.5} transparent color={"pink"}>
                </meshStandardMaterial>
                <meshStandardMaterial attach="material-2" color={"red"} opacity={0.5} transparent/>
                <meshStandardMaterial attach="material-3" color={"green"} opacity={0.5} transparent/>
                <meshStandardMaterial attach="material-4" opacity={0.7} transparent>
                    <videoTexture attach="map" args={[zigzagMap]}></videoTexture>
                </meshStandardMaterial>
                <meshStandardMaterial attach="material-5" color={"purple"} opacity={0.5} transparent>
                </meshStandardMaterial>
                <meshStandardMaterial attach="material-6" color={"cyan"} opacity={0.5} transparent/>
            </mesh>
                
            <mesh position={[0,0,0]} ref={thumbRef}>
                <sphereGeometry attach="geometry" args={[0.1,24,24]}></sphereGeometry>
                <meshStandardMaterial attach="material" color={"#6be092"} />
            </mesh>
            <mesh position={[0,0,0]} ref={indexRef}>
                <sphereGeometry attach="geometry" args={[0.1,24,24]}></sphereGeometry>
                <meshStandardMaterial attach="material" color={"red"} />
            </mesh>
            
                
        </Suspense>
        <OrbitControls></OrbitControls>

    </>
    )
}


export default HandlControlledScene2