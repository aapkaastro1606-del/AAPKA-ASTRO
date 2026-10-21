import test, { describe, it } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  DataStateView,
  DataStateTableRow,
  parseFetchError,
} from "../src/components/admin/DataStateView";

function renderHtml(node: React.ReactElement): string {
  return renderToStaticMarkup(node)
    .replace(/&#x27;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&");
}

describe("ERRORS MUST NEVER LOOK LIKE EMPTY DATA — State Isolation Test Suite", () => {
  describe("1. Distinct State Renders (Loading, Error, Empty, Success)", () => {
    it("renders Loading State and strictly excludes empty or error content", () => {
      const html = renderHtml(
        React.createElement(
          DataStateView,
          {
            loading: true,
            error: null,
            isEmpty: false,
            onRetry: () => {},
            loadingMessage: "Loading verification queue from PostgreSQL database...",
            emptyView: React.createElement("div", null, "Queue is Up to Date"),
          },
          React.createElement("div", null, "Bookings List")
        )
      );

      assert.ok(html.includes("data-testid=\"loading-state\""), "Must contain loading indicator");
      assert.ok(
        html.includes("Loading verification queue from PostgreSQL database..."),
        "Must display loading message"
      );
      assert.ok(!html.includes("Queue is Up to Date"), "Loading must NEVER look like empty data");
      assert.ok(!html.includes("Could not load"), "Loading must not display error");
      assert.ok(!html.includes("Bookings List"), "Loading must not show content");
    });

    it("renders Auth Error (401) with exact mandated text and 'Sign in again' button", () => {
      const err = parseFetchError({ status: 401 } as any);
      assert.equal(err.status, 401);
      assert.equal(
        err.message,
        "Your session expired or you don't have access. Sign in again."
      );

      const html = renderHtml(
        React.createElement(
          DataStateView,
          {
            loading: false,
            error: err,
            isEmpty: false,
            onRetry: () => {},
            signInHref: "/login?redirect_url=/admin/bookings",
            emptyView: React.createElement("div", null, "Queue is Up to Date"),
          },
          React.createElement("div", null, "Bookings List")
        )
      );

      assert.ok(html.includes("data-testid=\"error-state\""), "Must contain error container");
      assert.ok(
        html.includes("Your session expired or you don't have access. Sign in again."),
        "Must display canonical 401 message"
      );
      assert.ok(html.includes("Sign in again"), "Must render 'Sign in again' button text");
      assert.ok(
        html.includes("href=\"/login?redirect_url=/admin/bookings\""),
        "Must link to login"
      );
      assert.ok(
        !html.includes("Queue is Up to Date"),
        "A 401 error must NEVER render 'Queue is Up to Date'"
      );
    });

    it("renders Auth Error (403) with exact mandated text and 'Sign in again' button", () => {
      const err = parseFetchError({ status: 403 } as any);
      assert.equal(err.status, 403);
      assert.equal(
        err.message,
        "Your session expired or you don't have access. Sign in again."
      );

      const html = renderHtml(
        React.createElement(
          DataStateView,
          {
            loading: false,
            error: err,
            isEmpty: false,
            onRetry: () => {},
            emptyView: React.createElement("div", null, "Queue is Up to Date"),
          },
          React.createElement("div", null, "Bookings List")
        )
      );

      assert.ok(html.includes("data-testid=\"error-state\""));
      assert.ok(
        html.includes("Your session expired or you don't have access. Sign in again."),
        "Must display canonical 403 message"
      );
      assert.ok(html.includes("Sign in again"));
      assert.ok(
        !html.includes("Queue is Up to Date"),
        "A 403 error must NEVER render 'Queue is Up to Date'"
      );
    });

    it("renders Server Error (500) with exact mandated text 'Could not load. Retry.' and Retry button", () => {
      const err = parseFetchError({ status: 500 } as any);
      assert.equal(err.status, 500);
      assert.equal(err.message, "Could not load. Retry.");

      const html = renderHtml(
        React.createElement(
          DataStateView,
          {
            loading: false,
            error: err,
            isEmpty: false,
            onRetry: () => {},
            emptyView: React.createElement("div", null, "Queue is Up to Date"),
          },
          React.createElement("div", null, "Bookings List")
        )
      );

      assert.ok(html.includes("data-testid=\"error-state\""));
      assert.ok(html.includes("Could not load. Retry."), "Must display 'Could not load. Retry.'");
      assert.ok(html.includes("<button"), "Must render a retry button");
      assert.ok(html.includes("Retry"), "Button must say 'Retry'");
      assert.ok(
        !html.includes("Queue is Up to Date"),
        "A 500 error must NEVER render 'Queue is Up to Date'"
      );
    });

    it("renders Server Error on network crash or unhandled throw with 'Could not load. Retry.'", () => {
      const err = parseFetchError({ status: 0 } as any, { message: "Failed to fetch" });
      const html = renderHtml(
        React.createElement(
          DataStateView,
          {
            loading: false,
            error: err,
            isEmpty: false,
            onRetry: () => {},
            emptyView: React.createElement("div", null, "No Kundli leads matching your filters."),
          },
          React.createElement("div", null, "Leads Table")
        )
      );

      assert.ok(html.includes("data-testid=\"error-state\""));
      assert.ok(html.includes("Could not load. Retry."));
      assert.ok(
        !html.includes("No Kundli leads matching your filters."),
        "Network crash must NEVER render empty message"
      );
    });

    it("shows the Empty message ONLY after a successful empty response (no loading, no error)", () => {
      const html = renderHtml(
        React.createElement(
          DataStateView,
          {
            loading: false,
            error: null,
            isEmpty: true,
            onRetry: () => {},
            emptyView: React.createElement(
              "div",
              null,
              React.createElement("h3", null, "Queue is Up to Date")
            ),
          },
          React.createElement("div", null, "Bookings List")
        )
      );

      assert.ok(html.includes("data-testid=\"empty-state\""), "Must contain empty-state container");
      assert.ok(
        html.includes("Queue is Up to Date"),
        "Successful empty response correctly renders 'Queue is Up to Date'"
      );
      assert.ok(!html.includes("data-testid=\"error-state\""), "Must not show error");
      assert.ok(!html.includes("data-testid=\"loading-state\""), "Must not show loading");
    });

    it("renders data children when response is successful and has items", () => {
      const html = renderHtml(
        React.createElement(
          DataStateView,
          {
            loading: false,
            error: null,
            isEmpty: false,
            onRetry: () => {},
            emptyView: React.createElement("div", null, "Queue is Up to Date"),
          },
          React.createElement("div", { "data-testid": "booking-item" }, "Booking #ASTRO-1001")
        )
      );

      assert.ok(html.includes("Booking #ASTRO-1001"), "Renders data items");
      assert.ok(!html.includes("Queue is Up to Date"), "Must not render empty view when items exist");
      assert.ok(!html.includes("data-testid=\"error-state\""), "Must not show error");
    });
  });

  describe("2. Table Row Variant (DataStateTableRow for Leads & Staff)", () => {
    it("renders table row loading state", () => {
      const html = renderHtml(
        React.createElement("tbody", null, [
          React.createElement(DataStateTableRow, {
            key: "row",
            colSpan: 6,
            loading: true,
            error: null,
            isEmpty: false,
            onRetry: () => {},
            loadingMessage: "Loading leads from PostgreSQL...",
            emptyView: React.createElement("td", null, "No leads"),
            children: React.createElement("tr", null, React.createElement("td", null, "Lead 1")),
          }),
        ])
      );

      assert.ok(html.includes("data-testid=\"loading-state\""));
      assert.ok(html.toLowerCase().includes("colspan=\"6\""));
      assert.ok(html.includes("Loading leads from PostgreSQL..."));
      assert.ok(!html.includes("No leads"));
    });

    it("renders table row Auth Error on 401/403 with 'Sign in again' button", () => {
      const err = parseFetchError({ status: 403 } as any);
      const html = renderHtml(
        React.createElement("tbody", null, [
          React.createElement(DataStateTableRow, {
            key: "row",
            colSpan: 6,
            loading: false,
            error: err,
            isEmpty: false,
            onRetry: () => {},
            signInHref: "/login?redirect_url=/admin/leads",
            emptyView: React.createElement("td", null, "No Kundli leads matching your filters."),
            children: React.createElement("tr", null, React.createElement("td", null, "Lead 1")),
          }),
        ])
      );

      assert.ok(html.includes("data-testid=\"error-state\""));
      assert.ok(html.includes("Your session expired or you don't have access. Sign in again."));
      assert.ok(html.includes("Sign in again"));
      assert.ok(html.includes("href=\"/login?redirect_url=/admin/leads\""));
      assert.ok(!html.includes("No Kundli leads matching your filters."));
    });

    it("renders table row Server Error on 500 with 'Could not load. Retry.' button", () => {
      const err = parseFetchError({ status: 500 } as any);
      const html = renderHtml(
        React.createElement("tbody", null, [
          React.createElement(DataStateTableRow, {
            key: "row",
            colSpan: 6,
            loading: false,
            error: err,
            isEmpty: false,
            onRetry: () => {},
            emptyView: React.createElement("td", null, "No Kundli leads matching your filters."),
            children: React.createElement("tr", null, React.createElement("td", null, "Lead 1")),
          }),
        ])
      );

      assert.ok(html.includes("data-testid=\"error-state\""));
      assert.ok(html.includes("Could not load. Retry."));
      assert.ok(html.includes("Retry"));
      assert.ok(!html.includes("No Kundli leads matching your filters."));
    });

    it("renders table row Empty state only after successful empty response", () => {
      const html = renderHtml(
        React.createElement("tbody", null, [
          React.createElement(DataStateTableRow, {
            key: "row",
            colSpan: 6,
            loading: false,
            error: null,
            isEmpty: true,
            onRetry: () => {},
            emptyView: React.createElement("td", { colSpan: 6 }, "No Kundli leads matching your filters."),
            children: React.createElement("tr", null, React.createElement("td", null, "Lead 1")),
          }),
        ])
      );

      assert.ok(html.includes("data-testid=\"empty-state\""));
      assert.ok(html.includes("No Kundli leads matching your filters."));
      assert.ok(!html.includes("Could not load"));
      assert.ok(!html.includes("data-testid=\"loading-state\""));
    });
  });

  describe("3. Simulation Across Admin Screens (401, 403, 500 simulation matrix)", () => {
    const screens = [
      { name: "bookings", emptyLabel: "Queue is Up to Date" },
      { name: "leads", emptyLabel: "No Kundli leads matching your filters." },
      { name: "knowledge", emptyLabel: "No custom knowledge entries match your filter." },
      { name: "team", emptyLabel: "No staff members have been granted access yet." },
      { name: "staff", emptyLabel: "No staff members found." },
      { name: "media", emptyLabel: "No media assets found" },
      { name: "audit", emptyLabel: "No audit logs match your search criteria." },
      { name: "clients", emptyLabel: "No clients found matching your query." },
    ];

    for (const screen of screens) {
      it(`[${screen.name}] 401 response results in auth error and never '${screen.emptyLabel}'`, () => {
        const fake401 = { status: 401, ok: false } as Response;
        const err = parseFetchError(fake401);

        const html = renderHtml(
          React.createElement(
            DataStateView,
            {
              loading: false,
              error: err,
              isEmpty: false,
              onRetry: () => {},
              emptyView: React.createElement("div", null, screen.emptyLabel),
            },
            React.createElement("div", null, "Content")
          )
        );

        assert.equal(err.status, 401);
        assert.ok(html.includes("Your session expired or you don't have access. Sign in again."));
        assert.ok(!html.includes(screen.emptyLabel), `401 must NEVER display '${screen.emptyLabel}'`);
      });

      it(`[${screen.name}] 403 response results in auth error and never '${screen.emptyLabel}'`, () => {
        const fake403 = { status: 403, ok: false } as Response;
        const err = parseFetchError(fake403);

        const html = renderHtml(
          React.createElement(
            DataStateView,
            {
              loading: false,
              error: err,
              isEmpty: false,
              onRetry: () => {},
              emptyView: React.createElement("div", null, screen.emptyLabel),
            },
            React.createElement("div", null, "Content")
          )
        );

        assert.equal(err.status, 403);
        assert.ok(html.includes("Your session expired or you don't have access. Sign in again."));
        assert.ok(!html.includes(screen.emptyLabel), `403 must NEVER display '${screen.emptyLabel}'`);
      });

      it(`[${screen.name}] 500 response results in server error 'Could not load. Retry.' and never '${screen.emptyLabel}'`, () => {
        const fake500 = { status: 500, ok: false } as Response;
        const err = parseFetchError(fake500);

        const html = renderHtml(
          React.createElement(
            DataStateView,
            {
              loading: false,
              error: err,
              isEmpty: false,
              onRetry: () => {},
              emptyView: React.createElement("div", null, screen.emptyLabel),
            },
            React.createElement("div", null, "Content")
          )
        );

        assert.equal(err.status, 500);
        assert.ok(html.includes("Could not load. Retry."));
        assert.ok(!html.includes(screen.emptyLabel), `500 must NEVER display '${screen.emptyLabel}'`);
      });
    }
  });
});
