"use client"

import { Canvas } from "@react-three/fiber"
import {useEffect, useRef, useState } from "react"
import Webcam from "react-webcam"
import MovieScapeScene from "./MovieScapeScene";


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
            <div className="absolute top-0 w-full h-full">
                <Canvas ref={canvasRef} className={"border-red-400"}>
                    {/* <HandControlledScene video={video}></HandControlledScene> */}
                    <MovieScapeScene webcamVideo={video}></MovieScapeScene>
                </Canvas>
            </div>
        </div>
    )
}