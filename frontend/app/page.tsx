import { Suspense } from "react";
import { MentionsDashboard } from "@/features/mentions";

export default function Dashboard() {
  return (
    <Suspense>
      <MentionsDashboard />
    </Suspense>
  );
}
