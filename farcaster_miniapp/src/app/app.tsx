"use client";

import dynamic from "next/dynamic";
// note: dynamic import is required for components that use the Frame SDK
const HomePage = dynamic(() => import("./HomePage"), {
  ssr: false,
});

export default function App() {
  return <HomePage />;
}
