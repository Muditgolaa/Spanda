"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
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
    return String(Math.floor(100000 + Math.random() * 900000));
}

export default function Join() {
    const router = useRouter();
    const [code, setCode] = useState("");
    const [username, setUsername] = useState(randomUsername);

    function go(roomId: string) {
        const name = username.trim() || randomUsername();
        router.push(`/room/${roomId}?username=${encodeURIComponent(name)}`);
    }

    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-neutral-950 via-neutral-900 to-black p-6 text-neutral-100">
            {/* ambient glow */}
            <div className="pointer-events-none absolute -top-24 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-fuchsia-600/20 blur-3xl" />

            <div className="relative w-full max-w-sm">
                <div className="mb-6 flex flex-col items-center text-center">
                    {/* animated pulse logo */}
                    <img src="/spanda-hero.svg" alt="Spanda" className="h-28 w-28" fetchPriority="high" />
                    <h1 className="mt-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-4xl font-bold tracking-tight text-transparent">
                        Spanda
                    </h1>
                    <p className="mt-1 text-sm text-neutral-400">
                        स्पन्द · many devices, one sound field
                    </p>
                </div>

                <Card className="border-white/10 bg-white/5 backdrop-blur">
                    <CardContent className="space-y-5 pt-6">
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

                <p className="mt-4 text-center text-xs text-neutral-500">
                    Open the same code on another device to play in sync.
                </p>
            </div>
        </main>
    );
}