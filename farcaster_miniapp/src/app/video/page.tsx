"use client";

import dynamic from "next/dynamic";

const VideoPage = dynamic(() => import("./VideoPage"), {
  ssr: false,
});

export default function Page() {
  return <VideoPage />;
} 