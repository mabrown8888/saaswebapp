/* eslint-disable camelcase */
import { clerkClient } from "@clerk/nextjs";
import { WebhookEvent } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";

import { createUser, deleteUser, updateUser } from "@/lib/actions/user.actions";
import { connectToDatabase } from "@/lib/database/mongoose";

export async function POST(req: Request) {
    const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
        console.error("Missing WEBHOOK_SECRET");
        throw new Error(
            "Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local"
        );
    }

    const headerPayload = headers();
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    console.log("Headers:", { svix_id, svix_timestamp, svix_signature });

    if (!svix_id || !svix_timestamp || !svix_signature) {
        console.error("Missing svix headers");
        return new Response("Error occurred -- no svix headers", {
            status: 400,
        });
    }

    let payload;
    try {
        payload = await req.json();
    } catch (error) {
        console.error("Error parsing request body:", error);
        return new Response("Error parsing request body", {
            status: 400,
        });
    }

    const body = JSON.stringify(payload);
    console.log("Payload:", payload);

    const wh = new Webhook(WEBHOOK_SECRET);

    let evt: WebhookEvent;

    try {
        evt = wh.verify(body, {
            "svix-id": svix_id,
            "svix-timestamp": svix_timestamp,
            "svix-signature": svix_signature,
        }) as WebhookEvent;
        console.log("Verified event:", evt);
    } catch (err) {
        console.error("Error verifying webhook:", err);
        return new Response("Error occurred", {
            status: 400,
        });
    }

    const { id } = evt.data;
    const eventType = evt.type;

    console.log(`Webhook received: ${eventType} for user ${id}`);

    if (!id) {
        console.error("Missing user ID in webhook data");
        return new Response("Missing user ID in webhook data", {
            status: 400,
        });
    }

    // Ensure database connection
    try {
        await connectToDatabase();
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        return new Response("Error occurred while connecting to MongoDB", {
            status: 500,
        });
    }

    // CREATE
    if (eventType === "user.created") {
        const { email_addresses, image_url, first_name, last_name, username } = evt.data;

        const user = {
            clerkId: id,
            email: email_addresses[0].email_address,
            username: username || '',
            firstName: first_name || '',
            lastName: last_name || '',
            photo: image_url || '',
        };

        console.log('Creating user in MongoDB:', user);
        let newUser;
        try {
            newUser = await createUser(user); // calls server action from user actions in lib
            console.log('User created in MongoDB:', newUser);
        } catch (error) {
            console.error('Error creating user in MongoDB:', error);
            return new Response("Error occurred while creating user in MongoDB", {
                status: 500,
            });
        }

        if (newUser) {
            try {
                await clerkClient.users.updateUserMetadata(id, {
                    publicMetadata: {
                        userId: newUser._id,
                    },
                });
            } catch (error) {
                console.error('Error updating user metadata in Clerk:', error);
                return new Response("Error occurred while updating user metadata in Clerk", {
                    status: 500,
                });
            }
        } else {
            console.error('Failed to create user in MongoDB');
            return new Response("Failed to create user in MongoDB", {
                status: 500,
            });
        }

        return NextResponse.json({ message: "OK", user: newUser });
    }

    // UPDATE
    if (eventType === "user.updated") {
        const { image_url, first_name, last_name, username } = evt.data;

        const user = {
            firstName: first_name || '',
            lastName: last_name || '',
            username: username || '',
            photo: image_url || '',
        };

        console.log('Updating user in MongoDB:', user);
        let updatedUser;
        try {
            updatedUser = await updateUser(id, user);
            console.log('User updated in MongoDB:', updatedUser);
        } catch (error) {
            console.error('Error updating user in MongoDB:', error);
            return new Response("Error occurred while updating user in MongoDB", {
                status: 500,
            });
        }

        return NextResponse.json({ message: "OK", user: updatedUser });
    }

    // DELETE
    if (eventType === "user.deleted") {
        console.log('Deleting user from MongoDB with ID:', id);
        let deletedUser;
        try {
            deletedUser = await deleteUser(id);
            console.log('User deleted from MongoDB:', deletedUser);
        } catch (error) {
            console.error('Error deleting user from MongoDB:', error);
            return new Response("Error occurred while deleting user from MongoDB", {
                status: 500,
            });
        }

        return NextResponse.json({ message: "OK", user: deletedUser });
    }

    console.log(`Unhandled webhook event with ID: ${id} and type: ${eventType}`);
    console.log("Webhook body:", body);

    return new Response("", { status: 200 });
}

// No longer using the deprecated `config` export.
