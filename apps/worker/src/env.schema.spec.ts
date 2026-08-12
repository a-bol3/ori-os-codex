import { validateWorkerEnv } from "./env.schema";

describe("worker env schema", () => {
  it("accepts a minimal development environment", () => {
    expect(() =>
      validateWorkerEnv({
        NODE_ENV: "development",
      }),
    ).not.toThrow();
  });

  it("rejects production without resend credentials", () => {
    expect(() =>
      validateWorkerEnv({
        NODE_ENV: "production",
      }),
    ).toThrow("Invalid worker environment variables");
  });

  it("accepts production with resend credentials", () => {
    expect(() =>
      validateWorkerEnv({
        NODE_ENV: "production",
        RESEND_API_KEY: "re_live_value",
      }),
    ).not.toThrow();
  });
});
