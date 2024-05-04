// noinspection SpellCheckingInspection

import Link from "next/link";
import Version from "./Version";
import { sideLinks } from "@/app/util/links";
// interface LinksProps {
//   showHome?: boolean;
//
// }
//
const Links = ({ onSideLinkClick }: { onSideLinkClick: () => void }) => {
  return (
    <div className={`flex flex-col mt-20 flex-1 justify-start items-start`}>
      {sideLinks.map((link, index) => (
        <Link href={link.link} key={index}>
          <li
            onClick={() => {
              onSideLinkClick();
            }}
            className=" hover:text-myTheme-accent hover:bg-slate-100 duration-400 px-4 transition-all ease-in-out rounded-lg gap-6 py-2"
          >
            {link.name}
          </li>
        </Link>
      ))}
      <div className="flex flex-1 justify-center items-center">
        <Version />
      </div>
    </div>
  );
};

export default Links;
