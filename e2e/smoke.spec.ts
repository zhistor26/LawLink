import { test, expect } from "@playwright/test";

test.describe("API", () => {
  test("health 返回 ok", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body).toMatchObject({ name: "LawLink", status: "ok" });
    expect(body.timestamp).toBeTruthy();
  });
});

test.describe("登录页", () => {
  test("未登录访问首页会到登录或展示登录表单", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("button", { name: /登\s*录/ })).toBeVisible();
    await expect(page.getByLabel(/邮箱|email/i)).toBeVisible();
  });

  test("受保护路由重定向到登录", async ({ page }) => {
    await page.goto("/matters");
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("案件详情（需登录）", () => {
  test.skip(!process.env.E2E_LOGIN_EMAIL, "设置 E2E_LOGIN_EMAIL / E2E_LOGIN_PASSWORD 后启用");

  test("登录后可打开案件列表", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/邮箱|email/i).fill(process.env.E2E_LOGIN_EMAIL!);
    await page.getByLabel(/密码|password/i).fill(process.env.E2E_LOGIN_PASSWORD!);
    await page.getByRole("button", { name: /登\s*录/ }).click();
    await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 15_000 });

    await page.goto("/matters");
    await expect(page.getByRole("heading", { name: "案件管理" })).toBeVisible({ timeout: 15_000 });
  });
});
