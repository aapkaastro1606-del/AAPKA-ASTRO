/**
 * Chatbot Health & Circuit Breaker Tracker
 * Monitors provider errors (404 model not found, 401/403 auth, 429 quota),
 * records diagnostics, triggers WhatsApp fallbacks, and trips an in-app circuit
 * breaker on repeated failures to gracefully hide the floating widget.
 */

export type ChatbotErrorType =
  | "MODEL_NOT_FOUND"
  | "AUTH_ERROR"
  | "QUOTA_EXCEEDED"
  | "RATE_LIMIT"
  | "TIMEOUT"
  | "OTHER";

export interface ChatbotErrorInfo {
  type: ChatbotErrorType;
  message: string;
  timestamp: string;
}

export interface ChatbotDiagnostics {
  enabled: boolean;
  provider: string;
  model: string;
  keyConfigured: boolean;
  modelConfigured: boolean;
  status: "HEALTHY" | "DEGRADED" | "DISABLED" | "ERROR";
  lastError: ChatbotErrorInfo | null;
  consecutiveFailures: number;
  circuitBreakerTripped: boolean;
  failureThreshold: number;
}

class ChatbotHealthTrackerState {
  private consecutiveFailures = 0;
  private circuitBreakerTripped = false;
  private lastError: ChatbotErrorInfo | null = null;
  private lastFailureTimestamp = 0;
  private readonly FAILURE_THRESHOLD = 3;
  private readonly RESET_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

  /**
   * Classifies an error into structured error types.
   */
  public classifyError(err: unknown): ChatbotErrorType {
    const msg = (err instanceof Error ? err.message : String(err)).toLowerCase();

    if (
      msg.includes("404") ||
      msg.includes("not found") ||
      msg.includes("not supported") ||
      msg.includes("does not exist") ||
      msg.includes("model_not_found")
    ) {
      return "MODEL_NOT_FOUND";
    }

    if (
      msg.includes("401") ||
      msg.includes("403") ||
      msg.includes("api key") ||
      msg.includes("unauthorized") ||
      msg.includes("permission denied") ||
      msg.includes("forbidden") ||
      msg.includes("auth")
    ) {
      return "AUTH_ERROR";
    }

    if (
      msg.includes("429") ||
      msg.includes("quota") ||
      msg.includes("resource_exhausted") ||
      msg.includes("exceeded your current quota") ||
      msg.includes("insufficient_quota")
    ) {
      return "QUOTA_EXCEEDED";
    }

    if (msg.includes("rate limit") || msg.includes("too many requests")) {
      return "RATE_LIMIT";
    }

    if (msg.includes("abort") || msg.includes("timeout") || msg.includes("timed out")) {
      return "TIMEOUT";
    }

    return "OTHER";
  }

  /**
   * Records a successful provider request and resets failure count.
   */
  public recordSuccess(): void {
    this.consecutiveFailures = 0;
    this.circuitBreakerTripped = false;
  }

  /**
   * Records a provider error, logs categorized message, increments consecutive failures,
   * and trips circuit breaker when threshold is met.
   */
  public recordError(err: unknown): {
    errorType: ChatbotErrorType;
    consecutiveFailures: number;
    circuitBreakerTripped: boolean;
  } {
    const now = Date.now();
    // Reset window if last error was more than 10 mins ago
    if (this.lastFailureTimestamp > 0 && now - this.lastFailureTimestamp > this.RESET_WINDOW_MS) {
      this.consecutiveFailures = 0;
      this.circuitBreakerTripped = false;
    }

    const errorType = this.classifyError(err);
    const rawMessage = err instanceof Error ? err.message : String(err);
    const sanitizedMsg = rawMessage.slice(0, 300);

    this.consecutiveFailures++;
    this.lastFailureTimestamp = now;
    this.lastError = {
      type: errorType,
      message: sanitizedMsg,
      timestamp: new Date().toISOString(),
    };

    console.error(`[Chatbot Provider Error: ${errorType}] ${sanitizedMsg}`);

    if (this.consecutiveFailures >= this.FAILURE_THRESHOLD) {
      this.circuitBreakerTripped = true;
      console.warn(
        `[Chatbot Circuit Breaker Tripped] Chatbot widget temporarily hidden after ${this.consecutiveFailures} consecutive provider failures (${errorType}).`
      );
    }

    return {
      errorType,
      consecutiveFailures: this.consecutiveFailures,
      circuitBreakerTripped: this.circuitBreakerTripped,
    };
  }

  /**
   * Checks whether the circuit breaker is currently active.
   */
  public isCircuitBreakerTripped(): boolean {
    if (this.circuitBreakerTripped) {
      const now = Date.now();
      // Auto-reset circuit breaker after window passes to allow recovery test
      if (now - this.lastFailureTimestamp > this.RESET_WINDOW_MS) {
        this.circuitBreakerTripped = false;
        this.consecutiveFailures = 0;
        return false;
      }
      return true;
    }
    return false;
  }

  /**
   * Returns diagnostic summary for /admin/diagnostics
   */
  public getDiagnostics(): ChatbotDiagnostics {
    const provider = process.env.CHATBOT_PROVIDER || "mock";
    const model = process.env.CHATBOT_MODEL || "";
    const apiKey = process.env.CHATBOT_API_KEY || "";
    const keyConfigured = Boolean(apiKey.trim() && apiKey !== "change_in_production");
    const modelConfigured = Boolean(model.trim());
    const isMock = provider === "mock";

    const isTripped = this.isCircuitBreakerTripped();
    let status: "HEALTHY" | "DEGRADED" | "DISABLED" | "ERROR" = "HEALTHY";

    if (process.env.CHATBOT_ENABLED === "false") {
      status = "DISABLED";
    } else if (isTripped) {
      status = "ERROR";
    } else if (!isMock && (!keyConfigured || !modelConfigured)) {
      status = "DISABLED";
    } else if (this.consecutiveFailures > 0) {
      status = "DEGRADED";
    }

    return {
      enabled: status === "HEALTHY" || (status === "DEGRADED" && !isTripped),
      provider,
      model: model || (isMock ? "internal-grounded-engine" : "UNCONFIGURED"),
      keyConfigured,
      modelConfigured,
      status,
      lastError: this.lastError,
      consecutiveFailures: this.consecutiveFailures,
      circuitBreakerTripped: isTripped,
      failureThreshold: this.FAILURE_THRESHOLD,
    };
  }

  /**
   * Resets tracker state (for unit testing and simulation).
   */
  public resetForTesting(): void {
    this.consecutiveFailures = 0;
    this.circuitBreakerTripped = false;
    this.lastError = null;
    this.lastFailureTimestamp = 0;
  }
}

export const ChatbotHealthTracker = new ChatbotHealthTrackerState();
