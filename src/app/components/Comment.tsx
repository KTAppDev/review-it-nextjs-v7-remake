import React, { useState, useEffect, ReactNode } from "react";
import { iComment, iUser } from "../util/Interfaces";
import dayjs from "dayjs";
import Link from "next/link";
import {
  ReplyIcon,
  SaveIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import OptionsMenu from "./CommentOptionsMenu";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";

interface CommentProps {
  comment: iComment;
  onReply: (parentId: string, body: string) => Promise<void>;
  onEdit: (commentId: string, body: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  depth: number;
  children?: ReactNode;
  clerkUserId: string;
  currentUser: iUser;
}

const MAX_VISIBLE_DEPTH = 5;

const Comment: React.FC<CommentProps> = ({
  comment: initialComment,
  onReply,
  onEdit,
  onDelete,
  depth = 0,
  clerkUserId,
  currentUser,
}) => {
  const { userId } = useAuth();
  const [comment, setComment] = useState(initialComment);
  const [isEditing, setIsEditing] = useState(false);
  const [editedBody, setEditedBody] = useState(comment.body);
  const [showFullComment, setShowFullComment] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [replyBody, setReplyBody] = useState("");
  const [replies, setReplies] = useState<iComment[]>(comment.replies || []);
  const [showReplies, setShowReplies] = useState(depth < MAX_VISIBLE_DEPTH);

  const isCommentOwner = clerkUserId === comment.user.clerkUserId;
  const canReply = clerkUserId && clerkUserId !== comment.user.clerkUserId;

  useEffect(() => {
    setComment(initialComment);
    setEditedBody(initialComment.body);
    setReplies(initialComment.replies || []);
  }, [initialComment]);

  const handleReply = async () => {
    if (comment.id && canReply) {
      const newReply: iComment = {
        id: Date.now().toString(),
        body: replyBody,
        user: currentUser,
        createdDate: new Date(),
        review: comment.review,
        parentId: comment.id,
        userId: userId as string,
        isDeleted: false,
        reviewId: comment.reviewId,
        replies: [],
      };

      // Optimistically update the UI
      const updatedReplies = [...replies, newReply];
      setReplies(updatedReplies);
      setIsReplying(false);
      setReplyBody("");
      setShowReplies(true);

      try {
        // Call the API
        await onReply(comment.id, replyBody);
      } catch (error) {
        // If the API call fails, revert the optimistic update
        setReplies(replies);
        setIsReplying(true);
        setReplyBody(replyBody);
        toast.error("Failed to add reply. Please try again.");
      }
    }
  };

  const handleEdit = () => {
    if (comment.id && isCommentOwner) {
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    if (comment.id && isCommentOwner) {
      await onEdit(comment.id, editedBody);
      const updatedComment = { ...comment, body: editedBody };
      setComment(updatedComment);
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    if (
      comment.id &&
      isCommentOwner &&
      window.confirm("Are you sure you want to delete this comment?")
    ) {
      await onDelete(comment.id);
      const deletedComment = {
        ...comment,
        isDeleted: true,
        body: "This comment has been deleted",
        user: {
          ...comment.user,
          userName: "Deleted User",
          avatar: "/deleted-user.svg",
        },
      };
      setComment(deletedComment);
    }
  };

  const toggleReplies = () => {
    setShowReplies(!showReplies);
  };

  const renderReplies = () => {
    if (!replies || replies.length === 0) return null;
    return (
      <div
        className={`mt-2 ${depth >= MAX_VISIBLE_DEPTH - 1 ? "border-l border-gray-200 pl-2" : "ml-4"}`}
      >
        {replies.map((reply) => (
          <Comment
            clerkUserId={clerkUserId}
            key={reply.id}
            comment={reply}
            onReply={onReply}
            onEdit={onEdit}
            onDelete={onDelete}
            depth={depth + 1}
            currentUser={currentUser}
          />
        ))}
      </div>
    );
  };

  return (
    <div
      id={comment.id}
      className={`w-full bg-white border-b border-l border-gray-200 p-3 ${depth > 0 ? "ml-2" : ""}`}
    >
      <div className="flex items-start space-x-2">
        <Avatar className="w-6 h-6">
          <AvatarImage
            src={comment.user?.avatar || "/default-avatar.png"}
            alt={`${comment.user?.firstName} ${comment.user?.lastName}`}
          />
          <AvatarFallback>
            {comment.user?.firstName?.charAt(0)}
            {comment.user?.lastName?.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-xs text-gray-500 mb-1">
              <Link
                href={`/userprofile/${comment.user?.id}`}
                className="font-medium text-blue-600 hover:underline"
              >
                @{comment.user?.userName}
              </Link>
              <span className="mx-1">•</span>
              <span>{dayjs(comment.createdDate).format("MMM D, YYYY")}</span>
            </div>
            {!comment.isDeleted && isCommentOwner && !isEditing && (
              <OptionsMenu
                onEdit={handleEdit}
                onDelete={handleDelete}
                setIsEditing={setIsEditing}
              />
            )}
          </div>
          <div className="text-sm text-gray-700">
            {isEditing ? (
              <Textarea
                value={editedBody}
                onChange={(e) => setEditedBody(e.target.value)}
                className="w-full mt-1 text-sm"
              />
            ) : comment.isDeleted ? (
              <span className="italic text-gray-400">{comment.body}</span>
            ) : showFullComment || comment.body.length <= 100 ? (
              comment.body
            ) : (
              <>
                {comment.body.slice(0, 100)}...
                <button
                  onClick={() => setShowFullComment(true)}
                  className="text-blue-500 hover:underline ml-1 text-xs"
                >
                  more
                </button>
              </>
            )}
          </div>
          {!comment.isDeleted && (
            <div className="mt-2 flex flex-wrap gap-2">
              {canReply && !isEditing && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs px-2 py-0 h-6"
                  onClick={() => setIsReplying(!isReplying)}
                >
                  <ReplyIcon className="w-3 h-3 mr-1" />
                  Reply
                </Button>
              )}
              {isEditing && isCommentOwner && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs px-2 py-0 h-6"
                  onClick={handleSave}
                >
                  <SaveIcon className="w-3 h-3 mr-1" />
                  Save
                </Button>
              )}
            </div>
          )}
          {isReplying && (
            <div className="mt-2">
              <Textarea
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
                className="w-full text-sm"
                placeholder="Write your reply..."
              />
              <Button
                className="mt-2 bg-blue-500 text-white text-xs px-2 py-1 h-6"
                onClick={handleReply}
              >
                Submit Reply
              </Button>
            </div>
          )}
        </div>
      </div>
      {replies.length > 0 && (
        <div className="mt-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs px-2 py-0 h-6"
            onClick={toggleReplies}
          >
            {showReplies ? (
              <ChevronUpIcon className="w-3 h-3 mr-1" />
            ) : (
              <ChevronDownIcon className="w-3 h-3 mr-1" />
            )}
            {showReplies ? "Hide" : "Show"} {replies.length}{" "}
            {replies.length === 1 ? "Reply" : "Replies"}
          </Button>
          {showReplies && renderReplies()}
        </div>
      )}
    </div>
  );
};

export default Comment;
