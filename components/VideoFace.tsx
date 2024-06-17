import { MeshProps, useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import { VideoTexture, Mesh, FrontSide, Vector3, DoubleSide } from "three";
import {Text} from "@react-three/drei"
import { VertexNormalsHelper } from "three/examples/jsm/helpers/VertexNormalsHelper.js";

interface VideoFaceProps extends MeshProps {
    texture: VideoTexture;
    label: string;
    padding: number;
}


export default function VideoFace({ position, rotation, texture, label, padding }:VideoFaceProps) {
    const textSize = 0.1; // Adjust this value as needed
    const ref = useRef<Mesh>(null)
    const {scene} = useThree()

    // useFrame(({camera},)=>{
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
    // })

    return (
      <group position={position} rotation={rotation}>
        <mesh ref={ref} name={label}>
          <planeGeometry args={[1 - padding, 1 - padding]} ></planeGeometry>
          <meshBasicMaterial map={texture} side={FrontSide}/>
        </mesh>
        <Text
          position={[0, -(0.5 - textSize), 0]} // Position the text below the plane
          fontSize={textSize}
          color="white" // Adjust the color as needed
          anchorX="center"
          anchorY="middle"
        >
          {label}
        </Text>
      </group>
    );
  }