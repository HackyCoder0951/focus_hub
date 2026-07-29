import { describe, it, expect, vi, beforeEach } from "vitest";

const sonnerToast = vi.fn(() => "id-default") as unknown as {
  (message: unknown, options?: unknown): string;
  error: ReturnType<typeof vi.fn>;
  dismiss: ReturnType<typeof vi.fn>;
};
sonnerToast.error = vi.fn(() => "id-error");
sonnerToast.dismiss = vi.fn();

vi.mock("sonner", () => ({ toast: sonnerToast }));

describe("toast adapter (src/hooks/use-toast.ts)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls sonner's default toast for non-destructive variants", async () => {
    const { toast } = await import("@/hooks/use-toast");
    toast({ title: "Saved", description: "Your changes were saved." });
    expect(sonnerToast).toHaveBeenCalledWith(
      "Saved",
      expect.objectContaining({ description: "Your changes were saved." })
    );
    expect(sonnerToast.error).not.toHaveBeenCalled();
  });

  it("calls sonner's error toast for the destructive variant", async () => {
    const { toast } = await import("@/hooks/use-toast");
    toast({ title: "Failed", description: "Something broke.", variant: "destructive" });
    expect(sonnerToast.error).toHaveBeenCalledWith(
      "Failed",
      expect.objectContaining({ description: "Something broke." })
    );
  });

  it("falls back to description as the message when no title is given", async () => {
    const { toast } = await import("@/hooks/use-toast");
    toast({ description: "Just a description" });
    expect(sonnerToast).toHaveBeenCalledWith("Just a description", expect.any(Object));
  });

  it("returns a dismiss function that dismisses the toast by id", async () => {
    const { toast } = await import("@/hooks/use-toast");
    const result = toast({ title: "Hi" });
    result.dismiss();
    expect(sonnerToast.dismiss).toHaveBeenCalledWith("id-default");
  });

  it("useToast().dismiss dismisses by id (or all when omitted)", async () => {
    const { useToast } = await import("@/hooks/use-toast");
    const { dismiss } = useToast();
    dismiss("some-id");
    expect(sonnerToast.dismiss).toHaveBeenCalledWith("some-id");
  });
});
