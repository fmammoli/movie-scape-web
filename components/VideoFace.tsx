import { MeshProps } from "@react-three/fiber";
import { useRef, useState } from "react";
import { VideoTexture, PlaneGeometry, DoubleSide } from "three";
import {Text} from "@react-three/drei"

interface VideoFaceProps extends MeshProps {
    texture: VideoTexture;
    label: string;
    padding: number;
}


export default function VideoFace({ position, rotation, texture, label, padding }:VideoFaceProps) {
    const textSize = 0.1; // Adjust this value as needed
  
    return (
      <group position={position} rotation={rotation}>
        <mesh>
          <planeGeometry args={[1 - padding, 1 - padding]} ></planeGeometry>
          <meshBasicMaterial map={texture} side={DoubleSide}/>
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