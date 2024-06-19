"use client"

import { OrbitControls, PerspectiveCamera, Text as DreiText, Sparkles } from "@react-three/drei"
import VideoCube from "./VideoCube"
import HandControls from "./HandControls"
import { useEffect, useRef, useState } from "react"
import { Camera, Group, Mesh, Vector3, Vector3Like } from "three"
import { useFrame, useThree } from "@react-three/fiber"
import { VertexNormalsHelper } from "three/examples/jsm/helpers/VertexNormalsHelper.js"
import VideoDodecahedron from "./VideoDodecahedron"
import SilentMovieCube from "./SilentMovieCube"

function findClosestNumber(array:number[], target:number) {
    return array.reduce((closest, num) => {
      return Math.abs(num - target) < Math.abs(closest - target) ? num : closest;
    }, Infinity);
  }
//Tem que ser closer porém não maior que um certo tanto, senão as costas fica sempre front
const findClosestToMinusOne = (arr: number[]) => {
    if (arr.length === 0) return null;
  
    let closest = arr[0];
    let minDistance = Math.abs(arr[0] + 1);
  
    for (let i = 1; i < arr.length; i++) {
      const currentDistance = Math.abs(arr[i] + 1);
      if (currentDistance < minDistance) {
        closest = arr[i];
        minDistance = currentDistance;
      }
    }
  
    return closest;
  };

export default function MovieScapeScene({webcamVideo}:{webcamVideo: HTMLVideoElement | null}){
    const [videoCubeState, setVideoCubeState] = useState<Group | null>(null)
    const videoCubeRef = useRef<Group | null>(null)
    const ref = videoCubeRef

    const planeFacingCameraRef = useRef<Mesh | null>(null)

    useEffect(()=>{
        //console.log(videoCubeRef)
        if(videoCubeRef.current){
            setVideoCubeState(videoCubeRef.current)
        }
    },[videoCubeRef])
    
    const {scene} = useThree()

    useFrame(({camera},)=>{
        if(ref.current){
            
            const planeMashes: Mesh[] = []
            ref.current.children.forEach(item => {
                item.children.forEach((item2 => {
                    const mesh = item2 as Mesh
                    if(mesh.type === "Mesh" && mesh.geometry.type === "PlaneGeometry"){
                        planeMashes.push(mesh)
                    }
                }))
            })

            planeMashes.forEach((item)=>{
                (item as Mesh).geometry.computeVertexNormals()


                // Optionally, add VertexNormalsHelper to visualize normals
                const helper = new VertexNormalsHelper(item, 0.5, 0xff0000);
                //scene.add(helper);
            })
            
            //console.log(ref.current.children[0])
            const dotProducts = planeMashes.map((item)=>{
                const plane = item as Mesh
                const normalAttr = plane.geometry.attributes.normal;
                const normal = new Vector3(normalAttr.getX(0), normalAttr.getY(0), normalAttr.getZ(0));

                // Transform the normal to world space
                const worldNormal = normal.clone().applyMatrix4(plane.matrixWorld).normalize();

                // Calculate camera direction (forward vector)
                const cameraDirection = new Vector3();
                camera.getWorldDirection(cameraDirection);
                
                // Calculate the dot product between the plane's normal and the camera direction
                const dotProduct = worldNormal.dot(cameraDirection);

                return dotProduct
            })
           
            //Paint every one red
            //@ts-ignore
            planeMashes.forEach(item => item.material.color.set("red"))

            //Find the planes withtin the camera range
            //console.log(dotProducts)
            const insideTheRange = dotProducts.filter((item, index) => {
                //This is for position 0 of video cube group
                if(item >= -1 && item <= -0.7) return item
                
                //For video cube -3 position
                //if(item <= 1 && item >= 0.8) return item
            })
            
            //Fin the closest one
            const closerDot = findClosestToMinusOne(insideTheRange)
            
            //const closerDot = findClosestNumber(insideTheRange, -1)
            //Paint the closest green
            //save the closer on a ref
            if(closerDot){
                const closerIndex = dotProducts.indexOf(closerDot) 
                //@ts-ignore
                planeMashes[closerIndex].material.color.set("white")
                planeFacingCameraRef.current = planeMashes[closerIndex]
            } else {
                planeFacingCameraRef.current = null
            }
        }
    })


    function handleSnap(){
        if(planeFacingCameraRef.current){
            videoCubeRef.current?.children.forEach((item, index)=>{
                item.children.forEach((item2, index2)=>{
                    const mesh = item2 as Mesh;
                    if(mesh.geometry.type === "PlaneGeometry"){
                        //console.log("uuid: ", mesh.uuid, "\n    : ",planeFacingCameraRef.current?.uuid)
                        if(mesh.uuid === planeFacingCameraRef.current?.uuid){
                            
                            //@ts-ignore
                            const video = mesh.material.map.source.data as HTMLVideoElement
                            if(video.paused){
                                video.play()
                            }else {
                                video.pause()
                            }
                        }else {
                            //@ts-ignore
                            //mesh.material.map.source.data.pause()
                        }
                    }
                })
            })
        }
    }

    function handlePinchMove(thumbStart: Vector3, thumbEnd:Vector3, camera: Camera){
        if(videoCubeRef.current){
            const moveDist = thumbStart.distanceTo(thumbEnd)
            if(moveDist > 0.015){
                const deltaX = thumbEnd.x - thumbStart.x;
                const deltaY = thumbEnd.y - thumbStart.y;
                const rotationSpeed = 1;
    
                const rotationAxisX = new Vector3(0,1,0);
                const rotationAxisY = new Vector3(1,0,0);
    
                const worldRotationAxisX = rotationAxisX.clone().applyQuaternion(camera.quaternion).normalize()
                if(Math.abs(deltaY) > Math.abs(deltaX * 2)){
                    const worldRotationAxisY = rotationAxisY.clone().applyQuaternion(camera.quaternion).normalize()
                    videoCubeRef.current.rotateOnWorldAxis(worldRotationAxisY, -deltaY * rotationSpeed)
                }
                videoCubeRef.current.rotateOnWorldAxis(worldRotationAxisX, deltaX * rotationSpeed)
            }
        }
    }

    return (
        <>
            <ambientLight></ambientLight>
            <pointLight position={[10, 10, 10]} />
            <PerspectiveCamera makeDefault position={[0,0,5]}></PerspectiveCamera>
            {/* <VideoDodecahedron padding={0} ref={videoCubeRef}></VideoDodecahedron> */}
            <SilentMovieCube ref={videoCubeRef} padding={0}></SilentMovieCube>
            <Sparkles position={[0,0,0]} size={8} opacity={0.8} speed={0.5} scale={2}></Sparkles>
            {webcamVideo && <HandControls video={webcamVideo} onSnap={handleSnap} onPinchMove={handlePinchMove}></HandControls>}
            <OrbitControls />
        </>
    )
}