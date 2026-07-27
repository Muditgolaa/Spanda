import Join from "@/components/Join";

export const dynamic = "force-static"; // serve from edge/CDN → tiny TTFB

export default function Home() {
  return <Join />;
}