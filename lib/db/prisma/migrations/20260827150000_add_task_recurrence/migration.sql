-- CreateEnum
CREATE TYPE "TaskRecurrenceType" AS ENUM ('NONE', 'DAILY', 'WEEKLY', 'MONTHLY');

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "predecessor_id" UUID,
ADD COLUMN     "recurrence_type" "TaskRecurrenceType" NOT NULL DEFAULT 'NONE';

-- CreateIndex
CREATE UNIQUE INDEX "Task_predecessor_id_key" ON "Task"("predecessor_id");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_predecessor_id_fkey" FOREIGN KEY ("predecessor_id") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
