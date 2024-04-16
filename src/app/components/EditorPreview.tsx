"use client";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment, Suspense, useState } from "react";
import parse from "html-react-parser";
import RatingModule from "./RatingModule";
import { iReview } from "../util/Interfaces";
import { useUser } from "@clerk/nextjs";

interface editorPreviewProps {
  reviewData: iReview;
}

const EditorPreview = ({ reviewData }: editorPreviewProps) => {
  const { user } = useUser();

  const handleParse = (node: any): any => {
    //in the html i get two p tags when should be <br> so i manually replace the empty p tags
    if (
      node.type === "tag" &&
      node.name === "p" &&
      (!node.children || node.children.length === 0)
    ) {
      // If empty <p> tag, replace it with a newline
      return <br />;
    }
    return undefined; // Return undefined to keep the default behavior
  };

  const options = {
    replace: handleParse,
  };

  let [isOpen, setIsOpen] = useState(false);

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  return (
    <div className="flex flex-col w-full">
      <button
        type="button"
        onClick={openModal}
        className=" bg-myTheme-accent hover:bg-myTheme-secondary text-white font-base p-2 rounded-md w-full"
      >
        Preview
      </button>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-2 text-center w-full">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className=" w-full md:w-1/2 transform overflow-hidden rounded-2xl dark:bg-myTheme-niceGrey bg-white p-2 text-left align-middle shadow-xl transition-all flex flex-col items-center justify-center">
                  <Dialog.Title>Preview</Dialog.Title>
                  <div className="flex flex-col flex-1 w-full overflow-hidden dark:bg-myTheme-niceGrey p-2 rounded-md md:w-full bg-white  items-center justify-center">
                    <h1 className="font-bold underline text-center ">
                      {parse(reviewData.title)}
                    </h1>

                    {reviewData.title && (
                      <div className="font-extralight text-xs italic no-underline pl-2 text-center">
                        by {user?.username}
                      </div>
                    )}

                    {reviewData.title && (
                      <div className="flex flex-1 justify-center mt-2 mb-2">
                        <Suspense fallback={<div>Loading...</div>}>
                          <RatingModule
                            name="rating"
                            rating={reviewData.rating}
                            ratingChanged={() => {}}
                            size={"rating-xs"}
                          />
                        </Suspense>
                      </div>
                    )}

                    <div className=" text-start">
                      {parse(reviewData.body, options)}
                    </div>
                  </div>

                  <div className="mt-4">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent px-2 py-1 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:text-myTheme-accent dark:bg-myTheme-secondary"
                      onClick={closeModal}
                    >
                      Close
                    </button>
                    <div className="z-50"></div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default EditorPreview;
