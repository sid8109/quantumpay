"use client";

import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  onClick: () => void;
}

export const Button = ({ onClick, children }: ButtonProps) => {
  return (
    <button onClick={onClick} type="button" className="w-full py-2 px-5 rounded-md bg-[#00baf2] text-white hover:bg-[#0095c4]">
      {children}
    </button>
  );
};
