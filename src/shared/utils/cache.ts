import { revalidatePath } from "next/cache";

/**
 * Safe revalidation helper that tolerates invocation inside test suites (Vitest/Jest)
 * where the Next.js static generation store is not active.
 */
export function safeRevalidatePath(path: string) {
  try {
    revalidatePath(path);
  } catch {
    // In Vitest or standalone environments, no-op safely
  }
}
