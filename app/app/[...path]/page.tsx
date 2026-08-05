import { redirect } from "next/navigation";

type LegacyAppRedirectProps = {
  params: Promise<{
    path: string[];
  }>;
};

export default async function LegacyAppNestedRedirect({ params }: LegacyAppRedirectProps) {
  const { path } = await params;
  redirect(`/admin/${path.join("/")}`);
}
