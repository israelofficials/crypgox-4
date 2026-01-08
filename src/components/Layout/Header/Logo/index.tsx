import Image from "next/image";
import Link from "next/link";

const Logo: React.FC = () => {
  return (
    <Link href="/" className="flex items-center gap-0.5">
      <Image
        src="/images/logo/logo.svg"
        alt="logo"
        width={135}
        height={32}
        style={{ width: "auto", height: "auto" }}
        quality={100}
      />
      <span className="text-white text-xl font-bold">X</span>
    </Link>
  );
};

export default Logo;
