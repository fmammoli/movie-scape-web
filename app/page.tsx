import dynamic from "next/dynamic";

const Wrapper = dynamic(()=> import("@/components/Wrapper"), {ssr: false})


export default function Home() {
  return (
    <main className={"h-svh"}>
      <Wrapper></Wrapper>
    </main>
  );
}
