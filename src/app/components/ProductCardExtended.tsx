"use client";
import { iProduct, iReview } from "@/app/util/Interfaces";
import Image from "next/legacy/image";
import RatingModuleReadOnly from "./RatingModuleReadOnly";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getReviews } from "../util/serverFunctions";
import { calculateAverageReviewRating } from "../util/calculateAverageReviewRating";
import LoadingSpinner from "./LoadingSpinner";
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
  MdVerified
} from 'react-icons/md';
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
}

interface iCalculatedRating {
  roundedRating: number;
  roundedRatingOneDecimalPlace: number;
  numberOfReviews: number;
}

const ratingColors = {
  1: "bg-red-500",
  2: "bg-orange-500",
  3: "bg-yellow-500",
  4: "bg-lime-500",
  5: "bg-green-500",
};

const ProductCardExtended: React.FC<ProductCardProps> = ({
  reviews,
  options,
  product,
}) => {
  const router = useRouter();
  const currentProduct = reviews && reviews.length > 0 ? reviews[0].product : product;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["reviews", currentProduct?.id],
    queryFn: () => getReviews(currentProduct?.id!),
    refetchOnWindowFocus: false,
    enabled: !!currentProduct && !reviews,
  }) as any;

  const allReviews = reviews || data?.data.reviews || [];

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <p className="text-sm text-red-500">{error.message}</p>;

  const { roundedRating, roundedRatingOneDecimalPlace, numberOfReviews } =
    calculateAverageReviewRating(allReviews) as unknown as iCalculatedRating;

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
        <div className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Image Section */}
            {currentProduct?.display_image && (
              <div className="flex-shrink-0">
                <div className="relative w-full sm:w-32 h-32 rounded-lg overflow-hidden">
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
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold text-gray-900 break-words">
                      {currentProduct?.name}
                    </h2>
                    {currentProduct?.business && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                        <MdVerified className="mr-1" size={14} />
                        Verified Business
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 flex items-center mt-1">
                    <MdLocationOn className="shrink-0 mr-1" /> 
                    <span className="truncate">{currentProduct?.address}</span>
                  </p>
                </div>

                {/* Rating Section */}
                <div className="flex items-center gap-2 sm:text-right">
                  {allReviews.length > 0 ? (
                    <>
                      <span className={`px-2 py-1 rounded-full text-sm font-medium text-white ${
                        ratingColors[roundedRating as keyof typeof ratingColors]
                      }`}>
                        {roundedRatingOneDecimalPlace}
                      </span>
                      <RatingModuleReadOnly
                        name={currentProduct?.id!}
                        rating={roundedRating}
                        size={options.size}
                      />
                      <span className="text-sm text-gray-500">
                        ({numberOfReviews} reviews)
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-gray-500">No reviews yet</span>
                  )}
                </div>
              </div>

              {/* Details Section */}
              <div className="mt-4 space-y-2">
                {currentProduct?.openingHrs && currentProduct?.closingHrs && (
                  <p className="text-sm text-gray-600 flex items-center">
                    <MdAccessTime className="shrink-0 mr-1" /> 
                    Hours: {currentProduct.openingHrs} - {currentProduct.closingHrs}
                  </p>
                )}

                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
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
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {currentProduct.description}
                  </p>
                )}

                {/* Tags Section */}
                {currentProduct?.tags && currentProduct.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {currentProduct.tags.slice(0, 4).map((tag, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="px-2 py-0.5 text-xs font-normal bg-gray-100 text-gray-600"
                      >
                        {tag}
                      </Badge>
                    ))}
                    {currentProduct.tags.length > 4 && (
                      <span className="text-xs text-gray-500">
                        +{currentProduct.tags.length - 4} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <div className="border-t border-gray-100 p-4 bg-gray-50 rounded-b-lg">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {currentProduct?.website && currentProduct.website.length > 0 && (
                <a
                  href={currentProduct.website[0]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center transition-colors"
                >
                  <MdLanguage className="mr-1" /> Visit Website
                </a>
              )}
              <span className="text-sm text-gray-500 flex items-center">
                <MdCalendarToday className="mr-1" /> 
                Added: {new Date(currentProduct?.createdDate!).toLocaleDateString()}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {options.showClaimThisProduct && currentProduct?.businessId === null && (
                <ClaimProductComponent product={currentProduct} />
              )}
              {options.showWriteReview ? (
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
              ) : (
                <Button 
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 text-red-600 hover:text-red-700"
                >
                  <MdReport size={16} />
                  Report Product
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCardExtended;
