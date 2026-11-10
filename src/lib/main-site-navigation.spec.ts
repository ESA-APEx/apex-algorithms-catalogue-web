import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const html = `
<html><body>
  <header>
    <a href="/about" onclick="alert(1)">About</a>
    <a href="javascript:alert(1)">Bad</a>
    <a href="">Resources</a>
    <img src="/logo.svg" alt="Logo">
    <script>alert(1)</script>
  </header>
  <aside class="c-sidebar js-hamburger-menu"><a href="https://forum.apex.esa.int/">Support</a></aside>
  <footer class="c-footer"><a href="/contact">Contact</a></footer>
</body></html>`;

describe("main-site-navigation", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("extracts and sanitizes the navigation fragments", async () => {
    const { parseMainSiteNavigation } = await import("./main-site-navigation");
    const navigation = parseMainSiteNavigation(html, "https://apex.esa.int/");

    expect(navigation.header).toContain('href="https://apex.esa.int/about"');
    expect(navigation.header).toContain('src="https://apex.esa.int/logo.svg"');
    expect(navigation.header).toContain('<a href="">Resources</a>');
    expect(navigation.header).not.toContain("onclick");
    expect(navigation.header).not.toContain("javascript:");
    expect(navigation.header).not.toContain("<script");
    expect(navigation.hamburgerMenu).toContain("https://forum.apex.esa.int/");
    expect(navigation.footer).toContain('href="https://apex.esa.int/contact"');
  });

  it("throws when an expected element is missing", async () => {
    const { parseMainSiteNavigation } = await import("./main-site-navigation");
    expect(() =>
      parseMainSiteNavigation("<header></header>", "https://apex.esa.int/"),
    ).toThrow('Element "footer" not found');
  });

  it("caches the fetched navigation", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(html));
    vi.stubGlobal("fetch", fetchMock);
    const { getMainSiteNavigation } = await import("./main-site-navigation");

    const [first, second] = await Promise.all([
      getMainSiteNavigation(),
      getMainSiteNavigation(),
    ]);
    const third = await getMainSiteNavigation();

    expect(first?.footer).toContain("Contact");
    expect(second).toBe(first);
    expect(third).toBe(first);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("returns null when the main site is unavailable", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("", { status: 503 })),
    );
    const { getMainSiteNavigation } = await import("./main-site-navigation");

    expect(await getMainSiteNavigation()).toBeNull();
  });
});
