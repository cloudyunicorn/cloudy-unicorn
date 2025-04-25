import Image from 'next/image';
import React from 'react';
import logoBlack from '@/assets/Logo/vector/default-monochrome-black.svg';
import logoWhite from '@/assets/Logo/vector/default-monochrome-white.svg';

const Logo = ({ height = 40 }: { height?: number }) => {
  return (
    <>
      {/* Light mode logo */}
      <Image
        src={logoBlack}
        alt="CyberSculpt"
        height={height}
        className="block dark:hidden"
      />
      {/* Dark mode logo */}
      <Image
        src={logoWhite}
        alt="CyberSculpt"
        height={height}
        className="hidden dark:block"
      />
    </>
  );
};

export default Logo;
