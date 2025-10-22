import { cookies } from "next/headers";

export async function hasAccessServer({ curatorId }: { curatorId: string }) {
  try {
    // If your cookie already encodes grants, decode here.
    // Otherwise call your existing API:
    const res = await fetch(`${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/api/access/check?curatorId=${curatorId}`, {
      headers: { cookie: cookies().toString() },
      cache: "no-store",
    });
    if (!res.ok) return false;
    const json = await res.json();
    return Boolean(json?.hasAccess);
  } catch {
    return false;
  }
}
