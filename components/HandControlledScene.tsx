"use client"

import { Camera, useFrame } from "@react-three/fiber"
import { Suspense, useEffect, useRef, useState } from "react"
import { OrbitControls, PerspectiveCamera, Text } from "@react-three/drei"
import { Mesh, Quaternion, PerspectiveCamera as ThreePerspectiveCamera, Vector3, DoubleSide, VideoTexture } from "three"
import { useControls } from "leva"


import * as handPoseDetection from '@tensorflow-models/hand-pose-detection';

const PINCH_DISTANCE_THRESHOLD = 0.4

//another alternative
//https://portal.gitnation.org/contents/build-a-3d-solar-system-with-hand-recognition-and-threejs
//look at talk

//const vector = new Vector3();
//const position = new Vector3();
function convertTo3DCoordinates(x: number, y: number, videoWidth:number, videoHeight:number, camera: Camera) {
    //New Way
    const vector = new Vector3();
    const position = new Vector3();

    const normalizedX = (x / videoWidth) * 2 - 1;
    const normalizedY = -(y / videoHeight) * 2 + 1;
    
    vector.set(normalizedX, normalizedY, 0.5);
    vector.unproject(camera);
    vector.sub(camera.position).normalize()
    
    // //@ts-ignore
    const distance = 0.89 - camera.position.z / vector.z

    // const distance = - camera.position.z / vector.z
    position.copy(camera.position).add(vector.multiplyScalar(distance))
    position.x = position.x * -1
    position.y = position.y 
    return position
    //Olds way
    // const normalizedX = (x / videoWidth) * 2 - 1
    // const normalizedY = -(y / videoHeight) * 2 + 1;

    // const vector = new Vector3(normalizedX, normalizedY, -1).unproject(camera);
    // console.log(vector)
    // return vector
}

function HandlControlledScene2({video}:{video: HTMLVideoElement | null}){

    const directionalLightRef = useRef(null);
    const {lightColor, lightIntensity} = useControls({lightColor:"white", lightIntensity:{value:10, min:0, max:20}});
    // Hand diagrams
    //https://www.npmjs.com/package/@tensorflow-models/hand-pose-detection
    const thumbRef = useRef<Mesh>(null);
    const indexRef = useRef<Mesh>(null);
    const middleRef = useRef<Mesh>(null);
    const pinkyRef = useRef<Mesh>(null);
    const boxRef3 = useRef<Mesh>(null);
    const cameraRef = useRef<ThreePerspectiveCamera>(null);

    const [detector, setDetector] = useState<handPoseDetection.HandDetector>();

    const prevHandsRef = useRef<handPoseDetection.Hand[] | null>(null)

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

    const detectPinchMove = (currentHands: handPoseDetection.Hand[], prevHands: handPoseDetection.Hand[]) =>{
        if(thumbRef.current && indexRef.current && middleRef.current && video && cameraRef.current){
            const currentHand = currentHands[0]
            
            const vectThumb = convertTo3DCoordinates(currentHand.keypoints[4].x, currentHand.keypoints[4].y, video.videoWidth, video.videoHeight, cameraRef.current)
            const vectThumbMCP = convertTo3DCoordinates(currentHand.keypoints[2].x, currentHand.keypoints[2].y, video.videoWidth, video.videoHeight, cameraRef.current)
            const vectIndex = convertTo3DCoordinates(currentHand.keypoints[8].x, currentHand.keypoints[8].y, video.videoWidth, video.videoHeight, cameraRef.current)
            const vectMiddle = convertTo3DCoordinates(currentHand.keypoints[12].x, currentHand.keypoints[12].y, video.videoWidth, video.videoHeight, cameraRef.current)
            
            const currentDist = vectIndex.distanceTo(vectThumb)
            const auxDist = vectMiddle.distanceTo(vectThumbMCP)
            
            const dist1Pinch= currentDist <= PINCH_DISTANCE_THRESHOLD? true : false
            const auxDistPinch = auxDist >= 0.5 ? true : false
            const isCurrentPinch = dist1Pinch && auxDistPinch

            const prevHand = prevHands[0]
            if(prevHandsRef && prevHandsRef.current && prevHandsRef.current.length > 0){
                const prevVectPointerFinger = convertTo3DCoordinates(prevHand.keypoints[8].x, prevHand.keypoints[8].y, video.videoWidth, video.videoHeight, cameraRef.current)
                const prevVectThumbFinger = convertTo3DCoordinates(prevHandsRef.current[0].keypoints[4].x, prevHandsRef.current[0].keypoints[4].y, video.videoWidth, video.videoHeight, cameraRef.current)
                const prevDist = prevVectPointerFinger.distanceTo(prevVectThumbFinger)

                const isPrevPinch = prevDist <= PINCH_DISTANCE_THRESHOLD ? true : false

                if(isCurrentPinch && isPrevPinch){
                    
                    const dist = prevVectThumbFinger.distanceTo(vectThumb)
                    
                    if(dist > 0.015){

                        const  xdist = Math.abs(vectThumb.x - prevVectThumbFinger.x)
                        const  ydist = Math.abs(vectThumb.y - prevVectThumbFinger.y)
                        

                        const deltaX = vectThumb.x - prevVectThumbFinger.x
                        const deltaY = vectThumb.y - prevVectThumbFinger.y
                        const rotationSpeed = 10

                        const rotationAxisX = new Vector3(0,1,0)
                        const rotationAxisY = new Vector3(1,0,0)

                        const worldRotationAxisX = rotationAxisX.clone().applyQuaternion(cameraRef.current.quaternion).normalize()
                        if(Math.abs(deltaY) > Math.abs(deltaX * 2)){
                            const worldRotationAxisY = rotationAxisY.clone().applyQuaternion(cameraRef.current.quaternion).normalize()
                            boxRef3.current?.rotateOnWorldAxis(worldRotationAxisY, -deltaY * rotationSpeed)
                        }
                        boxRef3.current?.rotateOnWorldAxis(worldRotationAxisX, deltaX * rotationSpeed)
                    }       
                }
            }
        }
    }

    function keypointVector3(keypoint: handPoseDetection.Hand["keypoints"][0]){
        if(keypoint.x && keypoint.y && keypoint.z){
            return new Vector3(keypoint.x, keypoint.y, keypoint.z)
        }
    }

    //Not working, poistions are weird
    function converHandKeypointsToThreeJSCoord(hand: handPoseDetection.Hand, video: HTMLVideoElement, camera: Camera){
        const threeJSKeypoints: handPoseDetection.Hand["keypoints"][0][] = hand.keypoints.map((item)=>{
                const threeJSCoords = convertTo3DCoordinates(item.x, item.y, video.videoWidth, video.videoWidth, camera)
                const newItem = {
                    ...item,
                    x: threeJSCoords.x,
                    y: threeJSCoords.y,
                    z: threeJSCoords.z,
                }
                
                return newItem
        })
        return threeJSKeypoints
    }

    const detectSnap = (currentHands: handPoseDetection.Hand[], prevHands: handPoseDetection.Hand[]) =>{
        if(!thumbRef.current || !indexRef.current || !middleRef.current || !video || !cameraRef.current){
            return;
        }

        const currentKeypoints = converHandKeypointsToThreeJSCoord(currentHands[0], video, cameraRef.current)
        const prevKeypoint = converHandKeypointsToThreeJSCoord(prevHands[0], video, cameraRef.current)
        
        if(!currentKeypoints || !prevKeypoint){
            return;
        }
        const prevWristpVect = keypointVector3(prevKeypoint[0])
        const prevThumbTipVect =  keypointVector3(prevKeypoint[4])
        const prevMiddleTipVect = keypointVector3(prevKeypoint[12])
        const prevRingTipVect = keypointVector3(prevKeypoint[16])
        
        if(prevWristpVect && prevThumbTipVect && prevMiddleTipVect && prevRingTipVect){
            const prevSnapdist1 = prevThumbTipVect.distanceTo(prevMiddleTipVect)
            const prevSnapdist2 = prevRingTipVect.distanceTo(prevWristpVect)
   
            const prevIsSnapCandidade = prevSnapdist1 <= 0.36 ? true : false

            const currWristpVect = keypointVector3(currentKeypoints[0])
            const currThumbTipVect =  keypointVector3(currentKeypoints[4])
            const currThumbMCPVect =  keypointVector3(currentKeypoints[2])
            const currMiddleTipVect = keypointVector3(currentKeypoints[12])
            const currRingTipVect = keypointVector3(currentKeypoints[16])

            if(currMiddleTipVect && currWristpVect && currThumbTipVect && currRingTipVect && currThumbMCPVect){
                const currSnapdist1 = currThumbMCPVect.distanceTo(currMiddleTipVect)
                
                const currIsSnapCandidade = currSnapdist1 <= 0.5 ? true : false
                
                //console.log("Material:", boxRef3.current?.material, "\nCurrentFace: ", currentFaceRef.current)

                if(prevIsSnapCandidade && currIsSnapCandidade){
                    console.log("snap")
                    
                    if(boxRef3.current){
                        const currentRotation  = boxRef3.current.rotation.clone()
                        //boxRef3.current.rotation.set(0, currentRotation.y, 0)
                    }
                }
            }

        }
    }
    

    function drawHand(hand: handPoseDetection.Hand) {
        if(video && cameraRef.current){
            const tkeypoints = converHandKeypointsToThreeJSCoord(hand, video, cameraRef.current)
            
            //const wristpVect = (tkeypoints[0] && keypointVector3(tkeypoints[0])) as Vector3
            // const thumbTipVect = (tkeypoints[4] && keypointVector3(tkeypoints[4])) as Vector3
            // const indexTipVect = (tkeypoints[8] && keypointVector3(tkeypoints[8])) as Vector3
            // const middleTipVect = (tkeypoints[12] && keypointVector3(tkeypoints[12])) as Vector3
            //const ringTipVect = (tkeypoints[16] && keypointVector3(tkeypoints[16])) as Vector3

            if(thumbRef.current && indexRef.current && middleRef.current){
                const vectThumb = convertTo3DCoordinates(hand.keypoints[4].x, hand.keypoints[4].y, video.videoWidth, video.videoHeight, cameraRef.current)
                thumbRef.current.position.x = vectThumb.x 
                thumbRef.current.position.y = vectThumb.y 
        
                // thumbRef.current.position.x = tkeypoints[4].x 
                // thumbRef.current.position.y = tkeypoints[4].y 

                const vectIndex = convertTo3DCoordinates(hand.keypoints[8].x, hand.keypoints[8].y, video.videoWidth, video.videoHeight, cameraRef.current)
                indexRef.current.position.x = vectIndex.x 
                indexRef.current.position.y = vectIndex.y 
        
                const vectMiddle = convertTo3DCoordinates(hand.keypoints[12].x, hand.keypoints[12].y, video.videoWidth, video.videoHeight, cameraRef.current)
                middleRef.current.position.x = vectMiddle.x 
                middleRef.current.position.y = vectMiddle.y
            }
        }
    }

    async function detectHands(delta:number, video: HTMLVideoElement){
        if(detector && cameraRef.current && video.readyState === 4){
            const hands = await detector.estimateHands(video)      
            if(hands.length > 0){
                if(prevHandsRef.current){
                    detectPinchMove(hands, prevHandsRef.current)

                    detectSnap(hands, prevHandsRef.current)
                } 

                drawHand(hands[0])
                // console.log("setting prev hands")
                // console.log(hands)
                prevHandsRef.current = hands
            }
        }
    }

    //not working
    // function rotateToFace(face: number) {
    //     console.log("rotate to face: ", face)
    //     if(boxRef3.current !== null && cameraRef.current){
    //         const mesh = boxRef3.current;
            
    //         // Compute the direction vector from the camera to the cube
    //         const directionVector = new Vector3();
    //         cameraRef.current.getWorldPosition(directionVector);
    //         mesh.getWorldPosition(directionVector).sub(cameraRef.current.position).normalize();

    //         // Find the target face normal in world coordinates
    //         const targetNormal = faces[currentFaceRef.current].normal.clone();
    //         console.log(targetNormal)
    //         targetNormal.applyQuaternion(mesh.quaternion);
            
    //         // Compute the rotation quaternion to align targetNormal with directionVector
    //         const rotationQuat = new Quaternion();
    //         console.log(rotationQuat)
    //         rotationQuat.setFromUnitVectors(targetNormal, directionVector);

    //         // Apply the rotation quaternion to the mesh
    //         mesh.quaternion.normalize();
    //         mesh.quaternion.premultiply(rotationQuat);
            
    //     }
        

    // }
    
    useFrame((state, delta) =>{
        
        if(video){
            detectHands(delta, video)
        }
    })

    
    const videoPaths = [
        {videoName: "zigZag", videoPath:"/zigzag.mp4", face:"front"},
        {videoName: "lluvia", videoPath:"/lluvia.mp4", face:"top"},
        {videoName: "mudflatScatter", videoPath:"/mudflat_scatter.mp4", face:"back"}
    ]


    const videoFaces = videoPaths.map((item, index)=>{
        const vid = document.createElement("video");
        vid.src = item.videoPath;
        vid.crossOrigin = "Anonymous";
        vid.loop = true;

        return {...item, videoEl: vid, videoTexture: new VideoTexture(vid)}
    })

    console.log(videoFaces)
    const videoFacesRef = useRef(videoFaces)
    return (
    <>
        <PerspectiveCamera ref={cameraRef} makeDefault position={[0,0,10]}></PerspectiveCamera>
        <ambientLight></ambientLight>
        <directionalLight position={[0,0,2]} color={lightColor} intensity={lightIntensity}></directionalLight>
        <Suspense fallback={null}>
                       
            <mesh position={[0,0,0]} ref={boxRef3}>
                <boxGeometry attach="geometry" args={[3, 3, 3]} />
                
                {videoFaces.map((item, index) => {
                    return <meshStandardMaterial key={item.videoName} attach={`material-${index}`} opacity={0.8} transparent map={item.videoTexture} side={DoubleSide}/>
                })}
                
                <meshStandardMaterial attach="material-3" color={"green"} opacity={0.5} transparent/>
                <meshStandardMaterial attach="material-4" color={"purple"} opacity={0.5} transparent/>
                <meshStandardMaterial attach="material-5" color={"red"} opacity={0.5} transparent></meshStandardMaterial>

            </mesh>
                
            <mesh position={[0,0,0]} ref={thumbRef}>
                <sphereGeometry attach="geometry" args={[0.2,10,10]}></sphereGeometry>
                <meshStandardMaterial attach="material" color={"#6be092"} />
            </mesh>
            <mesh position={[0,0,0]} ref={indexRef}>
                <sphereGeometry attach="geometry" args={[0.2,10,10]}></sphereGeometry>
                <meshStandardMaterial attach="material" color={"red"} />
            </mesh>
            <mesh position={[0,0,0]} ref={middleRef}>
                <sphereGeometry attach="geometry" args={[0.2,10,10]}></sphereGeometry>
                <meshStandardMaterial attach="material" color={"purple"} />
            </mesh>
            <FaceLabel position={[0, 0, 0.55]} rotation={[0, 0, 0]} label="Front" />
            <FaceLabel position={[0, 0, -0.55]} rotation={[0, Math.PI, 0]} label="Back" />
            <FaceLabel position={[0, 0.55, 0]} rotation={[-Math.PI / 2, 0, 0]} label="Top" />
            <FaceLabel position={[0, -0.55, 0]} rotation={[Math.PI / 2, 0, 0]} label="Bottom" />
            <FaceLabel position={[0.55, 0, 0]} rotation={[0, -Math.PI / 2, 0]} label="Right" />
            <FaceLabel position={[-0.55, 0, 0]} rotation={[0, Math.PI / 2, 0]} label="Left" />
        </Suspense>
        {/* <OrbitControls></OrbitControls> */}

    </>
    )
}


function FaceLabel({ position, label, rotation}:{position: [number, number, number], label:string, rotation:[number, number, number]}) {
    return (
      <mesh position={position}>
        <Text
            position={position}
            rotation={rotation}
            fontSize={0.6}
            color="white"
            outlineColor="black"
            outlineWidth={0.02}
            anchorX="center"
            anchorY="middle"
            >
            {label}
        </Text>
      </mesh>
    );
  }
export default HandlControlledScene2