import { forwardRef, Ref, useEffect, useRef, useState } from "react";
import { Group, Vector3, VideoTexture } from "three";
import VideoFace from "./VideoFace";
import ColorFace from "./ColorFace";
import { useFrame } from "@react-three/fiber";

type VideoFaceCubeProps = {
    padding:number
}

const VideoCube = forwardRef(function VideoCube({padding}:VideoFaceCubeProps, ref:Ref<Group>){
    const [textures, setTextures] = useState<VideoTexture[]>([]);
    useEffect(()=>{
        const videos = [
            "/lluvia.mp4",
            "/mudflat_scatter.mp4",
            "/zigzag.mp4"
        ]
    
        const videoElements = videos.map(videoSrc => {
            const video = document.createElement('video');
            video.src = videoSrc;
            video.crossOrigin = 'anonymous';
            video.loop = true;
            return video;
        })
    
        const videoTextures = videoElements.map((video) => new VideoTexture(video))
        setTextures(videoTextures)    
    },[])


    
    const labels = ['Front', 'Back', 'Top', 'Bottom', 'Right', 'Left'];
    
    // Define local face normals of a cube
    const faceNormals = [
      new Vector3(0, 0, 1),   // Front
      new Vector3(0, 0, -1),  // Back
      new Vector3(0, 1, 0),   // Top
      new Vector3(0, -1, 0),  // Bottom
      new Vector3(1, 0, 0),   // Right
      new Vector3(-1, 0, 0),  // Left
    ];

    

    return (
        <>
        {
          <group ref={ref}>
            <VideoFace
              position={[0, 0, -0.5]}
              rotation={[0, Math.PI, 0]}
              texture={textures[0]}
              label={labels[0]}
              padding={padding}
            />
            {/* <VideoFace
              position={[0, 0, - 0.5 - padding / 2]}
              rotation={[0, Math.PI , 0]}
              texture={textures[0]}
              label={labels[1]}
              padding={padding}
            /> */}
            {/* <VideoFace
              position={[0, 0, -0.5 + padding / 2]}
              rotation={[0, Math.PI, 0]}
              texture={textures[1]}
              label={labels[1]}
              padding={padding}
            />
            <VideoFace
              position={[0, 0.5 - padding / 2, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
              texture={textures[2]}
              label={labels[2]}
              padding={padding}
            />
            <ColorFace
              position={[0, -0.5 + padding / 2, 0]}
              rotation={[Math.PI / 2, 0, 0]}
              label={labels[3]}
              padding={padding}
              color={"purple"}
            />
            <ColorFace
              position={[0.5 - padding / 2, 0, 0]}
              rotation={[0, -Math.PI / 2, 0]}
              label={labels[4]}
              padding={padding}
              color={"blue"}
            />
            <ColorFace
              position={[-0.5 + padding / 2, 0, 0]}
              rotation={[0, Math.PI / 2, 0]}
              label={labels[5]}
              padding={padding}
              color={"green"}
            /> */}
          </group>
        }
      </>
    )
})
export default VideoCube