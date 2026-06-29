import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { clearBodyPointerEvents } from "@/lib/ui/clear-body-pointer-events";

afterEach(() => {
  clearBodyPointerEvents();
});
