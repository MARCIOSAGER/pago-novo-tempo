import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock fetch globally for Umami API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock ENV
vi.mock("./_core/env", () => ({
  ENV: {
    appId: "test",
    cookieSecret: "test-secret",
    databaseUrl: "mysql://test",
    oAuthServerUrl: "https://test.oauth",
    ownerOpenId: "owner-123",
    isProduction: false,
    forgeApiUrl: "https://test.forge",
    forgeApiKey: "test-forge-key",
    analyticsEndpoint: "https://analytics.test.com",
    analyticsWebsiteId: "test-website-id",
  },
}));

// Mock db module
vi.mock("./db", () => ({
  createInscription: vi.fn(),
  listInscriptions: vi.fn().mockResolvedValue([]),
  updateInscriptionStatus: vi.fn(),
  getInscriptionMetrics: vi.fn().mockResolvedValue({}),
  listInscriptionsFiltered: vi.fn().mockResolvedValue({ data: [], total: 0 }),
  getInscriptionById: vi.fn(),
  deleteInscription: vi.fn(),
  exportAllInscriptions: vi.fn().mockResolvedValue([]),
  createFileRecord: vi.fn(),
  listFiles: vi.fn().mockResolvedValue([]),
  getFileById: vi.fn(),
  deleteFileRecord: vi.fn(),
}));

// Mock storage
vi.mock("./storage", () => ({
  storagePut: vi.fn().mockResolvedValue({ url: "https://s3.test/file", key: "key" }),
}));

// Mock security
vi.mock("./security", () => ({
  honeypotCheck: vi.fn().mockReturnValue(false),
  validateFileUpload: vi.fn().mockReturnValue({ valid: true }),
}));

// Mock patchedFetch
vi.mock("./_core/patchedFetch", () => ({
  createPatchedFetch: vi.fn().mockReturnValue(vi.fn()),
}));

describe("Analytics Routes — fetchUmami helper", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("should call Umami API with correct URL for stats", async () => {
    const mockStats = {
      pageviews: { value: 100, prev: 90 },
      visitors: { value: 50, prev: 45 },
      visits: { value: 80, prev: 70 },
      bounces: { value: 20, prev: 18 },
      totaltime: { value: 5000, prev: 4500 },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockStats),
    });

    // Import the router after mocks are set up
    const { appRouter } = await import("./routers");

    const caller = appRouter.createCaller({
      user: { id: "admin-1", name: "Admin", role: "admin", openId: "oid-1", avatarUrl: null, createdAt: Date.now() },
      req: {} as any,
      res: {} as any,
    });

    const result = await caller.analytics.stats({
      startAt: 1000000,
      endAt: 2000000,
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/websites/test-website-id/stats"),
      expect.objectContaining({
        headers: { "Content-Type": "application/json" },
      })
    );
    expect(result).toEqual(mockStats);
  });

  it("should call Umami API for active visitors", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ x: 5 }),
    });

    const { appRouter } = await import("./routers");

    const caller = appRouter.createCaller({
      user: { id: "admin-1", name: "Admin", role: "admin", openId: "oid-1", avatarUrl: null, createdAt: Date.now() },
      req: {} as any,
      res: {} as any,
    });

    const result = await caller.analytics.active();

    expect(mockFetch).toHaveBeenCalledWith(
      "https://analytics.test.com/api/websites/test-website-id/active",
      expect.any(Object)
    );
    expect(result).toEqual({ x: 5 });
  });

  it("should call Umami API for metrics by type", async () => {
    const mockMetrics = [
      { x: "/", y: 100 },
      { x: "/about", y: 50 },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockMetrics),
    });

    const { appRouter } = await import("./routers");

    const caller = appRouter.createCaller({
      user: { id: "admin-1", name: "Admin", role: "admin", openId: "oid-1", avatarUrl: null, createdAt: Date.now() },
      req: {} as any,
      res: {} as any,
    });

    const result = await caller.analytics.metrics({
      startAt: 1000000,
      endAt: 2000000,
      type: "path",
      limit: 10,
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/websites/test-website-id/metrics"),
      expect.any(Object)
    );
    expect(result).toEqual(mockMetrics);
  });

  it("should throw error when Umami API returns non-ok response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
    });

    const { appRouter } = await import("./routers");

    const caller = appRouter.createCaller({
      user: { id: "admin-1", name: "Admin", role: "admin", openId: "oid-1", avatarUrl: null, createdAt: Date.now() },
      req: {} as any,
      res: {} as any,
    });

    await expect(
      caller.analytics.stats({ startAt: 1000000, endAt: 2000000 })
    ).rejects.toThrow();
  });

  it("should reject non-admin users from analytics routes", async () => {
    const { appRouter } = await import("./routers");

    const caller = appRouter.createCaller({
      user: { id: "user-1", name: "User", role: "user", openId: "oid-2", avatarUrl: null, createdAt: Date.now() },
      req: {} as any,
      res: {} as any,
    });

    await expect(
      caller.analytics.stats({ startAt: 1000000, endAt: 2000000 })
    ).rejects.toThrow("Acesso restrito a administradores");
  });

  it("should call Umami API for pageviews with correct params", async () => {
    const mockPageviews = {
      pageviews: [
        { x: "2026-02-20", y: 30 },
        { x: "2026-02-21", y: 45 },
      ],
      sessions: [
        { x: "2026-02-20", y: 20 },
        { x: "2026-02-21", y: 25 },
      ],
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockPageviews),
    });

    const { appRouter } = await import("./routers");

    const caller = appRouter.createCaller({
      user: { id: "admin-1", name: "Admin", role: "admin", openId: "oid-1", avatarUrl: null, createdAt: Date.now() },
      req: {} as any,
      res: {} as any,
    });

    const result = await caller.analytics.pageviews({
      startAt: 1000000,
      endAt: 2000000,
      unit: "day",
      timezone: "Africa/Luanda",
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/websites/test-website-id/pageviews"),
      expect.any(Object)
    );
    expect(result).toEqual(mockPageviews);
  });
});
