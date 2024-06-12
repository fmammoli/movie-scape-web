import dynamic from "next/dynamic";
import Image from "next/image";

const Wrapper = dynamic(()=> import("@/components/Wrapper"), {ssr: false})


export default function Home() {
  return (
    <main className={"h-svh"}>
      <div><Wrapper></Wrapper></div>
      
      <div className="absolute bottom-0 left-0 p-10">
        <p className={"font-black"}>Como utilizar:</p>
        <ul className="flex gap-8">
          <li className="">
            <p>1. Abra sua mão e aponte para a webcam.</p>
            <Image src={"/open_hand.png"} alt={""} width={100} height={100}></Image>
            
          </li>
          <li className="">
            <p>2. Com a mão aberta, junte seu dedo indicador ao dedão para fazer um formato de pinça.</p>
            <Image src={"/pinch.png"} alt={""} width={100} height={100}></Image>
          </li>
          <li>
            3. Mantenha a posição de pinça e mova sua mão para a direita ou para a esquerda para girar o cubo.
          </li>
          <li>
            <p>4. Obs. Os circulos verde e laranja mostram o rastreamento do seu dedo indicador e do dedão.</p>
            <p>Obs2. Você também pode mover o cubo com o mouse</p>
          </li>
        </ul>
        
      </div>
    </main>
  );
}
