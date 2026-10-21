"use client";

import React from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, LogIn } from "lucide-react";

export interface DataStateError {
  status?: number;
  message?: string;
}

export function parseFetchError(res: Response, data?: any): DataStateError {
  if (res.status === 401 || res.status === 403) {
    return {
      status: res.status,
      message: "Your session expired or you don't have access. Sign in again.",
    };
  }
  return {
    status: res.status || 500,
    message: data?.message || "Could not load. Retry.",
  };
}

export interface DataStateViewProps {
  loading: boolean;
  error: DataStateError | null | undefined;
  isEmpty: boolean;
  onRetry: () => void;
  loadingView?: React.ReactNode;
  loadingMessage?: string;
  emptyView: React.ReactNode;
  children: React.ReactNode;
  signInHref?: string;
  className?: string;
}

export function DataStateView({
  loading,
  error,
  isEmpty,
  onRetry,
  loadingView,
  loadingMessage = "Loading data...",
  emptyView,
  children,
  signInHref,
  className = "",
}: DataStateViewProps) {
  if (loading) {
    if (loadingView) return <>{loadingView}</>;
    return (
      <div
        className={`p-12 text-center text-[#6E5545] text-xs ${className}`}
        data-testid="loading-state"
      >
        <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-[#7B2D26]" />
        <span>{loadingMessage}</span>
      </div>
    );
  }

  if (error) {
    const isAuthError = error.status === 401 || error.status === 403;
    const loginLink =
      signInHref ||
      (typeof window !== "undefined"
        ? `/login?redirect_url=${encodeURIComponent(window.location.pathname)}`
        : "/login");

    return (
      <div
        className={`p-12 rounded-2xl border border-red-200 bg-red-50 text-center max-w-lg mx-auto space-y-4 ${className}`}
        data-testid="error-state"
        data-error-type={isAuthError ? "auth" : "server"}
      >
        <AlertCircle className="h-10 w-10 text-red-600 mx-auto" />
        <div>
          <h3 className="font-temple text-base font-bold text-red-900">
            {isAuthError
              ? "Your session expired or you don't have access. Sign in again."
              : "Could not load. Retry."}
          </h3>
          {error.message && !isAuthError && (
            <p className="text-xs text-red-700 mt-1">{error.message}</p>
          )}
        </div>

        {isAuthError ? (
          <div>
            <Link
              href={loginLink}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#7B2D26] text-white text-xs font-bold hover:bg-[#64221C] shadow-sm transition-all"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Sign in again</span>
            </Link>
          </div>
        ) : (
          <div>
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#7B2D26] text-white text-xs font-bold hover:bg-[#64221C] shadow-sm transition-all cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  if (isEmpty) {
    return <div data-testid="empty-state">{emptyView}</div>;
  }

  return <>{children}</>;
}

export interface DataStateTableRowProps {
  colSpan: number;
  loading: boolean;
  error: DataStateError | null | undefined;
  isEmpty: boolean;
  onRetry: () => void;
  loadingMessage?: string;
  emptyView: React.ReactNode;
  children: React.ReactNode;
  signInHref?: string;
}

export function DataStateTableRow({
  colSpan,
  loading,
  error,
  isEmpty,
  onRetry,
  loadingMessage = "Loading records...",
  emptyView,
  children,
  signInHref,
}: DataStateTableRowProps) {
  if (loading) {
    return (
      <tr data-testid="loading-state">
        <td colSpan={colSpan} className="py-12 text-center text-xs text-[#6E5545]">
          <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-[#7B2D26]" />
          <span>{loadingMessage}</span>
        </td>
      </tr>
    );
  }

  if (error) {
    const isAuthError = error.status === 401 || error.status === 403;
    const loginLink =
      signInHref ||
      (typeof window !== "undefined"
        ? `/login?redirect_url=${encodeURIComponent(window.location.pathname)}`
        : "/login");

    return (
      <tr data-testid="error-state" data-error-type={isAuthError ? "auth" : "server"}>
        <td colSpan={colSpan} className="py-12 px-4 text-center">
          <div className="max-w-md mx-auto p-6 rounded-2xl border border-red-200 bg-red-50 text-center space-y-3">
            <AlertCircle className="h-8 w-8 text-red-600 mx-auto" />
            <p className="font-temple text-sm font-bold text-red-900">
              {isAuthError
                ? "Your session expired or you don't have access. Sign in again."
                : "Could not load. Retry."}
            </p>
            {isAuthError ? (
              <Link
                href={loginLink}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#7B2D26] text-white text-xs font-bold hover:bg-[#64221C]"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Sign in again</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#7B2D26] text-white text-xs font-bold hover:bg-[#64221C] cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Retry</span>
              </button>
            )}
          </div>
        </td>
      </tr>
    );
  }

  if (isEmpty) {
    return <tr data-testid="empty-state">{emptyView}</tr>;
  }

  return <>{children}</>;
}
