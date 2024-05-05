import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/app/util/prismaClient";
import { UserCreatedEvent } from "@/app/util/Interfaces";
export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.USER_UPDATE_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local",
    );
  }

  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    });
  }

  // Get the body
  let payload: UserCreatedEvent = await req.json();
  const body = JSON.stringify(payload);

  // Create a new SVIX instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occured", {
      status: 400,
    });
  }

  // Get the ID and type
  // const { id } = evt.data;
  // const eventType = evt.type;

  // console.log(`Webhook with and ID of ${id} and type of ${eventType}`)
  const user = await prisma.user.upsert({
    where: { email: payload.data.email_addresses[0].email_address },
    update: {
      avatar: payload.data.image_url,
      email: payload.data.email_addresses[0].email_address,
      userName:
        payload.data.username || payload.data.email_addresses[0].email_address,
      lastName: payload.data.last_name,
      firstName: payload.data.first_name,
    },
    create: {
      userName:
        payload.data.username || payload.data.email_addresses[0].email_address,
      avatar: payload.data.image_url,
      email: payload.data.email_addresses[0].email_address,
      firstName: payload.data.first_name,
      lastName: payload.data.last_name,
      createdDate: new Date(),
      clerkUserId: payload.data.id,
    },
  });

  // update the user metadata in the clerk user object
  // await clerkclient.users.updateuser(payload.data.id, {
  //   publicmetadata: { userindb: true, id: user.id },
  // });
  console.log("user created in db from webhook - User edited profile", user);

  return new Response("", { status: 201 });
}
