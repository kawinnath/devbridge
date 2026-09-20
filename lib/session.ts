import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";

export async function getUserIdFromSession(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("userId")?.value;
    if (!token) return null;

    const decoded = verifyToken(token);
    if (!decoded || typeof decoded.userId !== "string") return null;

    return decoded.userId;
  } catch {
    return null;
  }
}
