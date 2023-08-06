// noinspection GrazieInspection
"use client"; // only way to stop the hydration error and i don't understand
import HomeLink from "./HomeLink";
import TopLinks from "./TopLinks";
import SideLinks from "./SideLinks";
import NavbarAuth from "./NavbarAuth";
import { Suspense } from "react";
import Image from "next/image";

const Navbar = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="drawer sticky top-0 z-20">
      <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col">
        <div className="w-full navbar bg-myTheme-light dark:bg-myTheme-dark z-10">
          <div className="flex-none lg:hidden">
            <label htmlFor="my-drawer-3" className="btn btn-square btn-ghost">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="inline-block w-6 h-6 stroke-current"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                ></path>
              </svg>
            </label>
          </div>
          <div className="flex-1 px-2 mx-2">
            <HomeLink />
            <div className="flex-none hidden lg:block">
              <div className="hidden md:flex flex-1 font-normal items-center justify-center text-center ml-4">
                <ul className="menu menu-horizontal">
                  <TopLinks />
                </ul>
              </div>
            </div>
          </div>
          <div className="mx-4">
            <Suspense
              fallback={
                <Image src="/logo.png" alt="loading" width={50} height={50} />
              }
            >
              <NavbarAuth />
            </Suspense>
          </div>
        </div>
        {children}
      </div>
      <div className="drawer-side ">
        <label htmlFor="my-drawer-3" className="drawer-overlay"></label>
        <ul className="menu p-4 w-64 bg-base-100">
          <HomeLink />
          <SideLinks />
        </ul>
      </div>
    </div>
  );
};

export default Navbar;
