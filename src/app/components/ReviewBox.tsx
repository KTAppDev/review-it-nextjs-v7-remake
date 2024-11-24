"use client";
import { useEffect, useState } from "react";
import { iReview } from "../util/Interfaces";
import Image from "next/legacy/image";
import DOMPurify from "dompurify";
import Link from "next/link";
import RatingModuleReadOnly from "./RatingModuleReadOnly";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import ReviewStats from "./ReviewStats";
import { useAtom } from "jotai";
import { currentReviewAtom } from "../store/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MessageSquare, 
  ThumbsUp, 
  Share2, 
  Bookmark,
  Tag
} from "lucide-react";
import { motion } from "framer-motion";

dayjs.extend(relativeTime);

interface ReviewBoxProps {
  review: iReview;
}

const ReviewBox: React.FC<ReviewBoxProps> = ({ review }) => {
  const [reviewAtom, setReview] = useAtom(currentReviewAtom);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const truncatedBody = review.body.length > 150 
    ? `${review.body.slice(0, 150)}...` 
    : review.body;

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsBookmarked(!isBookmarked);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (navigator.share) {
      try {
        await navigator.share({
          title: review.title,
          text: `Check out this review of ${review.product?.name}`,
          url: `${window.location.origin}/fr?id=${review?.id}&productid=${review?.product?.id}`,
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    }
  };

  // Animation variants for the card
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    hover: {
      y: -5,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <motion.div 
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-lg transition-all duration-200 w-full relative group"
    >
      {/* Header Section */}
      <div className="flex items-start space-x-4 mb-4">
        <Link href={`/userprofile/${review?.user?.id}`} className="flex-shrink-0">
          <div className="relative w-12 h-12">
            <Image
              src={review.user?.avatar!}
              alt={`${review.user?.userName}'s avatar`}
              layout="fill"
              className="rounded-full object-cover ring-2 ring-myTheme-primary/20"
            />
          </div>
        </Link>
        
        <div className="flex-grow min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Link
              href={`/userprofile/${review?.user?.id}`}
              className="font-semibold text-myTheme-reviewBlue hover:underline truncate max-w-[150px]"
            >
              @{review.user?.userName}
            </Link>
            <span className="text-gray-400">•</span>
            <span className="text-sm text-gray-500" title={dayjs(review?.createdDate?.toString()).format("MMMM D, YYYY h:mm A")}>
              {dayjs(review?.createdDate).fromNow()}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <RatingModuleReadOnly
              name={review.id!}
              rating={review.rating}
              size="rating-sm"
            />
            <ReviewStats review={review} setReview={() => setReview(review)} />
          </div>
        </div>
      </div>

      {/* Product Link & Tags */}
      <div className="mb-4">
        <Link
          href={`/reviews?id=${review?.product?.id}`}
          className="inline-flex items-center gap-2 text-lg font-medium text-gray-900 hover:text-myTheme-primary transition-colors"
        >
          {review.product?.name}
        </Link>
        <div className="flex flex-wrap items-center gap-1.5 mt-2">
          <Tag size={12} className="text-gray-400" />
          {review.product?.tags.slice(0, 3).map((tag, index) => (
            <Badge 
              key={index} 
              variant="secondary" 
              className="px-2 py-0 text-xs font-normal bg-gray-100 text-gray-600"
            >
              {tag}
            </Badge>
          ))}
          {review.product?.tags?.length! > 3 && (
            <span className="text-xs text-gray-500">
              +{review.product?.tags?.length! - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Review Content */}
      <motion.div
        initial={false}
        animate={{ height: isExpanded ? "auto" : "auto" }}
        className="overflow-hidden"
      >
        <h3 className="font-semibold text-gray-800 mb-3">
          {review.title}
        </h3>
        
        <div
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(isExpanded ? review.body : truncatedBody),
          }}
          className={`text-gray-600 mb-4 ${isExpanded ? '' : 'line-clamp-3'}`}
        />
      </motion.div>

      {review.body.length > 150 && (
        <Button
          variant="ghost"
          className="text-sm text-myTheme-primary hover:text-myTheme-secondary -mt-2 mb-2"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'Show less' : 'Read more'}
        </Button>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-4">
          <Link
            href={`/fr?id=${review?.id}&productid=${review?.product?.id}`}
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-myTheme-primary transition-colors"
          >
            <MessageSquare size={16} />
            <span>Comment</span>
          </Link>
          
          <button
            onClick={handleBookmark}
            className={`inline-flex items-center gap-2 text-sm transition-colors ${
              isBookmarked ? 'text-myTheme-primary' : 'text-gray-500 hover:text-myTheme-primary'
            }`}
          >
            <Bookmark size={16} className={isBookmarked ? 'fill-current' : ''} />
            <span>Save</span>
          </button>
          
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-myTheme-primary transition-colors"
          >
            <Share2 size={16} />
            <span>Share</span>
          </button>
        </div>

        <Link
          href={`/fr?id=${review?.id}&productid=${review?.product?.id}`}
          className="bg-myTheme-primary text-white text-sm font-medium hover:bg-myTheme-secondary px-4 py-2 rounded-full transition-colors duration-200"
        >
          Full review
        </Link>
      </div>
    </motion.div>
  );
};

export default ReviewBox;
