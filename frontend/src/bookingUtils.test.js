import { describe, expect, it } from "vitest";
import { initializeTimes, updateTimes, TIME_SLOTS } from "./bookingUtils";

describe("booking time helpers", () => {
  it("initializes all restaurant time slots", () => {
    expect(initializeTimes()).toEqual(TIME_SLOTS);
    expect(TIME_SLOTS).toHaveLength(12);
    expect(TIME_SLOTS[0]).toBe("10:00");
    expect(TIME_SLOTS.at(-1)).toBe("21:00");
  });

  it("removes slots that are already booked", () => {
    expect(updateTimes([{ reservation_slot: "18:00" }])).not.toContain("18:00");
    expect(updateTimes([{ reservation_slot: "18:00" }])).toContain("19:00");
  });

  it("keeps all slots when no bookings exist", () => {
    expect(updateTimes([])).toEqual(TIME_SLOTS);
  });
});
