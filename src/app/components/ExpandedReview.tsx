"use client";
import {
  useEffect,
  useMemo,
  useState,
  useCallback,
  lazy,
  Suspense,
} from "react";
import { useAtom } from "jotai";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import ReviewCard from "./ReviewCard";
import { currentReviewAtom, currentUserAtom } from "../store/store";
import { iReview, iComment } from "../util/Interfaces";
import {
  createCommentOnReview,
  createReplyOnComment,
  deleteComment,
  editComment,
  getReviews,
} from "../util/serverFunctions";
import LoadingSpinner from "./LoadingSpinner";
import CommentForm from "./CommentForm";
import DisplayError from "./DisplayError";
import ProductCard from "./ProductCard";
import useScrollToComment from "../util/UseScrollToComment";

const CommentList = lazy(() => import("./CommentList"));

const ExpandedReview = ({
  reviewId,
  productId,
  cId,
}: {
  reviewId: string;
  productId: string;
  cId: string;
}) => {
  const isCommentLoaded = useScrollToComment(cId, {
    maxAttempts: 10,
    intervalDuration: 500,
  });
  const { userId, isLoaded, isSignedIn } = useAuth();
  const queryClient = useQueryClient();
  const [reviewAtom] = useAtom(currentReviewAtom);
  const [isOpen, setIsOpen] = useState(true);
  const [textAreaValue, setTextAreaValue] = useState("");
  const [currentUser] = useAtom(currentUserAtom);
  const router = useRouter();
  const clerkUserId = userId as string;
  const [allReviews, setAllReviews] = useState<iReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [comment, setComment] = useState<iComment>({
    reviewId: "",
    body: "",
    createdDate: new Date(),
    user: currentUser,
    review: reviewAtom || ({} as iReview),
    userId: currentUser?.id || "",
    isDeleted: false,
  });

  const commentMutation = useMutation({
    mutationFn: async (comment: iComment) => {
      const data = createCommentOnReview(comment);
      toast.promise(data, {
        loading: "Loading...",
        success: () => "Comment saved successfully!",
        error: "Error saving comment",
      });
    },
    onMutate: (newData: iComment) => {
      queryClient.setQueryData<iReview | undefined>(
        ["review", reviewId],
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            comments: [
              ...(oldData.comments || []),
              { ...newData, user: currentUser, isDeleted: false },
            ],
          };
        },
      );
    },
    onError: (error: Error) => {
      <DisplayError error={error.message} />;
      console.error(error);
    },
  });

  const replyMutation = useMutation({
    mutationFn: async (reply: { parentId: string, body: string }) => {
      const data = await createReplyOnComment({
        ...comment,
        ...reply,
        id: Date.now().toString(),
        user: currentUser,
      });
      return data;
    }
  });

  const handleCommentSubmit = useCallback(
    async (newTextAreaValue: string) => {
      if (isLoaded && !isSignedIn) {
        router.push("/sign-in");
        return;
      }
      setTextAreaValue(newTextAreaValue);
      setIsOpen(!isOpen);
      commentMutation.mutate({ ...comment, body: newTextAreaValue });
    },
    [isLoaded, isSignedIn, router, isOpen, commentMutation, comment],
  );

  const handleReply = useCallback(
    async (parentId: string, body: string) => {
      try {
        await replyMutation.mutateAsync({ parentId, body });
      } catch (error) {
        console.error('Failed to add reply:', error);
      }
    },
    [replyMutation]
  );

  const handleEdit = async (commentId: string, body: string) => {
    editComment(commentId, body);
  };

  const handleDelete = async (commentId: string) => {
    const deleteResponse = await deleteComment(commentId);
    if (deleteResponse.success) {
      console.log(deleteResponse.success);
      toast.message("Comment successfully deleted!");
    } else {
      toast.error(deleteResponse.message);
    }
  };

  const { data, isPending, isError } = useQuery({
    queryKey: ["review", reviewId],
    queryFn: async () => {
      setIsLoading(true);
      if (reviewAtom !== null) {
        setIsLoading(false);
        return reviewAtom;
      }
      const data: any = await getReviews(productId);
      setIsLoading(false);
      setAllReviews(data.data.reviews);
      return data.data.reviews.find(
        (review: iReview) => review.id === reviewId,
      );
    },
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (data) {
      setComment((prevComment) => ({
        ...prevComment,
        reviewId: reviewId,
        body: textAreaValue,
        createdDate: new Date(),
        user: currentUser,
        review: reviewAtom || data,
        userId: currentUser?.id || "",
      }));
    }
  }, [data, textAreaValue, currentUser, reviewAtom, reviewId]);

  const sortedComments = useMemo(() => {
    return (
      data?.comments
        ?.slice()
        .sort(
          (a: iComment, b: iComment) =>
            new Date(b.createdDate!).valueOf() -
            new Date(a.createdDate!).valueOf(),
        ) || []
    );
  }, [data?.comments]);

  const reviewData = useMemo(() => {
    return reviewAtom || data;
  }, [reviewAtom, data]);

  useEffect(() => {
    if (isCommentLoaded) {
      console.log("Comment has been scrolled to");
    }
  }, [isCommentLoaded]);

  const productCardOptions = {
    showLatestReview: true,
    size: "rating-md",
    showWriteReview: true,
    showClaimThisProduct: true,
  };

  if (isPending || isLoading) return <LoadingSpinner />;
  if (isError) return <p>fetch error</p>;
  if (!reviewData) return null;

  return (
    <div className="flex flex-col w-full p-2 md:px-36 sm:pt-8 bg-myTheme-lightbg ">
      <div className="mb-4 w-full">
        <ProductCard
          product={reviewData?.product!}
          options={productCardOptions}
          reviews={allReviews}
          currentUserId={userId ? userId : null}
        />
      </div>
      <ReviewCard review={reviewData} />
      <CommentForm
        onSubmit={handleCommentSubmit}
        isOpen={isOpen}
        onClose={setIsOpen}
      />
      <div className="space-y-1 mt-2 gap-1 flex flex-col w-full justify-end items-end ">
        <h2>Comments</h2>
        {sortedComments.length > 0 ? (
          <Suspense fallback={<LoadingSpinner />}>
            <CommentList
              key={sortedComments.length}
              clerkUserId={clerkUserId}
              comments={sortedComments}
              onReply={handleReply}
              onEdit={handleEdit}
              onDelete={handleDelete}
              currentUser={currentUser}
            />
          </Suspense>
        ) : (
          <div>No comments yet</div>
        )}
      </div>
    </div>
  );
};

export default ExpandedReview;
