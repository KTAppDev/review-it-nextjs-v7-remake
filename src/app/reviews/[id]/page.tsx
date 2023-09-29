
import Reviews from "@/app/components/Reviews";

export default function CreateReview({ params }: { params: { id: string } }) {
  // get params from url
  return (
    <div className="flex flex-col bg-myTheme-lightbg dark:bg-myTheme-dark  w-full items-center justify-start">
      <Reviews productId={params.id} />
    </div>
  );
}
