"use client";
import dynamic from "next/dynamic";

const PhiloHub = dynamic(() => import("../components/philohub"), { ssr: false });

export default function Page() {
  return <PhiloHub />;
}