import { iComment, iProduct, iReview, iTag } from "@/app/util/Interfaces";
interface helpfulData {
  reviewId: string;
  userInDbId: string;
}

export const getNotifications = async (userId: string) => {
  const notificationsUrl = process.env.NEXT_PUBLIC_NOTIFICATION_SERVER;

  try {
    const response = await fetch(
      `${notificationsUrl}/notifications?user_id=${userId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      userNotifications: data.user_notifications || [],
      ownerNotifications: data.owner_notifications || [],
    };
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};

export const updateHelpfulVote = async (data: helpfulData) => {
  const body = {
    reviewId: data.reviewId,
    userId: data.userInDbId,
  };
  const response = await fetch(`/api/update/helpful`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
    body: JSON.stringify(body),
  });
  return await response.json();
};

export const deleteComment = async (id: string) => {
  const body = {
    id: id,
  };
  const response = await fetch(`/api/delete/comment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
    body: JSON.stringify(body),
  });
  return await response.json();
};

// this is the user api yrl error
export const getUser = async () => {
  if (typeof window === "undefined") {
    return { data: null };
  }

  try {
    const response = await fetch("/api/get/user", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch user:", error);
    throw error;
  }
};

export const getUserWithId = async (userId: string) => {
  const user = await fetch(`/api/get/userwithid`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userId),
  }).then((res) => res.json());
  return user;
};

export const getReview = async (id: string) => {
  console.log("get one review");
  const body = {
    id,
  };

  const data: any = await fetch(`/api/get/review`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  }).then((res) => res.json());
  const review = data.data as iReview;
  delete data.data;
  return { review, ...data };
};

export const getReviews = async (id: string) => {
  const body = {
    id,
    isPublic: true,
    user: true,
    product: true,
    comments: true,
    likedBy: true,
  };

  const data: any = await fetch(`/api/get/reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  }).then((res) => res.json());

  return data;
};

export const getLatestReviews = async () => {
  const data: any = await fetch(`/api/get/reviews/latest`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  }).then((res) => res.json());
  const reviews = data.data as iReview[];
  return { ...data, reviews };
};

export const getProduct = async (id: string) => {
  const product = await fetch(`/api/get/product`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id }),
  }).then((res) => res.json());
  return product.data as iProduct;
};

export const getProducts = async () => {
  const products: iProduct[] = await fetch(`/api/get/all/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  }).then((res) => res.json());
  return products;
};

export const createCommentOnReview = async (comment: iComment) => {
  if (comment.body === "") return;
  const response = await fetch(`/api/create/comment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(comment),
  });
  const data = (await response.json()) as unknown as iComment;
  return data;
};

export const createReplyOnComment = async (
  reply: iComment,
): Promise<iComment> => {
  if (reply.body === "") {
    throw new Error("Reply body cannot be empty");
  }
  console.log("reply to create noti", reply);

  const response = await fetch(`/api/create/comment/reply`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(reply),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = (await response.json()) as iComment;
  return data;
};

export const editComment = async (id: string, commentBody: string) => {
  if (commentBody === "") return new Error("Comment body cannot be empty");

  const response = await fetch(`/api/update/comment/edit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id, commentBody }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = (await response.json()) as iComment;
  return data;
};

export const genTags = async (description: string) => {
  try {
    const response = await fetch(process.env.NEXT_PUBLIC_AI_SERVER + "/gen", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ description }),
    });
    const data = await response.json();
    return data.tags;
  } catch (error) {
    console.log(error);
  }
};
