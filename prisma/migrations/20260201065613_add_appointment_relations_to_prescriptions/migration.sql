-- AlterTable
ALTER TABLE "LabPrescription" ADD COLUMN     "appointmentId" TEXT;

-- AlterTable
ALTER TABLE "MedicinePrescription" ADD COLUMN     "appointmentId" TEXT;

-- CreateIndex
CREATE INDEX "LabPrescription_appointmentId_idx" ON "LabPrescription"("appointmentId");

-- CreateIndex
CREATE INDEX "MedicinePrescription_appointmentId_idx" ON "MedicinePrescription"("appointmentId");

-- AddForeignKey
ALTER TABLE "LabPrescription" ADD CONSTRAINT "LabPrescription_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicinePrescription" ADD CONSTRAINT "MedicinePrescription_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
