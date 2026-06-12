/**
 * User account dropdown menu — avatar, profile info, sign out.
 *
 * Used in the dashboard sidebar and anywhere else a signed-in user trigger
 * is needed. `UserMenuWithSession` fetches the session client-side via
 * Better Auth's `useSession` hook.
 */

"use client";

import { useRouter } from "next/navigation";
import { ChevronsUpDownIcon, LogOutIcon } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { SIGN_IN_PATH } from "@/lib/auth-routes";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/** Default plan label when none is passed from the server. */
const DEFAULT_PLAN = "Free";

/** Minimal user fields needed to render the menu. */
export type UserMenuUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

/** `compact` — icon-only trigger; `profile` — avatar + name in the trigger. */
export type UserMenuTriggerVariant = "compact" | "profile";

type UserMenuProps = {
  user: UserMenuUser;
  /** `compact` — avatar-only trigger; `profile` — avatar + name in the trigger. */
  variant?: UserMenuTriggerVariant;
  plan?: string;
  className?: string;
};

/**
 * Resolves a display name from name or email local-part.
 *
 * @param user - User object with optional name and email.
 * @returns Trimmed name, email username, or fallback `"User"`.
 */
export function getDisplayName(user: UserMenuUser) {
  return user.name?.trim() || user.email?.split("@")[0] || "User";
}

/**
 * Builds two-letter initials for avatar fallback.
 *
 * @param user - User object with optional name and email.
 * @returns Uppercase initials (e.g. `"JD"` for John Doe).
 */
export function getInitials(user: UserMenuUser) {
  const source = user.name?.trim() || user.email || "U";
  const parts = source.split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return source.slice(0, 2).toUpperCase();
}

/**
 * Avatar with image or initials fallback.
 *
 * @param user - User for image URL and initials.
 * @param size - Avatar size variant from the UI library.
 * @returns Avatar component.
 */
function UserAvatar({
  user,
  size = "default",
}: {
  user: UserMenuUser;
  size?: "default" | "sm" | "lg";
}) {
  return (
    <Avatar size={size}>
      {user.image ? (
        <AvatarImage src={user.image} alt={getDisplayName(user)} />
      ) : null}
      <AvatarFallback>{getInitials(user)}</AvatarFallback>
    </Avatar>
  );
}

/**
 * Dropdown menu with user profile header and sign-out action.
 *
 * @param user - Signed-in user to display.
 * @param variant - Trigger style: compact icon or profile with name.
 * @param plan - Billing plan label in the dropdown badge.
 * @param className - Extra classes on the trigger wrapper.
 * @returns Dropdown menu component.
 */
export function UserMenu({
  user,
  variant = "profile",
  plan = DEFAULT_PLAN,
  className,
}: UserMenuProps) {
  const router = useRouter();
  const displayName = getDisplayName(user);

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push(SIGN_IN_PATH);
        },
      },
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(className)}
        render={
          variant === "compact" ? (
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              aria-label="Open account menu"
            />
          ) : (
            <Button
              variant="ghost"
              className="h-9 gap-2 px-2"
              aria-label="Open account menu"
            />
          )
        }
      >
        <UserAvatar user={user} size={variant === "compact" ? "default" : "sm"} />
        {variant === "profile" ? (
          <>
            <span className="max-w-32 truncate text-left text-xs font-medium">
              {displayName}
            </span>
            <ChevronsUpDownIcon className="size-4 text-muted-foreground" />
          </>
        ) : null}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-start gap-2 px-2 py-2">
              <UserAvatar user={user} />
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <p className="truncate text-xs font-medium">{displayName}</p>
                {user.email ? (
                  <p className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </p>
                ) : null}
                <Badge variant="secondary" className="w-fit">
                  {plan} plan
                </Badge>
              </div>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
            <LogOutIcon />
            Log out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

type UserMenuWithSessionProps = Omit<UserMenuProps, "user">;

/**
 * User menu that loads the current session client-side.
 *
 * Renders nothing while loading or when no session exists.
 *
 * @param props - All `UserMenu` props except `user` (session provides it).
 * @returns `UserMenu` or `null` when unauthenticated.
 */
export function UserMenuWithSession(props: UserMenuWithSessionProps) {
  const { data: session, isPending } = authClient.useSession();

  if (isPending || !session?.user) {
    return null;
  }

  return <UserMenu user={session.user} {...props} />;
}
