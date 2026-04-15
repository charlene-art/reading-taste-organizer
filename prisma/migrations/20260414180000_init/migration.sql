-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Book" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "readDate" TIMESTAMP(3),
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookAnalysis" (
    "id" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "themesJson" TEXT NOT NULL,
    "toneJson" TEXT NOT NULL,
    "plotPatternsJson" TEXT NOT NULL,
    "embeddingJson" TEXT,
    "model" TEXT NOT NULL,
    "inferredOnly" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClusterRun" (
    "id" TEXT NOT NULL,
    "k" INTEGER NOT NULL,
    "labelsJson" TEXT NOT NULL,
    "namesJson" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClusterRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BookAnalysis_bookId_idx" ON "BookAnalysis"("bookId");

-- AddForeignKey
ALTER TABLE "BookAnalysis" ADD CONSTRAINT "BookAnalysis_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;
