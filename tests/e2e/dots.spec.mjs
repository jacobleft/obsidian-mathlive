import { blockField, expect, focusField, inlineField, modalField, noteText, runCommand, test, waitForModalField } from "./fixtures.mjs";

async function openField(page, mode, latex) {
	await page.evaluate(({ mode, latex }) => {
		const editor = window.app.workspace.activeEditor.editor;
		editor.setValue(mode === "display" ? `$$\n${latex}\n$$` : `$${latex}$`);
		editor.setCursor({ line: 0, ch: 1 });
	}, { mode, latex });
	if (mode === "expanded") {
		await page.bringToFront();
		await runCommand(page, "mathlive:open-modal-inline");
		await waitForModalField(page);
	}
	const field = mode === "expanded" ? modalField(page) : mode === "display" ? blockField(page) : inlineField(page);
	await focusField(field);
	return field;
}

for (const mode of ["inline", "display", "expanded"]) {
	for (const latex of ["a_1,\\dots,a_n", "\\begin{bmatrix}1&\\dots&n\\\\a&b&c\\end{bmatrix}"]) {
		test(`${mode} renders existing ${latex}`, async ({ page }) => {
			const field = await openField(page, mode, latex);
			await expect.poll(() => field.evaluate(mfe => mfe.errors)).toEqual([]);
			await expect(field.locator('.ML__latex')).toContainText("…");
			await expect(field.locator('.ML__error')).toHaveCount(0);
			await expect.poll(() => field.evaluate(mfe => mfe.value)).toContain("\\dots");
		});
	}

	test(`${mode} inserts dots and preserves the command when saved`, async ({ page }) => {
		const field = await openField(page, mode, "x");
		await field.evaluate(mfe => { mfe.position = mfe.lastOffset; mfe.insert(",\\dots,y"); });
		await expect.poll(() => field.evaluate(mfe => mfe.errors)).toEqual([]);
		await expect(field.locator('.ML__latex')).toContainText("…");
		if (mode === "expanded") await page.keyboard.press("Meta+Enter");
		await expect.poll(() => noteText(page)).toContain("\\dots");
	});
}

test("accent menu previews render selected dots", async ({ page }) => {
	const field = await openField(page, "inline", "a,\\dots,b");
	await field.evaluate(mfe => mfe.executeCommand("selectAll"));
	await field.click({ button: "right" });
	await page.getByText("Accent", { exact: true }).hover();
	const hat = page.getByRole("menuitem", { name: "Hat", exact: true });
	await expect(hat).toBeVisible();
	await expect(hat).toContainText("…");
	await expect(hat.locator('.ML__error')).toHaveCount(0);
});
