import type { Metadata } from "next";
import { getServerSession } from "@/lib/auth-session";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const session = await getServerSession();

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
          <CardDescription>
            Signed in as {session?.user.name ?? session?.user.email}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-xs/relaxed text-muted-foreground">
            Protected routes require a session. Your home page stays public.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
