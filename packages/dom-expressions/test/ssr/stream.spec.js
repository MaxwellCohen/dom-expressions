/**
 * @jest-environment jsdom
 */
import { replacePlaceholder, REPLACE_SCRIPT } from "../../src/server";

describe("streaming placeholders", () => {
  it("replacePlaceholder replaces <?start> region with resolved content", () => {
    const html =
      '<div><?start name="0F"><span>Loading...</span></?end><!--/0F--></div>';
    const result = replacePlaceholder(html, "0F", "<h1>Resolved</h1>");
    expect(result).toBe("<div><h1>Resolved</h1></div>");
  });

  it("replacePlaceholder returns html unchanged when marker is missing", () => {
    const html = "<div>no placeholder</div>";
    expect(replacePlaceholder(html, "0F", "<h1>Resolved</h1>")).toBe(html);
  });

  it("$df swaps streamed template content into the placeholder region", () => {
    document.body.innerHTML =
      '<div id="app"><?start name="0F"><span>Loading...</span></?end><!--/0F--></div><template for="0F"><h1>Content</h1></template>';

    globalThis._$HY = { done: false, fe: jest.fn() };
    eval(`${REPLACE_SCRIPT}; globalThis.$df = $df`);
    globalThis.$df("0F");

    expect(document.getElementById("app").innerHTML).toBe("<h1>Content</h1>");
    expect(document.querySelector('template[for="0F"]')).toBeNull();
    expect(globalThis._$HY.fe).toHaveBeenCalledWith("0F");
  });

  it("$df removes the end marker when hydration is already done", () => {
    document.body.innerHTML =
      '<div id="app"><?start name="0F"><span>Loading...</span></?end><!--/0F--></div><template for="0F"><h1>Content</h1></template>';

    globalThis._$HY = { done: true, fe: jest.fn() };
    eval(`${REPLACE_SCRIPT}; globalThis.$df = $df`);
    globalThis.$df("0F");

    expect(document.getElementById("app").innerHTML).toBe("");
    expect(document.querySelector('template[for="0F"]')).toBeNull();
  });
});
