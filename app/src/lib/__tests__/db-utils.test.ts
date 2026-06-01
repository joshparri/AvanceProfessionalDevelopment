import { describe, it, expect } from 'vitest';
import { getUpcomingMondayAndWednesday } from '@/lib/db';

describe('getUpcomingMondayAndWednesday', () => {
  it('returns upcoming Monday and Wednesday in chronological order', () => {
    const tuesday = new Date('2026-06-02T00:00:00Z'); // Tuesday
    const [first, second] = getUpcomingMondayAndWednesday(tuesday);
    // On Tuesday, upcoming dates are: Wed this week, then Mon next week
    expect(first.getDay()).toBe(3); // Wednesday
    expect(second.getDay()).toBe(1); // Monday
    expect(first.getTime()).toBeLessThan(second.getTime());
  });
});
