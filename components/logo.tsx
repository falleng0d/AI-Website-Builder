import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function Logo() {
  return (
    <Link href="/" className="flex w-full">
      <div className="flex w-full items-center justify-center">
        <div className="w-16 p-3">
          <Image src={"/vercel.svg"} alt="Logo" width={128} height={128} priority />
        </div>
      </div>
    </Link>
  );
}
