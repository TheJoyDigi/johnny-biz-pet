import Image from "next/image";

export default function FloatingYogaDog() {
  return (
    <div
      className="absolute right-4 md:right-16 -top-12 md:-top-16 z-10 w-[140px] h-[140px] md:w-[180px] md:h-[180px]"
    >
      <Image
        src="/yoga-dog.png"
        alt="Yoga Dog"
        width={180}
        height={180}
        className="drop-shadow-lg"
      />
    </div>
  );
}
