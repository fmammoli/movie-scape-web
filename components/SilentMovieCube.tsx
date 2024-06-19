import { forwardRef, Ref, useEffect, useRef, useState } from "react";
import { Group, Vector3, VideoTexture } from "three";
import VideoFace from "./VideoFace";
import ColorFace from "./ColorFace";
import { useFrame } from "@react-three/fiber";

type VideoFaceCubeProps = {
    padding:number
}

const VideoCube = forwardRef(function SilentMovieCube({padding}:VideoFaceCubeProps, ref:Ref<Group>){
  
  function buildVideoTexture(){
    const videos = [
        "/videos/aurora0.mp4",
        "/videos/aurora1.mp4",
        "/videos/aurora2.mp4",
        "/videos/aurora3.mp4",
        "/videos/aurora4.mp4",
        "/videos/silent_movie0.mp4",
    ]

    const videoElements = videos.map(videoSrc => {
        const video = document.createElement('video');
        video.src = videoSrc;
        video.crossOrigin = 'anonymous';
        video.loop = true;
        return video;
    })

    const videoTextures = videoElements.map((video) => new VideoTexture(video))
    return videoTextures
  }
  
  const [textures, setTextures] = useState<VideoTexture[]>(()=>buildVideoTexture());
    
    const labels = ['Front', 'Back', 'Top', 'Bottom', 'Right', 'Left'];
    
    const gap = 1
    
    return (
        <>
        {
          <group ref={ref}>
            <VideoFace
              position={[0,0, 0.5 + gap]}
              rotation={[0, 0, 0]}
              texture={textures[0]}
              label={labels[0]}
              padding={padding}
            />
            <VideoFace
              position={[0, 0, -0.5 - gap]}
              rotation={[0, Math.PI , 0]}
              texture={textures[1]}
              label={labels[1]}
              padding={padding}
            />
            <VideoFace
              position={[0, 0.5 + gap, 0]}
              rotation={[-Math.PI/2, 0 , 0]}
              texture={textures[2]}
              label={labels[2]}
              padding={padding}
            />
            
            <VideoFace
              position={[0, -0.5 - gap, 0]}
              rotation={[Math.PI/2, 0 , 0]}
              texture={textures[3]}
              label={labels[3]}
              padding={padding}
            />
            <VideoFace
              position={[0.5 + gap, 0, 0]}
              rotation={[0, Math.PI/2, 0]}
              texture={textures[4]}
              label={labels[4]}
              padding={padding}
            />
            <VideoFace
              position={[-0.5 - gap, 0, 0]}
              rotation={[0, -Math.PI/2, 0]}
              texture={textures[5]}
              label={labels[5]}
              padding={padding}
            />
          </group>
        }
      </>
    )
})
export default VideoCube