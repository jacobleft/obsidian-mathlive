import { blockField, expect, noteText, test } from "./fixtures.mjs";

for (const themePadding of [false, true]) {
	test(`display math within prose has balanced spacing${themePadding ? " with paragraph padding" : ""}`, async ({ page }) => {
		const source = "Before $$x$$ after";
		const theme = themePadding ? await page.addStyleTag({ content: ".markdown-source-view.mod-cm6 div.cm-line:not(.HyperMD-codeblock):not(.HyperMD-header):not(:has(>br:only-child)) { padding-bottom: 20px; }" }) : null;
		try {
			await page.evaluate((source) => {
				const editor = window.app.workspace.activeEditor.editor;
				editor.setValue(source);
				editor.setCursor({ line: 0, ch: 0 });
			}, source);
			await expect(blockField(page)).toHaveCount(1);
			const gaps = await blockField(page).evaluate((field) => {
				const wrapper = field.parentElement;
				const before = wrapper.previousElementSibling;
				const after = wrapper.nextElementSibling;
				return {
					above: field.getBoundingClientRect().top - before.getBoundingClientRect().bottom,
					below: after.getBoundingClientRect().top - field.getBoundingClientRect().bottom,
					preview: getComputedStyle(before.querySelector("div.math")).display,
				};
			});
			expect(gaps.above).toBeGreaterThan(0);
			expect(Math.abs(gaps.above - gaps.below)).toBeLessThanOrEqual(1);
			expect(gaps.preview).toBe("none");
			expect(await noteText(page)).toBe(source);
		} finally {
			await theme?.evaluate((style) => style.remove());
		}
	});
}
