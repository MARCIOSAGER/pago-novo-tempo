import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { getDownloadBySlug, deleteDownload } from "./db";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@example.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

const TEST_SLUG = "test-download-vitest";

describe("downloads CRUD", () => {
  const adminCaller = appRouter.createCaller(createAdminContext());
  const publicCaller = appRouter.createCaller(createPublicContext());

  // Cleanup before and after tests
  beforeAll(async () => {
    const existing = await getDownloadBySlug(TEST_SLUG);
    if (existing) await deleteDownload(existing.id);
  });

  afterAll(async () => {
    const existing = await getDownloadBySlug(TEST_SLUG);
    if (existing) await deleteDownload(existing.id);
  });

  it("admin can create a download", async () => {
    const result = await adminCaller.downloads.create({
      slug: TEST_SLUG,
      title: "Test Download",
      description: "A test download entry",
      format: "PDF",
      fileSize: "1.0 MB",
      url: "https://example.com/test.pdf",
      filename: "test.pdf",
      category: "ebook",
      badge: null,
      badgeVariant: null,
      sortOrder: 99,
      active: "yes",
    });
    expect(result).toEqual({ success: true });
  });

  it("rejects duplicate slug", async () => {
    await expect(
      adminCaller.downloads.create({
        slug: TEST_SLUG,
        title: "Duplicate",
        format: "PDF",
        url: "https://example.com/dup.pdf",
        filename: "dup.pdf",
        category: "ebook",
        sortOrder: 0,
      })
    ).rejects.toThrow(/Slug já existe/);
  });

  it("public can list downloads by category", async () => {
    const items = await publicCaller.downloads.listByCategory({ category: "ebook" });
    expect(Array.isArray(items)).toBe(true);
    const found = items.find((d) => d.slug === TEST_SLUG);
    expect(found).toBeDefined();
    expect(found?.title).toBe("Test Download");
  });

  it("public can get download by slug", async () => {
    const dl = await publicCaller.downloads.getBySlug({ slug: TEST_SLUG });
    expect(dl.slug).toBe(TEST_SLUG);
    expect(dl.format).toBe("PDF");
  });

  it("public getBySlug returns NOT_FOUND for missing slug", async () => {
    await expect(
      publicCaller.downloads.getBySlug({ slug: "nonexistent-slug-xyz" })
    ).rejects.toThrow(/não encontrado/);
  });

  it("admin can list all downloads", async () => {
    const items = await adminCaller.downloads.listAll();
    expect(Array.isArray(items)).toBe(true);
    expect(items.length).toBeGreaterThan(0);
  });

  it("admin can get download count", async () => {
    const result = await adminCaller.downloads.count();
    expect(result.total).toBeGreaterThan(0);
  });

  it("admin can update a download", async () => {
    const dl = await getDownloadBySlug(TEST_SLUG);
    expect(dl).toBeDefined();

    const result = await adminCaller.downloads.update({
      id: dl!.id,
      title: "Updated Test Download",
      description: "Updated description",
      active: "no",
    });
    expect(result).toEqual({ success: true });

    const updated = await publicCaller.downloads.getBySlug({ slug: TEST_SLUG });
    expect(updated.title).toBe("Updated Test Download");
    expect(updated.active).toBe("no");
  });

  it("admin can delete a download", async () => {
    const dl = await getDownloadBySlug(TEST_SLUG);
    expect(dl).toBeDefined();

    const result = await adminCaller.downloads.delete({ id: dl!.id });
    expect(result).toEqual({ success: true });

    await expect(
      publicCaller.downloads.getBySlug({ slug: TEST_SLUG })
    ).rejects.toThrow(/não encontrado/);
  });

  it("admin delete returns NOT_FOUND for missing id", async () => {
    await expect(
      adminCaller.downloads.delete({ id: 999999 })
    ).rejects.toThrow(/não encontrado/);
  });
});
