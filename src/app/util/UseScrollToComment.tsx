
import { useState, useEffect, useCallback } from 'react';

interface ScrollToCommentOptions {
  maxAttempts?: number;
  intervalDuration?: number;
}

function useScrollToComment(cId: string, options: ScrollToCommentOptions = {}): boolean {
  const [isCommentLoaded, setIsCommentLoaded] = useState<boolean>(false);
  const { maxAttempts = 20, intervalDuration = 500 } = options;

  const scrollToComment = useCallback((): boolean => {
    const commentElement = document.getElementById(cId);
    if (commentElement) {
      commentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      console.log("Scrolled to comment successfully");
      return true;
    }
    return false;
  }, [cId]);

  useEffect(() => {
    let attempts = 0;
    let intervalId: NodeJS.Timeout | undefined;

    const checkAndScroll = () => {
      console.log(`Attempt ${attempts + 1} to find and scroll to comment`);
      if (scrollToComment()) {
        if (intervalId) clearInterval(intervalId);
        setIsCommentLoaded(true);
      } else if (attempts >= maxAttempts) {
        console.log("Max attempts reached, stopping scroll attempts");
        if (intervalId) clearInterval(intervalId);
      }
      attempts++;
    };

    // Start checking for the comment element
    intervalId = setInterval(checkAndScroll, intervalDuration);

    // Cleanup function
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [cId, scrollToComment, maxAttempts, intervalDuration]);

  return isCommentLoaded;
}

export default useScrollToComment;