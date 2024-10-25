import UserProfileComponent from "@/app/components/UserProfileComponent";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Page() {
  const { userId }: { userId: string | null } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div>
      <UserProfileComponent userIdFromParams={undefined} />
    </div>
  );
}
