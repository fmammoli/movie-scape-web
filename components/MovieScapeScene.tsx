"use client"

import { OrbitControls, PerspectiveCamera } from "@react-three/drei"
import VideoCube from "./VideoCube"
import HandControls from "./HandControls"
import { useEffect, useRef, useState } from "react"
import { Group } from "three"

export default function MovieScapeScene({webcamVideo}:{webcamVideo: HTMLVideoElement | null}){
    const [videoCubeState, setVideoCubeState] = useState<Group | null>(null)
    const videoCubeRef = useRef<Group>(null)
    
    useEffect(()=>{
        console.log(videoCubeRef)
        if(videoCubeRef.current){
            setVideoCubeState(videoCubeRef.current)
        }
    },[videoCubeRef])

    return (
        <>
            <ambientLight></ambientLight>
            <pointLight position={[10, 10, 10]} />
            <PerspectiveCamera makeDefault position={[0,0,5]}></PerspectiveCamera>
            {/* <mesh position={[0,3,0]}>
                <planeGeometry args={[1,1]}></planeGeometry>
                <meshStandardMaterial attach="material" color={"purple"} />
            </mesh> */}
            <VideoCube padding={0} ref={videoCubeRef}></VideoCube>
            {webcamVideo && videoCubeRef.current && videoCubeState && <HandControls video={webcamVideo} targetMesh={videoCubeRef.current}></HandControls>}
            
            <OrbitControls />
        </>
    )
}