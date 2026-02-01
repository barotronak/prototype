'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'

interface LabPrescription {
  id: string
  testName: string
  testDetails?: string
  instructions?: string
  urgency: string
  status: string
  createdAt: string
  prescriptionPdfUrl?: string
  doctor: {
    id: string
    user: {
      name: string
      email: string
    }
    specialization: string
  }
  patient: {
    id: string
    user: {
      name: string
      email: string
    }
  }
  lab: {
    id: string
  }
  report?: {
    id: string
    reportPdfUrl?: string
    findings?: string
    recommendations?: string
    completedAt: string
  }
}

export default function UploadLabReport() {
  const router = useRouter()
  const params = useParams()
  const [prescription, setPrescription] = useState<LabPrescription | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    structuredData: '',
    findings: '',
    recommendations: '',
  })

  useEffect(() => {
    fetchPrescription()
  }, [params.id])

  async function fetchPrescription() {
    try {
      const response = await fetch(`/api/prescriptions/lab/${params.id}`, {
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        setPrescription(data.prescription)
      } else {
        setError('Failed to load prescription')
      }
    } catch (error) {
      console.error('Failed to fetch prescription:', error)
      setError('Failed to load prescription')
    } finally {
      setLoading(false)
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Please upload a PDF file')
        return
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB')
        return
      }
      setPdfFile(file)
      setError('')
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setUploading(true)

    try {
      let reportPdfUrl = ''

      // Upload PDF file if provided
      if (pdfFile) {
        const uploadFormData = new FormData()
        uploadFormData.append('file', pdfFile)
        uploadFormData.append('folder', 'reports')

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData,
          credentials: 'include',
        })

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload PDF file')
        }

        const uploadData = await uploadResponse.json()
        reportPdfUrl = uploadData.url
      }

      // Parse structured data as JSON
      let structuredDataJson = null
      if (formData.structuredData.trim()) {
        try {
          structuredDataJson = JSON.parse(formData.structuredData)
        } catch {
          throw new Error('Structured data must be valid JSON')
        }
      }

      // Create lab report
      const response = await fetch('/api/lab-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          labPrescriptionId: prescription?.id,
          labId: prescription?.lab.id,
          patientId: prescription?.patient.id,
          reportPdfUrl,
          structuredData: structuredDataJson,
          findings: formData.findings || null,
          recommendations: formData.recommendations || null,
        }),
        credentials: 'include',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to upload report')
      }

      router.push('/laboratory/reports')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload report')
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-white text-lg">Loading prescription...</div>
      </div>
    )
  }

  if (!prescription) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          <Card variant="glass">
            <CardContent className="py-12">
              <div className="text-center text-red-600">
                {error || 'Prescription not found'}
              </div>
              <div className="text-center mt-4">
                <Button onClick={() => router.push('/laboratory/prescriptions')}>
                  Back to Prescriptions
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (prescription.report) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          <Card variant="glass">
            <CardHeader>
              <CardTitle>Report Already Uploaded</CardTitle>
              <CardDescription>
                A report has already been uploaded for this prescription
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Test Name</div>
                  <div className="font-medium">{prescription.testName}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Completed At</div>
                  <div className="font-medium">
                    {new Date(prescription.report.completedAt).toLocaleString()}
                  </div>
                </div>
                {prescription.report.reportPdfUrl && (
                  <div>
                    <a
                      href={prescription.report.reportPdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      View Report PDF
                    </a>
                  </div>
                )}
                <div className="pt-4">
                  <Button onClick={() => router.push('/laboratory/reports')}>
                    View All Reports
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/laboratory/prescriptions')}
            className="mb-4 text-white"
          >
            ← Back to Prescriptions
          </Button>
          <h1 className="text-3xl font-bold text-white mb-2">Upload Lab Report</h1>
          <p className="text-white/80">Upload report and test results</p>
        </div>

        {/* Prescription Details */}
        <Card variant="glass" className="mb-6">
          <CardHeader>
            <CardTitle>Prescription Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-gray-500 mb-1">Test Name</div>
                <div className="font-medium text-lg">{prescription.testName}</div>
                {prescription.testDetails && (
                  <p className="text-sm text-gray-600 mt-2">{prescription.testDetails}</p>
                )}
              </div>

              <div>
                <div className="text-sm text-gray-500 mb-1">Status</div>
                <div className="flex items-center gap-2">
                  <Badge variant="warning">{prescription.status}</Badge>
                  <Badge variant={prescription.urgency === 'URGENT' ? 'error' : 'default'}>
                    {prescription.urgency}
                  </Badge>
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-500 mb-1">Patient</div>
                <div className="font-medium">{prescription.patient.user.name}</div>
                <div className="text-sm text-gray-600">{prescription.patient.user.email}</div>
              </div>

              <div>
                <div className="text-sm text-gray-500 mb-1">Prescribed By</div>
                <div className="font-medium">Dr. {prescription.doctor.user.name}</div>
                <div className="text-sm text-gray-600">{prescription.doctor.specialization}</div>
              </div>

              {prescription.instructions && (
                <div className="md:col-span-2">
                  <div className="text-sm text-gray-500 mb-1">Instructions</div>
                  <p className="text-gray-700">{prescription.instructions}</p>
                </div>
              )}

              {prescription.prescriptionPdfUrl && (
                <div className="md:col-span-2">
                  <a
                    href={prescription.prescriptionPdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    View Prescription PDF →
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upload Form */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle>Upload Report</CardTitle>
            <CardDescription>
              Upload the test report PDF and enter test results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report PDF <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  required
                  className="block w-full text-sm text-gray-900
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-lg file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100
                    cursor-pointer"
                />
                {pdfFile && (
                  <p className="mt-2 text-sm text-gray-600">
                    Selected: {pdfFile.name} ({(pdfFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">Maximum file size: 10MB</p>
              </div>

              <Textarea
                label="Structured Data (JSON)"
                name="structuredData"
                placeholder='{"hemoglobin": 14.5, "wbc": 8000, "platelets": 250000}'
                value={formData.structuredData}
                onChange={handleChange}
                helperText="Enter test results as JSON format (optional)"
                rows={4}
              />

              <Textarea
                label="Findings"
                name="findings"
                placeholder="Describe the test findings and observations..."
                value={formData.findings}
                onChange={handleChange}
                rows={4}
              />

              <Textarea
                label="Recommendations"
                name="recommendations"
                placeholder="Provide recommendations based on test results..."
                value={formData.recommendations}
                onChange={handleChange}
                rows={4}
              />

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => router.push('/laboratory/prescriptions')}
                  disabled={uploading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="flex-1"
                  loading={uploading}
                  disabled={uploading}
                >
                  Upload Report
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
