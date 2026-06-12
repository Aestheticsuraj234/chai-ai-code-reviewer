/**
 * Sign-in page — GitHub OAuth entry point.
 *
 * Reads an optional `callbackUrl` search param so flows like GitHub App
 * installation can return the user to the right place after authentication.
 */

import Image from "next/image";
import type { Metadata } from "next";
import { GithubSignInForm } from "@/components/auth/github-sign-in-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldSet,
} from "@/components/ui/field";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to Chai AI Code Reviewer with your GitHub account.",
};

type SignInPageProps = {
  searchParams: Promise<{ callbackUrl?: string }>;
};

/**
 * Renders the sign-in card with logo and GitHub OAuth button.
 *
 * @param searchParams - Async search params (Next.js 15+) with optional `callbackUrl`.
 * @returns The sign-in page UI inside the auth layout.
 */
export default async function SignInPage({ searchParams }: SignInPageProps) {
  const { callbackUrl } = await searchParams;

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="items-center text-center">
        <div className="mb-6 flex justify-center pt-2">
          <Image
            src="/logo2.svg"
            alt="Chai AI Code Reviewer"
            width={172}
            height={172}
            priority
            className="text-foreground"
          />
        </div>
        <CardTitle className="text-base">Welcome back</CardTitle>
        <CardDescription>
          Sign in with GitHub to review and manage your code.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FieldSet>
          <FieldGroup>
            <Field>
              <GithubSignInForm callbackUrl={callbackUrl} />
              <FieldDescription className="text-center">
                We only request the permissions needed to identify your
                account. You can revoke access anytime from GitHub settings.
              </FieldDescription>
            </Field>
          </FieldGroup>
        </FieldSet>
      </CardContent>
    </Card>
  );
}
