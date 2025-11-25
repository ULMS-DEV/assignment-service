/*
  Warnings:

  - Changed the type of `plagiarismCheck` on the `AnalysisResult` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `grading` on the `AnalysisResult` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "AnalysisResult" DROP COLUMN "plagiarismCheck",
ADD COLUMN     "plagiarismCheck" JSONB NOT NULL,
DROP COLUMN "grading",
ADD COLUMN     "grading" JSONB NOT NULL;
