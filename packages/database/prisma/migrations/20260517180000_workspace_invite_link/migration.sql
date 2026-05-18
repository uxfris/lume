-- CreateTable
CREATE TABLE "workspace_invite_link" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "role" "WorkspaceRole" NOT NULL DEFAULT 'MEMBER',
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workspace_invite_link_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "workspace_invite_link_workspaceId_key" ON "workspace_invite_link"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "workspace_invite_link_tokenHash_key" ON "workspace_invite_link"("tokenHash");

-- CreateIndex
CREATE INDEX "workspace_invite_link_workspaceId_idx" ON "workspace_invite_link"("workspaceId");

-- AddForeignKey
ALTER TABLE "workspace_invite_link" ADD CONSTRAINT "workspace_invite_link_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_invite_link" ADD CONSTRAINT "workspace_invite_link_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
