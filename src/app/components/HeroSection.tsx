import Image from "next/legacy/image";
import SearchBoxAndListener from "./SearchBoxAndListener";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PenLine } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative h-[500px] sm:h-[400px] lg:h-[500px] w-full">
      <Image
        src="/hero1.jpg"
        alt="Background Image"
        layout="fill"
        className="fixed inset-0 object-cover object-center"
        quality={75}
        priority
      />
      <div className="flex justify-center items-center absolute top-0 left-0 right-0 bottom-0 text-center text-white bg-opacity-60 bg-myTheme-neutral backdrop-blur-[2px]">
        <div className="flex flex-1 justify-center flex-col">
          <div className="flex flex-1 justify-center">
            <div className="flex flex-col h-full w-11/12 sm:w-7/12 py-8 sm:py-12">
              <div className="flex-1">
                <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-white">
                  Discover & Share Authentic Reviews
                </h1>
                <p className="text-lg sm:text-xl mt-1 font-normal pb-1 text-white">
                  Your trusted platform for honest opinions on anything and everything.
                </p>
                <p className="text-lg sm:text-xl mt-0 font-normal pb-4 text-myTheme-light">
                  Join thousands of reviewers sharing their experiences.
                </p>
              </div>
              
              <div className="flex flex-col justify-end space-y-6">
                <form className="flex w-full">
                  <div className="relative w-full">
                    <SearchBoxAndListener />
                  </div>
                </form>
                
                <div className="flex flex-wrap justify-center gap-4 sm:gap-8 text-sm text-white/80">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">1000+</span> Reviews
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">500+</span> Products
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">100+</span> Categories
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
