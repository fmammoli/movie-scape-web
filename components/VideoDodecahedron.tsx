import { forwardRef, ReactNode, Ref, useState } from "react";
import { DodecahedronGeometry, Euler, Group, Quaternion, Vector3, VideoTexture } from "three";
import VideoFace from "./VideoFace";
import { Dodecahedron, Plane } from "@react-three/drei";

type VideoFaceCubeProps = {
    padding:number
}

const VideoCube = forwardRef(function VideoDodecahedron({padding}:VideoFaceCubeProps, ref:Ref<Group>){
  
  function buildVideoTexture(){
    const videos = [
     "/videos/aurora0.mp4",
     "/videos/aurora1.mp4",
     "/videos/aurora2.mp4",
     "/videos/aurora3.mp4",
     "/videos/aurora4.mp4",
     "/videos/silent_movie0.mp4",
     "/videos/silent_movie1.mp4",
     "/videos/silent_movie2.mp4",
     "/videos/silent_movie3.mp4",
     "/videos/silent_movie4.mp4",
     "/videos/silent_movie5.mp4",
     "/videos/silent_movie6.mp4",
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
    
    const gap = 0
    
    return (
        <>
        {
          <group ref={ref}>
            
{/*             
            
            <VideoFace
              position={[0, 0, 1]}
              rotation={[0, 0, 0]}
              texture={textures[0]}
              label={labels[0]}
              padding={padding}
            />
             
             <VideoFace
              position={[0, 1 + gap, 0.5]}
              rotation={[-Math.PI/4, 0, 0]}
              texture={textures[0]}
              label={labels[0]}
              padding={padding}
            />
            
            <VideoFace
              position={[0, - 1 - gap, 0.5]}
              rotation={[Math.PI/4, 0, 0]}
              texture={textures[1]}
              label={labels[0]}
              padding={padding}
            />

            <VideoFace
              position={[1 + gap, 0, 0.5]}
              rotation={[0, Math.PI/4, 0]}
              texture={textures[2]}
              label={labels[0]}
              padding={padding}
            />
            <VideoFace
              position={[- 1 - gap, 0, 0.5]}
              rotation={[0, -Math.PI/4, 0]}
              texture={textures[3]}
              label={labels[0]}
              padding={padding}
            />

          
            <VideoFace
              position={[0, 0, -1]}
              rotation={[0, Math.PI, 0]}
              texture={textures[4]}
              label={labels[0]}
              padding={padding}
            />
            <VideoFace
              position={[0, 1 + gap, -0.5]}
              rotation={[Math.PI/4, 0, 0]}
              texture={textures[5]}
              label={labels[0]}
              padding={padding}
            />
            <VideoFace
              position={[0, - 1 - gap, -0.5]}
              rotation={[-Math.PI/4, 0, 0]}
              texture={textures[6]}
              label={labels[0]}
              padding={padding}
            />
             <VideoFace
              position={[1 + gap, 0, -0.5]}
              rotation={[0, -Math.PI/4, 0]}
              texture={textures[7]}
              label={labels[0]}
              padding={padding}
            />
            <VideoFace
              position={[- 1 - gap, 0, -0.5]}
              rotation={[0, Math.PI/4, 0]}
              texture={textures[8]}
              label={labels[0]}
              padding={padding}
            /> */}

          </group>
        }
      </>
    )
})
export default VideoCube