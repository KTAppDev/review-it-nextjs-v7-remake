"use client";
import { iProduct, iReview } from "@/app/util/Interfaces";
import Image from "next/legacy/image";
import RatingModuleMini from "./RatingModuleMini";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getReviews } from "../util/serverFunctions";
import { calculateAverageReviewRating } from "../util/calculateAverageReviewRating";
import LoadingSpinner from "./LoadingSpinner";
import { motion } from "framer-motion";
import { MdLocationOn, MdPhone } from "react-icons/md";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  product: iProduct;
  options: {
    size: string;
  };
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

const ProductCardSlim: React.FC<ProductCardProps> = ({ product, options }) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["reviews", product.id],
    queryFn: () => getReviews(product.id!),
    refetchOnWindowFocus: false,
  }) as any;

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <p className="text-sm text-red-500">{error.message}</p>;

  const reviews = data?.data.reviews as iReview[];
  const { roundedRating, roundedRatingOneDecimalPlace, numberOfReviews } =
    calculateAverageReviewRating(reviews) as unknown as iCalculatedRating;

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
      <Link href={`/reviews?id=${product.id}`}>
        <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow-md transition-all duration-150">
          <div className="flex gap-3">
            {/* Image */}
            {product.display_image && (
              <div className="flex-shrink-0">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                  <Image
                    src={product.display_image}
                    alt={`${product.name} Image`}
                    layout="fill"
                    objectFit="cover"
                    className="transition-transform duration-200 group-hover:scale-105"
                  />
                </div>
              </div>
            )}

            {/* Content */}
            <div className="flex-grow min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1">
                <div>
                  <h3 className="font-medium text-gray-900 line-clamp-1">
                    {product.name}
                  </h3>
                  
                  {product.address && (
                    <p className="text-sm text-gray-600 flex items-center mt-0.5">
                      <MdLocationOn className="shrink-0 mr-1" size={14} />
                      <span className="truncate">{product.address}</span>
                    </p>
                  )}
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1.5 sm:text-right">
                  {roundedRating ? (
                    <>
                      <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium text-white ${
                        ratingColors[roundedRating as keyof typeof ratingColors]
                      }`}>
                        {roundedRatingOneDecimalPlace}
                      </span>
                      <RatingModuleMini
                        name={product.id!}
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

              {/* Details */}
              <div className="mt-1 space-y-1">
                {product.description && (
                  <p className="text-sm text-gray-600 line-clamp-1">
                    {product.description}
                  </p>
                )}

                {product.telephone && (
                  <p className="text-sm text-gray-600 flex items-center">
                    <MdPhone className="shrink-0 mr-1" size={14} />
                    {product.telephone}
                  </p>
                )}

                {/* Tags */}
                {product.tags && product.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {product.tags.slice(0, 2).map((tag, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="px-1.5 py-0 text-xs font-normal bg-gray-100 text-gray-600"
                      >
                        {tag}
                      </Badge>
                    ))}
                    {product.tags.length > 2 && (
                      <span className="text-xs text-gray-500">
                        +{product.tags.length - 2} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCardSlim;
