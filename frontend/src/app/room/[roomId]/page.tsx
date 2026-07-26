import { redirect } from "next/navigation";
import RoomClient from "@/components/RoomClient";

// params and searchParams are async
export default async function RoomPage({
  params,
  searchParams,
}: {
  params: Promise<{ roomId: string }>;
  searchParams: Promise<{ username?: string }>;
}) {
  const { roomId } = await params;
  const { username } = await searchParams;

  // Route guard: only 6-digit numeric rooms are valid.
  if (!/^[0-9]{6}$/.test(roomId)) {
    redirect("/");
  }

  const name = username?.trim() || "Guest";

  return <RoomClient roomId={roomId} username={name} />;
}