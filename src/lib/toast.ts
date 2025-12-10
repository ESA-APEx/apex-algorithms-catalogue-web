import { toast } from "sonner";

// Make toast available globally
if (typeof window !== "undefined") {
  window.toast = toast;
}

export { toast };
