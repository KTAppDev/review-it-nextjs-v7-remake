/**
 * The ProductCard component is a React component that displays information about a product,
 * including its image, name, address/description, rating, and number of reviews.
 *
 * The component can work in two modes:
 * 1. If the `reviews` prop is provided, it will use those reviews to calculate the rating
 *    and display the product information. In this case, the product data is taken from
 *    the first review in the `reviews` array.
 * 2. If the `reviews` prop is not provided, it will fetch the reviews from the server
 *    using the `useQuery` hook from `@tanstack/react-query`. The product data is taken
 *    from the `product` prop in this case.
 *
 * The component also handles the following options:
 * - `showLatestReview`: Whether to show the link to the latest review.
 * - `size`: The size of the rating stars.
 * - `showWriteReview`: Whether to show the "Write Review" link.
 * - `showClaimThisProduct`: Whether to show the "Claim this product" link.
 *
 * The component renders a card-like UI with the product image, name, address/description,
 * rating stars, and other relevant information. It also includes a "Write Review" link
 * that navigates to a review creation page with a pre-set rating of 3 stars.
 */
"use client";
import {
  iProduct,
  iReview,
  iCalculatedRating,
  iUser,
} from "@/app/util/Interfaces";
import Image from "next/legacy/image";
import RatingModuleReadOnly from "./RatingModuleReadOnly";
import Link from "next/link";
import { calculateAverageReviewRating } from "../util/calculateAverageReviewRating";
import VerticalLinks from "./VerticalLinks";
import { useRouter } from "next/navigation";
import ClaimProductComponent from "./ClaimProductComponent";
import { motion } from "framer-motion";
import {
  MdEmail,
  MdPhone,
  MdLanguage,
  MdAccessTime,
  MdLocationOn,
  MdCalendarToday,
  MdEdit,
  MdReport,
} from "react-icons/md";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
  reviews?: iReview[] | null;
  options: {
    showLatestReview: boolean;
    size: string;
    showWriteReview: boolean;
    showClaimThisProduct: boolean;
  };
  product?: iProduct | null;
  currentUserId: string | null;
}

const ratingColors = {
  1: "bg-red-500",
  2: "bg-orange-500",
  3: "bg-yellow-500",
  4: "bg-green-400",
  5: "bg-green-600",
};

const ProductCard: React.FC<ProductCardProps> = ({
  reviews,
  options,
  product,
  currentUserId,
}) => {
  if (!product) return <div>No product or reviews found</div>;
  
  const currentProduct = reviews && reviews.length > 0 ? reviews[0].product : product;
  const allReviews = product.reviews || (reviews as iReview[]);
  const ratingResult = calculateAverageReviewRating(allReviews);
  const amITheOwner = product.business?.ownerId === currentUserId;

  function isCalculatedRating(result: any): result is iCalculatedRating {
    return (
      typeof result === "object" &&
      "roundedRating" in result &&
      "roundedRatingOneDecimalPlace" in result &&
      "numberOfReviews" in result
    );
  }

  let roundedRating = 0;
  let roundedRatingOneDecimalPlace = "0";
  let numberOfReviews = 0;

  if (isCalculatedRating(ratingResult)) {
    roundedRating = ratingResult.roundedRating;
    roundedRatingOneDecimalPlace = ratingResult.roundedRatingOneDecimalPlace.toString();
    numberOfReviews = ratingResult.numberOfReviews;
  } else if (typeof ratingResult === "number") {
    roundedRating = ratingResult;
    roundedRatingOneDecimalPlace = ratingResult.toFixed(1);
    numberOfReviews = allReviews?.length;
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    },
    hover: {
      y: -2,
      transition: {
        duration: 0.15,
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.div 
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className="w-full"
    >
      <div className="w-full max-w-4xl bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-150">
        <Link
          href={`/reviews?id=${currentProduct?.id}`}
          className="block p-4"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Image Section */}
            {currentProduct?.display_image && (
              <div className="flex-shrink-0">
                <div className="relative w-full sm:w-24 h-24 rounded-lg overflow-hidden">
                  <Image
                    src={currentProduct.display_image}
                    alt={`${currentProduct.name} Image`}
                    layout="fill"
                    objectFit="cover"
                    className="transition-transform duration-200 group-hover:scale-105"
                  />
                </div>
              </div>
            )}

            {/* Content Section */}
            <div className="flex-grow min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 break-words">
                    {currentProduct?.name}
                  </h2>
                  <p className="text-sm text-gray-600 flex items-center mt-1">
                    <MdLocationOn className="shrink-0 mr-1" /> 
                    <span className="truncate">{currentProduct?.address}</span>
                  </p>
                </div>

                {/* Rating Section */}
                <div className="flex items-center gap-2 sm:text-right">
                  {allReviews?.length > 0 ? (
                    <>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${
                        ratingColors[roundedRating as keyof typeof ratingColors]
                      }`}>
                        {roundedRatingOneDecimalPlace}
                      </span>
                      <RatingModuleReadOnly
                        name={currentProduct?.id!}
                        rating={roundedRating}
                        size={options.size}
                      />
                      <span className="text-xs text-gray-500">
                        ({numberOfReviews})
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-gray-500">No reviews yet</span>
                  )}
                </div>
              </div>

              {/* Details Section */}
              <div className="mt-3 space-y-2">
                {currentProduct?.openingHrs && currentProduct?.closingHrs && (
                  <p className="text-sm text-gray-600 flex items-center">
                    <MdAccessTime className="shrink-0 mr-1" /> 
                    {currentProduct.openingHrs} - {currentProduct.closingHrs}
                  </p>
                )}

                <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                  {currentProduct?.telephone && (
                    <span className="flex items-center">
                      <MdPhone className="shrink-0 mr-1" /> {currentProduct.telephone}
                    </span>
                  )}
                  {currentProduct?.email && (
                    <span className="flex items-center">
                      <MdEmail className="shrink-0 mr-1" /> {currentProduct.email}
                    </span>
                  )}
                </div>

                {currentProduct?.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {currentProduct.description}
                  </p>
                )}

                {/* Tags Section */}
                {currentProduct?.tags && currentProduct.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {currentProduct.tags.slice(0, 3).map((tag, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="px-2 py-0 text-xs font-normal bg-gray-100 text-gray-600"
                      >
                        {tag}
                      </Badge>
                    ))}
                    {currentProduct.tags.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{currentProduct.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Link>

        {/* Footer Section */}
        <div className="border-t border-gray-100 p-4 mt-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {currentProduct?.website && currentProduct.website.length > 0 && (
                <a
                  href={currentProduct.website[0]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center transition-colors"
                >
                  <MdLanguage className="mr-1" /> Website
                </a>
              )}
              <span className="text-xs text-gray-500 flex items-center">
                <MdCalendarToday className="mr-1" /> 
                Added: {new Date(currentProduct?.createdDate!).toLocaleDateString()}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {options.showClaimThisProduct && !amITheOwner && currentProduct && (
                <ClaimProductComponent product={currentProduct} />
              )}
              {options.showWriteReview && (
                <Link href={`/cr/?id=${currentProduct?.id}&rating=3`}>
                  <Button 
                    variant="default" 
                    size="sm"
                    className="flex items-center gap-1 bg-black hover:bg-gray-800 text-white"
                  >
                    <MdEdit size={16} />
                    Write Review
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
