"use client"

import { Canvas } from "@react-three/fiber"
import {useEffect, useRef, useState } from "react"
import Webcam from "react-webcam"
import HandControlledScene from "./HandControlledScene";


export default function Wrapper(){
    const webcamRef = useRef<Webcam>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [video, setVideo] = useState<HTMLVideoElement | null>(null)

    async function handleStartStream() {
        
        if(webcamRef.current?.video){
            await webcamRef.current.video.play()
            // if(canvasRef.current){
            //     canvasRef.current.width = webcamRef.current.video.videoWidth
            //     canvasRef.current.height = webcamRef.current.video.videoHeight
            // }
            console.log(webcamRef.current.video.width)
            console.log(webcamRef.current.video.videoHeight)
        }
    }

    useEffect(()=>{
        console.log("setting video")
        if(webcamRef && webcamRef.current){
            setVideo(webcamRef.current.video)
        }
    },[setVideo, webcamRef])

    return (
        <div className="flex justify-center">
            <Webcam mirrored ref={webcamRef} onUserMedia={handleStartStream} className={"hidden"}></Webcam>
                <div className="absolute top-0 w-[640px] h-[480px]">
                    <Canvas ref={canvasRef} className={"border-red-400"}>
                        <HandControlledScene video={video}></HandControlledScene>
                    </Canvas>
                </div>
        </div>
    )
}