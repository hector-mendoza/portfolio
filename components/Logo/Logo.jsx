import Image from "next/image";

const Logo = () => {
    return (
        <Image src="/HM-Black-Tipography.png"
            width={140}
            height={140}
            alt="HM - Logo"
            className="fixed top-0 left-1/2 transform -translate-x-1/2 z-10 p-4"
        />
    )
}

export default Logo