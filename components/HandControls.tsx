import { useEffect, useRef, useState } from "react";
import * as handPoseDetection from '@tensorflow-models/hand-pose-detection';
import { useFrame } from "@react-three/fiber";
import { Camera, Group, Vector3 } from "three";

function convertTo3DCoordinates(x: number, y: number, videoWidth:number, videoHeight:number, camera: Camera) {
    //New Way
    const vector = new Vector3();
    const position = new Vector3();

    const normalizedX = (x / videoWidth) * 2 - 1;
    const normalizedY = -(y / videoHeight) * 2 + 1;
    
    vector.set(normalizedX, normalizedY, 0.5);
    vector.unproject(camera);
    vector.sub(camera.position).normalize()
    
    const distance = 0.89 - camera.position.z / vector.z

    position.copy(camera.position).add(vector.multiplyScalar(distance))
    position.x = position.x * -1
    position.y = position.y 
    return position

}

const PINCH_DISTANCE_THRESHOLD = 0.4

export default function HandControls({video, targetMesh}:{video: HTMLVideoElement, targetMesh: Group | null}){
    const [detector, setDetector] = useState<handPoseDetection.HandDetector>();
    const handGroupRef = useRef<Group>(null)

    const prevHandsRef = useRef<handPoseDetection.Hand[]>([])

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

    

    useFrame((state, delta)=>{
        const camera = state.camera

        function drawHand(hand:handPoseDetection.Hand){
            
            if(handGroupRef.current){
                const keypointsThreeJS = hand.keypoints.map(keypoint =>{
                    return convertTo3DCoordinates(keypoint.x, keypoint.y, video.videoWidth, video.videoHeight, camera);
                })
                
                keypointsThreeJS.forEach((keypoint, index) =>{
                    if(handGroupRef.current){
                        
                        handGroupRef.current.children[index].position.set(keypoint.x, keypoint.y, keypoint.z);
                        
                    
                    }
                })                
                
            }
             
        }

        function detectPinch(hand: handPoseDetection.Hand) {
            if(handGroupRef.current){
                const keypointsThreeJS = hand.keypoints.map(keypoint =>{
                    return convertTo3DCoordinates(keypoint.x, keypoint.y, video.videoWidth, video.videoHeight, camera);
                })

                const thumbTip = keypointsThreeJS[4];
                const indexTip = keypointsThreeJS[8];

                const pinchDist = thumbTip.distanceTo(indexTip);
                
                const isPinching = pinchDist <= PINCH_DISTANCE_THRESHOLD ? true : false;
                
                if(isPinching){

                    const prevHand = prevHandsRef.current[0];
                    const prevKeypointsThreeJS = prevHand.keypoints.map(keypoint =>{
                        return convertTo3DCoordinates(keypoint.x, keypoint.y, video.videoWidth, video.videoHeight, camera);
                    })

                    const prevthumbTip = prevKeypointsThreeJS[4];
                    const prevIndexTip = prevKeypointsThreeJS[8];
    
                    const prevPinchDist = prevthumbTip.distanceTo(prevIndexTip);
    
                    const previIsPinching = prevPinchDist <= PINCH_DISTANCE_THRESHOLD ? true : false;

                    //console.log(previIsPinching)
                    if(previIsPinching){
                        const moveDist = prevthumbTip.distanceTo(thumbTip)
                        if(moveDist > 0.015){
                            const deltaX = thumbTip.x - prevthumbTip.x
                            const deltaY = thumbTip.y - prevthumbTip.y
                            const rotationSpeed = 0.5

                            const rotationAxisX = new Vector3(0,1,0)
                            const rotationAxisY = new Vector3(1,0,0)

                            const worldRotationAxisX = rotationAxisX.clone().applyQuaternion(camera.quaternion).normalize()
                            if(Math.abs(deltaY) > Math.abs(deltaX * 3)){
                                const worldRotationAxisY = rotationAxisY.clone().applyQuaternion(camera.quaternion).normalize()
                                targetMesh && targetMesh.rotateOnWorldAxis(worldRotationAxisY, -deltaY * rotationSpeed)
                            }
                            targetMesh && targetMesh.rotateOnWorldAxis(worldRotationAxisX, deltaX * rotationSpeed)
                            return true
                        }
                    }   
                }
            }
            return false
        }

        function detechSnap(hand: handPoseDetection.Hand){
            if(prevHandsRef.current){
                const prevHand = prevHandsRef.current[0]
                const prevKeypointsThreeJS = prevHand.keypoints.map(keypoint =>{
                    return convertTo3DCoordinates(keypoint.x, keypoint.y, video.videoWidth, video.videoHeight, camera);
                })
                const prevThumbTip = prevKeypointsThreeJS[4];
                const prevMiddleTip = prevKeypointsThreeJS[12];

                const prevSnapStartDist = prevMiddleTip.distanceTo(prevThumbTip)
                //console.log(prevSnapStartDist)
               
                const isPrevSnap = prevSnapStartDist <= 0.36 ? true : false

                //current
                const keypointsThreeJS = hand.keypoints.map(keypoint =>{
                    return convertTo3DCoordinates(keypoint.x, keypoint.y, video.videoWidth, video.videoHeight, camera);
                })
                const thumbTip = keypointsThreeJS[4];
                const thumbMCP = keypointsThreeJS[2];
                const middleTip = keypointsThreeJS[12];

                const snapDistEndThumbMCP = thumbMCP.distanceTo(middleTip)
                //console.log(snapDistEndThumbMCP)
                //const snapDistEndThumTip = middleTip.distanceTo(thumbTip)
                const isCurrentSnap = snapDistEndThumbMCP <= 0.84 ? true : false
                
                const middleDist = prevMiddleTip.distanceTo(middleTip)
                //console.log(middleDist)
                if(isPrevSnap && isCurrentSnap && middleDist > 0.8){
                    console.log("snap!");
                    
                    if(targetMesh){
                        targetMesh.rotation.set(0,0,0);
                    }
                    return true;
                }
            }
            return false;
        }

        async function detectHands(){
            if(detector && camera && video.readyState === 4){
                const hands = await detector.estimateHands(video)
                if(hands.length > 0){
                     
                    
                    if(prevHandsRef.current.length > 0){
                        detectPinch(hands[0])
                        detechSnap(hands[0])
                    } 
                    
                    drawHand(hands[0])
                }
                prevHandsRef.current = hands
                
            }
            
        }
        detectHands()
    })
    
    
    
    const points = new Array<[number, number, number]>(21).fill([0,0,0])

    return(
        <group ref={handGroupRef} name={"hand"}>
            {points.map((item, index)=>{
                return (
                    <>
                    <mesh key={`hand-points-${index}`} position={[index/10,item[1],item[2]]} name={"hand-mesh"}>
                        <sphereGeometry attach="geometry" args={[0.05,10,10]}></sphereGeometry>
                        <meshStandardMaterial attach="material" color={"purple"} />
                    </mesh>
                    </>
                )
            })}
        </group>
    )   
}