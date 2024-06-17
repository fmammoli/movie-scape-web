import { Color, MeshProps } from "@react-three/fiber";
import { DoubleSide, FrontSide, VideoTexture } from "three";
import {Text} from "@react-three/drei"

interface ColorFaceProps extends MeshProps {
    label: string;
    padding: number;
    color: Color;
}


export default function VideoFace({ position, rotation, label, padding, color }:ColorFaceProps) {
    const textSize = 0.1; // Adjust this value as needed
  
    return (
      <group position={position} rotation={rotation}>
        <mesh name={label}>
          <planeGeometry args={[1 - padding, 1 - padding]}></planeGeometry>
          <meshBasicMaterial color={color} transparent opacity={0.5} side={DoubleSide}/>
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