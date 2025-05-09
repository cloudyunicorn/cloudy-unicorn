import Image from 'next/image';
import React from 'react';
import logoBlack from '@/assets/Logo/logo.png';
import logoWhite from '@/assets/Logo/vector/default-monochrome-white.svg';

const Logo = ({ height = 40 }: { height?: number }) => {
  return (
    <div className="flex items-center gap-4">
      {/* Light mode logo */}
      <Image
        src={logoBlack}
        alt="Cloudy Unicorn"
        height={height}
        // className="block dark:hidden"
      />
      {/* Dark mode logo */}
      {/* <Image
        src={logoWhite}
        alt="Cloudy Unicorn"
        height={height}
        className="hidden dark:block"
      /> */}
      <p className="text-xl font-semibold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
        Cloudy Unicorn
      </p>
    </div>
  );
};

export default Logo;
