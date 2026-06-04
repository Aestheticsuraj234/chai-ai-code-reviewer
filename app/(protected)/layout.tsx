import { UserMenu } from "@/components/user/user-menu";
import { requireAuth } from "@/lib/auth-session";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth();

  return (
    <div className="flex min-h-full flex-col">
      <header className="flex h-14 shrink-0 items-center justify-end border-b border-border px-4">
        <UserMenu user={session.user} variant="profile" />
      </header>
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
