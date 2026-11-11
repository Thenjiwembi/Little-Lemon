import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import App from "./App";

describe("Little Lemon booking form", () => {
  beforeEach(() => {
    document.cookie = "csrftoken=test-token";
    global.fetch = vi.fn(async (url, options = {}) => {
      if (url === "/csrf") return { ok: true, json: async () => ({ detail: "CSRF cookie set" }) };
      if (options.method === "POST") {
        return {
          ok: true,
          status: 201,
          json: async () => ({ reservation_date: "2027-05-20", reservation_slot: "18:00" })
        };
      }
      return { ok: true, json: async () => [] };
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders accessible booking fields", () => {
    render(<App />);
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/choose date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/choose time/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/number of guests/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/occasion/i)).toBeInTheDocument();
  });

  it("submits a valid booking and shows confirmation", async () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: "Maya" } });
    fireEvent.change(screen.getByLabelText(/choose date/i), { target: { value: "2027-05-20" } });
    fireEvent.change(screen.getByLabelText(/choose time/i), { target: { value: "18:00" } });
    fireEvent.click(screen.getByRole("button", { name: /confirm reservation/i }));

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent(/your table is confirmed/i);
    });
    const postCall = global.fetch.mock.calls.find(([, options]) => options?.method === "POST");
    expect(postCall).toBeDefined();
    expect(JSON.parse(postCall[1].body)).toMatchObject({
      first_name: "Maya",
      reservation_slot: "18:00",
      number_of_guests: 2,
      occasion: "Other"
    });
  });
});
