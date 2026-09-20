/**
 * Automatic Fetch Retry Helper with Exponential Backoff
 * Retries failed API calls up to maxRetries times before throwing.
 */

interface FetchRetryOptions extends RequestInit {
  maxRetries?: number;
  retryDelayMs?: number;
}

export async function fetchWithRetry(url: string, options: FetchRetryOptions = {}): Promise<Response> {
  const maxRetries = options.maxRetries ?? 3;
  let delay = options.retryDelayMs ?? 1000;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);

      // If server returns HTTP 500/502/503/504 (temporary server error), retry
      if (response.status >= 500 && attempt < maxRetries) {
        console.warn(`[Fetch Retry] HTTP ${response.status} from ${url}. Retrying attempt ${attempt + 1}/${maxRetries} in ${delay}ms...`);
        await new Promise((res) => setTimeout(res, delay));
        delay *= 2; // Exponential backoff: 1000ms -> 2000ms -> 4000ms
        continue;
      }

      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      if (attempt < maxRetries) {
        console.warn(`[Fetch Retry Exception] ${errorMessage} from ${url}. Retrying attempt ${attempt + 1}/${maxRetries} in ${delay}ms...`);
        await new Promise((res) => setTimeout(res, delay));
        delay *= 2;
      } else {
        console.error(`[Fetch Failed] All ${maxRetries} retry attempts failed for ${url}:`, err);
        throw err;
      }
    }
  }

  throw new Error(`Failed to fetch from ${url} after ${maxRetries} retries.`);
}
