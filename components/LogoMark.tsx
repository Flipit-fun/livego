import Image from "next/image";

export default function LogoMark({ size = 26 }: { size?: number }) {
  return (
    <Image
      src="/logo.png"
      alt="Livego logo"
      width={size}
      height={size}
      className="brand-logo"
      priority
    />
  );
}
