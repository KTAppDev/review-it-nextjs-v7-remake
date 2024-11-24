"use client";
import { iReview } from "../util/Interfaces";
import ReviewBox from "./ReviewBox";
import { useQuery } from "@tanstack/react-query";
import { getLatestReviews } from "../util/serverFunctions";
import LoadingSpinner from "./LoadingSpinner";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Clock, Flame, Star, ThumbsUp } from "lucide-react";

type FilterType = "latest" | "popular" | "trending";

const TopReviews = () => {
  const [filter, setFilter] = useState<FilterType>("latest");
  const [visibleReviews, setVisibleReviews] = useState(6);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["latestReviews", filter],
    queryFn: () => getLatestReviews(),
    refetchOnWindowFocus: false,
  }) as any;

  if (isError) return <div>Error loading reviews</div>;

  let reviews = data?.reviews as iReview[] || [];

  const loadMore = () => {
    setVisibleReviews(prev => prev + 6);
  };

  const FilterButton = ({ type, icon, label }: { type: FilterType; icon: React.ReactNode; label: string }) => (
    <Button
      variant={filter === type ? "default" : "outline"}
      className="flex items-center gap-2"
      onClick={() => setFilter(type)}
    >
      {icon}
      {label}
    </Button>
  );

  if (isLoading) return <LoadingSpinner />;
  if (reviews.length === 0) return (
    <div className="text-center p-8">
      <p className="text-lg font-medium">No reviews yet</p>
      <p className="text-gray-500">Be the first to share your experience!</p>
    </div>
  );

  return (
    <div className="flex flex-col w-full h-full justify-center items-center space-y-6">
      <div className="w-full flex flex-col items-center space-y-4">
        <h1 className="text-2xl font-bold">Discover Reviews</h1>
        
        <div className="flex gap-4 flex-wrap justify-center">
          <FilterButton type="latest" icon={<Clock size={18} />} label="Latest" />
          <FilterButton type="popular" icon={<ThumbsUp size={18} />} label="Most Helpful" />
          <FilterButton type="trending" icon={<Flame size={18} />} label="Trending" />
        </div>
      </div>

      <div className="w-full grid mx-auto items-start justify-center grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
        {reviews.slice(0, visibleReviews).map((review, index) => (
          <ReviewBox key={index} review={review} />
        ))}
      </div>

      {visibleReviews < reviews.length && (
        <Button
          variant="outline"
          className="mt-8"
          onClick={loadMore}
        >
          Load More Reviews
        </Button>
      )}
    </div>
  );
};

export default TopReviews;
