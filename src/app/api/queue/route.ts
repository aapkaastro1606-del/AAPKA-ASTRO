import { NextRequest, NextResponse } from "next/server";
import { LiveQueueService } from "@/lib/redis/queue";
import { getServerAuthUser } from "@/lib/auth/serverAuth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await getServerAuthUser();
  const searchParams = req.nextUrl.searchParams;
  const paramUserId = searchParams.get("userId");
  const all = searchParams.get("all");

  if (all === "true") {
    // Only owner/staff can inspect the entire queue
    if (!auth.isAuthenticated || (!auth.isOwner && !auth.isStaff)) {
      return NextResponse.json(
        { success: false, message: "Forbidden: Staff or Owner access required to view queue." },
        { status: 403 }
      );
    }
    const list = await LiveQueueService.getAllWaiting();
    return NextResponse.json({ clients: list });
  }

  const targetUserId = auth.isAuthenticated ? (auth.dbUserId || auth.userId) : paramUserId;

  if (targetUserId) {
    const status = await LiveQueueService.getPosition(targetUserId);
    return NextResponse.json(status);
  }

  return NextResponse.json(
    { success: false, message: "userId parameter or authentication is required." },
    { status: 400 }
  );
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getServerAuthUser();
    const body = await req.json();
    const { userId: bodyUserId, userName: bodyUserName, userIdentifier, userPhone, consultationType, concern, birthDetails } = body;

    const targetUserId = auth.isAuthenticated ? (auth.dbUserId || auth.userId) : bodyUserId;
    const targetName = auth.isAuthenticated ? (auth.name || bodyUserName || "Seeker") : bodyUserName;
    const identifier = userIdentifier || userPhone || (auth.isAuthenticated ? auth.email : null);

    if (!targetUserId || !targetName || !identifier) {
      return NextResponse.json(
        { success: false, message: "Missing required client fields (userId, userName, userIdentifier)" },
        { status: 400 }
      );
    }

    const queueStatus = await LiveQueueService.enqueue({
      userId: targetUserId,
      userName: targetName,
      userIdentifier: identifier,
      userPhone: userPhone || identifier,
      consultationType: consultationType || "chat",
      concern: concern || "General Vedic life guidance",
      birthDetails: birthDetails || {
        name: targetName,
        gender: "male",
        birthDate: "1995-10-24",
        birthTime: "14:35",
        birthPlace: "New Delhi, Delhi",
        latitude: 28.6139,
        longitude: 77.209,
        timezone: 5.5,
      },
    });

    return NextResponse.json(queueStatus);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Failed to join queue" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await getServerAuthUser();
  const searchParams = req.nextUrl.searchParams;
  const paramUserId = searchParams.get("userId");
  const action = searchParams.get("action");

  if (action === "next") {
    // Only owner/staff can dequeue next client
    if (!auth.isAuthenticated || (!auth.isOwner && !auth.isStaff)) {
      return NextResponse.json(
        { success: false, message: "Forbidden: Staff or Owner access required to dequeue clients." },
        { status: 403 }
      );
    }
    const nextClient = await LiveQueueService.dequeueNext();
    return NextResponse.json({ nextClient });
  }

  const targetUserId = auth.isAuthenticated ? (auth.dbUserId || auth.userId) : paramUserId;

  if (targetUserId) {
    // Seeker can only leave their own queue position unless owner/staff
    if (auth.isAuthenticated && !auth.isOwner && !auth.isStaff && auth.dbUserId !== targetUserId && auth.userId !== targetUserId) {
      return NextResponse.json(
        { success: false, message: "Forbidden: You cannot remove another user from the queue." },
        { status: 403 }
      );
    }
    await LiveQueueService.leaveQueue(targetUserId);
    return NextResponse.json({ success: true, message: "Left queue" });
  }

  return NextResponse.json({ success: false, message: "Missing parameter" }, { status: 400 });
}
