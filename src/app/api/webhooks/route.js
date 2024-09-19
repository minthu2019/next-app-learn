import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { createOrUpdateUser, deleteUser } from '@/lib/actions/user';
import { NextResponse } from 'next/server';

export const POST = async (req) => {
  try {
    const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
      throw new Error('WEBHOOK_SECRET is missing. Please add it to your environment variables.');
    }

    // Get the headers
    const headerPayload = headers();
    const svix_id = headerPayload.get('svix-id');
    const svix_timestamp = headerPayload.get('svix-timestamp');
    const svix_signature = headerPayload.get('svix-signature');

    // Check for missing headers
    if (!svix_id || !svix_timestamp || !svix_signature) {
      return NextResponse.json(
        { message: 'Missing required Svix headers' },
        { status: 400 }
      );
    }

    // Parse the body
    const payload = await req.json();
    const body = JSON.stringify(payload);

    // Create a new Svix Webhook instance
    const wh = new Webhook(WEBHOOK_SECRET);
    let evt;

    // Verify the Webhook payload
    try {
      evt = wh.verify(body, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      });
    } catch (err) {
      console.error('Webhook verification failed:', err);
      return NextResponse.json(
        { message: 'Webhook verification failed' },
        { status: 400 }
      );
    }

    // Extract event data
    const { id } = evt?.data;
    const eventType = evt?.type;

    console.log(`Webhook ID: ${id}, Type: ${eventType}`);
    console.log('Webhook body:', body);

    // Handle user created or updated event
    if (eventType === 'user.created' || eventType === 'user.updated') {
      const { first_name, last_name, image_url, email_addresses, username } = evt?.data;

      try {
        await createOrUpdateUser(id, first_name, last_name, image_url, email_addresses, username);
        return NextResponse.json(
          { message: 'User created or updated successfully' },
          { status: 200 }
        );
      } catch (error) {
        console.error('Error creating or updating user:', error);
        return NextResponse.json(
          { message: 'Failed to create or update user' },
          { status: 500 }
        );
      }
    }

    // Handle user deleted event
    if (eventType === 'user.deleted') {
      try {
        await deleteUser(id);
        return NextResponse.json(
          { message: 'User deleted successfully' },
          { status: 200 }
        );
      } catch (error) {
        console.error('Error deleting user:', error);
        return NextResponse.json(
          { message: 'Failed to delete user' },
          { status: 500 }
        );
      }
    }

    // Default response if event type is not handled
    return NextResponse.json(
      { message: 'Event type not supported' },
      { status: 400 }
    );

  } catch (err) {
    console.error('Error handling the request:', err);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
};

export default POST;
