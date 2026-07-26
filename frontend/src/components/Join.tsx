"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const ADJECTIVES = ["Swift", "Calm", "Bright", "Bold", "Cosmic", "Lunar", "Neon", "Vivid"];
const NOUNS = ["Otter", "Falcon", "Comet", "Maple", "Echo", "Nova", "Pixel", "Wave"];

function randomUsername() {
  const a = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const n = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  return `${a}${n}${Math.floor(Math.random() * 90 + 10)}`;
}

function randomCode() {
  return String(Math.floor(100000 + Math.random() * 900000)); // always 6 digits
}

export default function Join() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [username, setUsername] = useState(randomUsername);

  // Navigate into a room, carrying the username in the URL.
  function go(roomId: string) {
    const name = username.trim() || randomUsername();
    router.push(`/room/${roomId}?username=${encodeURIComponent(name)}`);
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Spanda</CardTitle>
          <p className="text-center text-sm text-muted-foreground">
            Many devices, one clock, one sound field.
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium">Your name</label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Room code</label>
            <InputOTP
              maxLength={6}
              pattern={REGEXP_ONLY_DIGITS}
              value={code}
              onChange={setCode}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          <Button
            className="w-full"
            disabled={code.length !== 6}
            onClick={() => go(code)}
          >
            Join room
          </Button>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => go(randomCode())}
          >
            Create new room
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}