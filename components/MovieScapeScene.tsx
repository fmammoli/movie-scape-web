"use client"

import { OrbitControls, PerspectiveCamera, Text as DreiText } from "@react-three/drei"
import VideoCube from "./VideoCube"
import HandControls from "./HandControls"
import { useEffect, useRef, useState } from "react"
import { Group, Mesh, Vector3 } from "three"
import { useFrame, useThree } from "@react-three/fiber"
import { VertexNormalsHelper } from "three/examples/jsm/helpers/VertexNormalsHelper.js"

function finInsideInterval(arr: number[]){
    if (arr.length === 0) return null;


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
        console.log(videoCubeRef)
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
                scene.add(helper);
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

                // Check if the plane is facing the camera
                //console.log(dotProduct)
                return dotProduct
            })
           
            //Paint every one red
            //@ts-ignore
            planeMashes.forEach(item => item.material.color.set("red"))

            //Find the planes withtin the camera range
            const insideTheRange = dotProducts.filter((item, index) => {
                if(item >= -1 && item <= -0.7) return item
            })
            
            //Fin the closest one
            const closerDot = findClosestToMinusOne(insideTheRange)
            
            //Paint the closest green
            //save the closer on a ref
            if(closerDot){
                const closerIndex = dotProducts.indexOf(closerDot) 
                //@ts-ignore
                planeMashes[closerIndex].material.color.set("green")
                planeFacingCameraRef.current = planeMashes[closerIndex]
            } else {
                planeFacingCameraRef.current = null
            }

            //Working!!!! Just need to extend this for more planes and I can detect which face is facing the camera.
            //const isFacingCamera = dotProducts[0] > -1 && dotProducts[0] < -0.7

            //console.log("is faceing: ",isFacingCamera);
            
    //      // For visualization, change color based on facing status
            //@ts-ignore
            //planeMashes[0].material.color.set(isFacingCamera ? 'green' : 'red');
            // if(closerDot){
            //     const closerPlane = planeMashes[dotProducts.indexOf(closerDot)]
            //     console.log(closerPlane.name)
            // }
        }
    //   if(ref.current){

    //     ref.current.geometry.computeVertexNormals()


    //     // Optionally, add VertexNormalsHelper to visualize normals
    //     const helper = new VertexNormalsHelper(ref.current, 0.5, 0xff0000);
    //     scene.add(helper);

        
    //     const normalAttr = ref.current.geometry.attributes.normal;
    //     const normal = new Vector3(normalAttr.getX(0), normalAttr.getY(0), normalAttr.getZ(0));

    //     // Transform the normal to world space
    //     const worldNormal = normal.clone().applyMatrix4(ref.current.matrixWorld).normalize();

        
    //     // Calculate camera direction (forward vector)
    //     const cameraDirection = new Vector3();
    //     camera.getWorldDirection(cameraDirection);
        
    //     // Calculate the dot product between the plane's normal and the camera direction
    //     const dotProduct = worldNormal.dot(cameraDirection);


    //     // Check if the plane is facing the camera
    //     //console.log(dotProduct)
    //     const isFacingCamera = dotProduct < 0;

    //     const difMinusOne =  Math.abs(dotProduct + 1)
    //     console.log(difMinusOne)

    //      // For visualization, change color based on facing status
    //     ref.current.material.color.set(isFacingCamera ? 'green' : 'red');
    //   }
    })


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
            {webcamVideo && <HandControls video={webcamVideo} targetMesh={videoCubeRef.current}></HandControls>}
            
            <OrbitControls />
        </>
    )
}