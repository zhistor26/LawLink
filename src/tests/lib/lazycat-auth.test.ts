import { describe, expect, it } from "vitest";
import { lazyCatEmail } from "@/lib/auth/lazycat";

describe("lazyCatEmail", () => {
  it("将微服 UID 映射为内部邮箱", () => {
    expect(lazyCatEmail("zhangsan")).toBe("zhangsan@lazycat.local");
    expect(lazyCatEmail("User.Name+1")).toBe("user.name+1@lazycat.local");
  });

  it("非法字符替换为下划线", () => {
    expect(lazyCatEmail("张 三")).toBe("___@lazycat.local");
  });

  it("空 UID 使用 user 占位", () => {
    expect(lazyCatEmail("   ")).toBe("user@lazycat.local");
  });
});
