import { describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

// ─── Mock database helpers (factory must not reference outer scope) ──

vi.mock("./db", () => {
  const mockInscriptions = [
    {
      id: 1,
      name: "João Silva",
      email: "joao@example.com",
      phone: "+5511999999999",
      message: "Quero participar da mentoria",
      status: "pending" as const,
      createdAt: new Date("2026-02-20T10:00:00Z"),
      updatedAt: new Date("2026-02-20T10:00:00Z"),
    },
    {
      id: 2,
      name: "Maria Santos",
      email: "maria@example.com",
      phone: "+5521888888888",
      message: null,
      status: "contacted" as const,
      createdAt: new Date("2026-02-25T14:00:00Z"),
      updatedAt: new Date("2026-02-26T09:00:00Z"),
    },
    {
      id: 3,
      name: "Pedro Costa",
      email: "pedro@example.com",
      phone: null,
      message: "Estou interessado",
      status: "enrolled" as const,
      createdAt: new Date("2026-02-27T08:00:00Z"),
      updatedAt: new Date("2026-02-27T08:00:00Z"),
    },
  ];

  return {
    getInscriptionMetrics: vi.fn().mockResolvedValue({
      total: 3,
      pending: 1,
      contacted: 1,
      enrolled: 1,
      rejected: 0,
      last7Days: 2,
      last30Days: 3,
    }),
    listInscriptionsFiltered: vi.fn().mockImplementation(
      async (params: {
        status?: string;
        search?: string;
        page: number;
        pageSize: number;
      }) => {
        let items = [...mockInscriptions];
        if (params.status && params.status !== "all") {
          items = items.filter((i) => i.status === params.status);
        }
        if (params.search) {
          const term = params.search.toLowerCase();
          items = items.filter(
            (i) =>
              i.name.toLowerCase().includes(term) ||
              i.email.toLowerCase().includes(term)
          );
        }
        const offset = (params.page - 1) * params.pageSize;
        return {
          items: items.slice(offset, offset + params.pageSize),
          total: items.length,
        };
      }
    ),
    getInscriptionById: vi.fn().mockImplementation(async (id: number) => {
      return mockInscriptions.find((i) => i.id === id) ?? undefined;
    }),
    updateInscriptionStatus: vi.fn().mockResolvedValue(undefined),
    deleteInscription: vi.fn().mockResolvedValue(undefined),
    exportAllInscriptions: vi.fn().mockResolvedValue(mockInscriptions),
    createInscription: vi.fn().mockResolvedValue(undefined),
    listInscriptions: vi.fn().mockResolvedValue(mockInscriptions),
    createFileRecord: vi.fn(),
    listFiles: vi.fn().mockResolvedValue([]),
    getFileById: vi.fn(),
    deleteFileRecord: vi.fn(),
    upsertUser: vi.fn(),
    getUserByOpenId: vi.fn(),
  };
});

vi.mock("./storage", () => ({
  storagePut: vi.fn(),
}));

vi.mock("./security", () => ({
  honeypotCheck: vi.fn().mockReturnValue(false),
  validateFileUpload: vi.fn().mockReturnValue({ valid: true }),
}));

vi.mock("./_core/patchedFetch", () => ({
  createPatchedFetch: vi.fn().mockReturnValue(vi.fn()),
}));

// Import after mocks
import { appRouter } from "./routers";

// ─── Context helpers ────────────────────────────────────────────

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@pago.com",
    name: "Admin PAGO",
    loginMethod: "google",
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
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createUserContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "regular-user",
    email: "user@example.com",
    name: "Regular User",
    loginMethod: "google",
    role: "user",
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
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
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
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

// ─── Tests ──────────────────────────────────────────────────────

describe("Admin Mentoria Routes", () => {
  describe("Role-based Access Control", () => {
    it("allows admin to access metrics", async () => {
      const caller = appRouter.createCaller(createAdminContext());
      const metrics = await caller.mentoria.metrics();
      expect(metrics.total).toBe(3);
      expect(metrics.pending).toBe(1);
      expect(metrics.contacted).toBe(1);
      expect(metrics.enrolled).toBe(1);
      expect(metrics.rejected).toBe(0);
    });

    it("blocks regular user from accessing metrics", async () => {
      const caller = appRouter.createCaller(createUserContext());
      await expect(caller.mentoria.metrics()).rejects.toThrow(
        "Acesso restrito a administradores."
      );
    });

    it("blocks unauthenticated user from accessing metrics", async () => {
      const caller = appRouter.createCaller(createPublicContext());
      await expect(caller.mentoria.metrics()).rejects.toThrow();
    });
  });

  describe("mentoria.listFiltered", () => {
    it("returns all inscriptions when no filters applied", async () => {
      const caller = appRouter.createCaller(createAdminContext());
      const result = await caller.mentoria.listFiltered({
        page: 1,
        pageSize: 20,
      });
      expect(result.total).toBe(3);
      expect(result.items).toHaveLength(3);
    });

    it("filters by status", async () => {
      const caller = appRouter.createCaller(createAdminContext());
      const result = await caller.mentoria.listFiltered({
        status: "pending",
        page: 1,
        pageSize: 20,
      });
      expect(result.total).toBe(1);
      expect(result.items[0].name).toBe("João Silva");
    });

    it("filters by search term", async () => {
      const caller = appRouter.createCaller(createAdminContext());
      const result = await caller.mentoria.listFiltered({
        search: "maria",
        page: 1,
        pageSize: 20,
      });
      expect(result.total).toBe(1);
      expect(result.items[0].name).toBe("Maria Santos");
    });

    it("blocks regular user from listing", async () => {
      const caller = appRouter.createCaller(createUserContext());
      await expect(
        caller.mentoria.listFiltered({ page: 1, pageSize: 20 })
      ).rejects.toThrow("Acesso restrito a administradores.");
    });
  });

  describe("mentoria.getById", () => {
    it("returns inscription by ID", async () => {
      const caller = appRouter.createCaller(createAdminContext());
      const result = await caller.mentoria.getById({ id: 1 });
      expect(result.name).toBe("João Silva");
      expect(result.email).toBe("joao@example.com");
    });

    it("throws NOT_FOUND for non-existent ID", async () => {
      const caller = appRouter.createCaller(createAdminContext());
      await expect(caller.mentoria.getById({ id: 999 })).rejects.toThrow(
        "Inscrição não encontrada."
      );
    });
  });

  describe("mentoria.updateStatus", () => {
    it("updates inscription status", async () => {
      const caller = appRouter.createCaller(createAdminContext());
      const result = await caller.mentoria.updateStatus({
        id: 1,
        status: "contacted",
      });
      expect(result.success).toBe(true);
    });

    it("blocks regular user from updating status", async () => {
      const caller = appRouter.createCaller(createUserContext());
      await expect(
        caller.mentoria.updateStatus({ id: 1, status: "contacted" })
      ).rejects.toThrow("Acesso restrito a administradores.");
    });
  });

  describe("mentoria.delete", () => {
    it("deletes an existing inscription", async () => {
      const caller = appRouter.createCaller(createAdminContext());
      const result = await caller.mentoria.delete({ id: 1 });
      expect(result.success).toBe(true);
    });

    it("throws NOT_FOUND for non-existent inscription", async () => {
      const caller = appRouter.createCaller(createAdminContext());
      await expect(caller.mentoria.delete({ id: 999 })).rejects.toThrow(
        "Inscrição não encontrada."
      );
    });

    it("blocks regular user from deleting", async () => {
      const caller = appRouter.createCaller(createUserContext());
      await expect(caller.mentoria.delete({ id: 1 })).rejects.toThrow(
        "Acesso restrito a administradores."
      );
    });
  });

  describe("mentoria.export", () => {
    it("returns all inscriptions for CSV export", async () => {
      const caller = appRouter.createCaller(createAdminContext());
      const result = await caller.mentoria.export();
      expect(result).toHaveLength(3);
      expect(result[0].name).toBe("João Silva");
    });

    it("blocks regular user from exporting", async () => {
      const caller = appRouter.createCaller(createUserContext());
      await expect(caller.mentoria.export()).rejects.toThrow(
        "Acesso restrito a administradores."
      );
    });
  });

  describe("mentoria.submit (public)", () => {
    it("allows public submission of inscription", async () => {
      const caller = appRouter.createCaller(createPublicContext());
      const result = await caller.mentoria.submit({
        name: "Novo Candidato",
        email: "novo@example.com",
        phone: "+5511999999999",
        message: "Quero participar",
      });
      expect(result.success).toBe(true);
      expect(result.message).toBe("Inscrição recebida com sucesso!");
    });

    it("validates email format", async () => {
      const caller = appRouter.createCaller(createPublicContext());
      await expect(
        caller.mentoria.submit({
          name: "Test",
          email: "invalid-email",
        })
      ).rejects.toThrow();
    });

    it("validates name minimum length", async () => {
      const caller = appRouter.createCaller(createPublicContext());
      await expect(
        caller.mentoria.submit({
          name: "A",
          email: "test@example.com",
        })
      ).rejects.toThrow();
    });
  });
});
