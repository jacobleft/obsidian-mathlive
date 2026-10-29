import { blockField, expect, test } from "./fixtures.mjs";

test("matrix brackets keep their bundled fonts and scale with the rows", async ({ page }) => {
	await page.evaluate(() => {
		const editor = window.app.workspace.activeEditor.editor;
		editor.setValue("$$\n\\begin{bmatrix}" + Array(6).fill("1 & 2").join(" \\\\ ") + "\\end{bmatrix}\n$$");
		editor.setCursor({ line: 0, ch: 0 });
	});
	const field = blockField(page);
	await expect(field).toHaveCount(1);
	await expect.poll(() => page.evaluate(() => Array.from(document.fonts).some((font) => font.family === "KaTeX_Size4" && font.status === "loaded"))).toBe(true);
	const height = await field.locator(".delim-size4").first().evaluate((element) => element.getBoundingClientRect().height);
	const fontSize = await field.evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize));
	expect(height).toBeGreaterThan(fontSize * 5);
});
