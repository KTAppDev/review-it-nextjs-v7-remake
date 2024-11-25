"use client";
import { iProduct, iReview } from "../util/Interfaces";
import { useQuery } from "@tanstack/react-query";
import { getReviews } from "../util/serverFunctions";
import LoadingSpinner from "./LoadingSpinner";
import ProductCard from "./ProductCard";
import ProductCardExtended from "./ProductCardExtended";
import "dayjs/locale/en"; // Import the English locale
import ReviewCard from "./ReviewCard";
import Link from "next/link";
import WriteAReview from "./WriteAReview";
import ReviewsSummary from "@/components/reviews-summary";
import { CompanyActivityCard } from "@/components/company-activity-card";
import { useAuth } from "@clerk/nextjs";

const Reviews = ({ productId }: { productId: string }) => {
  const { userId } = useAuth();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["reviews", productId],
    queryFn: () => getReviews(productId),
    refetchOnWindowFocus: false,
  }) as any;

  const productCardOptions = {
    showLatestReview: false,
    size: "rating-sm",
    showWriteReview: true,
    showClaimThisProduct: true,
  };

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <p>{error?.toString()}</p>;
  const reviews = data?.data.reviews as iReview[];
  const product = data.data.product as iProduct;

  if (reviews.length === 0) {
    return (
      <div className="flex flex-col w-full h-full p-2  sm:pt-8 ">
        <div className="flex w-full">
          <ProductCardExtended
            options={productCardOptions}
            reviews={reviews}
            product={product}
          />
        </div>
        <Link
          href={`/cr?id=${productId}&rating=3`}
          className="text-center underline"
        >
          No reviews yet click here to add one
        </Link>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center w-full h-full p-2 sm:pt-8">
      <div className="w-full max-w-4xl mx-auto">
        <ProductCard
          reviews={reviews}
          options={productCardOptions}
          product={product}
          currentUserId={userId ? userId : null}
        />
      </div>
      <div className="flex flex-col md:flex-row w-full md:max-w-4xl mx-auto ">
        <CompanyActivityCard />
        <ReviewsSummary reviews={reviews} />
      </div>
      <div className="flex flex-col md:w-1/2 md:flex-row w-full mx-auto justify-center items-center ">
        <WriteAReview />
      </div>
      <div className="flex flex-col  w-full justify-between items-center ">
        <div className="space-y-4 mt-2 w-full md:w-1/2  ">
          {reviews.map((review: iReview) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reviews;
