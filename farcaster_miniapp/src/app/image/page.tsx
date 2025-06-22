"use client";

import dynamic from "next/dynamic";

const ImagePage = dynamic(() => import("./ImagePage"), {
  ssr: false,
});

export default function Page() {
  return <ImagePage />;
} 