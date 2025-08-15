"use client"

import type React from "react"

import { useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Upload, Camera, Mic, File, ImageIcon, Music, X, Check, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileUploadProps {
  onFilesUploaded: (files: UploadedFile[]) => void
  onFileAnalyzed: (fileId: string, analysis: any) => void
  maxFiles?: number
  maxSize?: number // MB
  className?: string
}

interface UploadedFile {
  id: string
  name: string
  type: string
  size: number
  url: string
  status: "uploading" | "analyzing" | "completed" | "error"
  progress: number
  analysis?: any
  error?: string
}

export default function FileUpload({
  onFilesUploaded,
  onFileAnalyzed,
  maxFiles = 5,
  maxSize = 25,
  className,
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <ImageIcon size={16} />
    if (type.startsWith("audio/")) return <Music size={16} />
    if (type.includes("pdf") || type.includes("document")) return <File size={16} />
    return <File size={16} />
  }

  const getFileTypeColor = (type: string) => {
    if (type.startsWith("image/")) return "bg-green-900 text-green-300"
    if (type.startsWith("audio/")) return "bg-purple-900 text-purple-300"
    if (type.includes("pdf") || type.includes("document")) return "bg-blue-900 text-blue-300"
    return "bg-gray-900 text-gray-300"
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize * 1024 * 1024) {
      return `Arquivo muito grande. Máximo ${maxSize}MB`
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "audio/mpeg",
      "audio/wav",
      "audio/ogg",
      "audio/mp4",
      "application/pdf",
      "text/plain",
      "text/csv",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]

    if (!allowedTypes.includes(file.type)) {
      return "Tipo de arquivo não suportado"
    }

    return null
  }

  const analyzeFile = async (file: UploadedFile) => {
    try {
      setFiles((prev) => prev.map((f) => (f.id === file.id ? { ...f, status: "analyzing", progress: 50 } : f)))

      let endpoint = ""
      if (file.type.startsWith("image/")) {
        endpoint = "/api/analyze/image"
      } else if (file.type.startsWith("audio/")) {
        endpoint = "/api/analyze/audio"
      } else {
        endpoint = "/api/analyze/document"
      }

      const formData = new FormData()
      const response = await fetch(file.url)
      const blob = await response.blob()
      formData.append("file", blob, file.name)

      const analysisResponse = await fetch(endpoint, {
        method: "POST",
        body: formData,
      })

      if (!analysisResponse.ok) {
        throw new Error("Falha na análise do arquivo")
      }

      const analysis = await analysisResponse.json()

      setFiles((prev) =>
        prev.map((f) => (f.id === file.id ? { ...f, status: "completed", progress: 100, analysis } : f)),
      )

      onFileAnalyzed(file.id, analysis)
    } catch (error) {
      console.error("Erro na análise:", error)
      setFiles((prev) => prev.map((f) => (f.id === file.id ? { ...f, status: "error", error: "Falha na análise" } : f)))
    }
  }

  const processFiles = useCallback(
    async (fileList: FileList) => {
      const newFiles: UploadedFile[] = []

      for (let i = 0; i < Math.min(fileList.length, maxFiles - files.length); i++) {
        const file = fileList[i]
        const error = validateFile(file)

        if (error) {
          // Mostrar erro temporariamente
          const errorFile: UploadedFile = {
            id: `error-${Date.now()}-${i}`,
            name: file.name,
            type: file.type,
            size: file.size,
            url: "",
            status: "error",
            progress: 0,
            error,
          }
          newFiles.push(errorFile)
          continue
        }

        const uploadedFile: UploadedFile = {
          id: `file-${Date.now()}-${i}`,
          name: file.name,
          type: file.type,
          size: file.size,
          url: URL.createObjectURL(file),
          status: "uploading",
          progress: 0,
        }

        newFiles.push(uploadedFile)

        // Simular upload
        setTimeout(() => {
          setFiles((prev) =>
            prev.map((f) => (f.id === uploadedFile.id ? { ...f, status: "analyzing", progress: 30 } : f)),
          )

          // Iniciar análise
          analyzeFile(uploadedFile)
        }, 500)
      }

      setFiles((prev) => [...prev, ...newFiles])
      onFilesUploaded(newFiles.filter((f) => f.status !== "error"))
    },
    [files.length, maxFiles, onFilesUploaded],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      const droppedFiles = e.dataTransfer.files
      if (droppedFiles.length > 0) {
        processFiles(droppedFiles)
      }
    },
    [processFiles],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = e.target.files
      if (selectedFiles && selectedFiles.length > 0) {
        processFiles(selectedFiles)
      }
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    },
    [processFiles],
  )

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })

      // Criar elemento de vídeo temporário para captura
      const video = document.createElement("video")
      video.srcObject = stream
      video.play()

      video.onloadedmetadata = () => {
        const canvas = document.createElement("canvas")
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        const ctx = canvas.getContext("2d")
        ctx?.drawImage(video, 0, 0)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const file = new File([blob], `camera-${Date.now()}.jpg`, { type: "image/jpeg" })
              const fileList = new DataTransfer()
              fileList.items.add(file)
              processFiles(fileList.files)
            }

            // Parar stream
            stream.getTracks().forEach((track) => track.stop())
          },
          "image/jpeg",
          0.9,
        )
      }
    } catch (error) {
      console.error("Erro ao acessar câmera:", error)
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      const chunks: BlobPart[] = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" })
        const file = new File([blob], `recording-${Date.now()}.webm`, { type: "audio/webm" })
        const fileList = new DataTransfer()
        fileList.items.add(file)
        processFiles(fileList.files)

        // Limpar stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop())
        }
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error("Erro ao iniciar gravação:", error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const removeFile = (fileId: string) => {
    setFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === fileId)
      if (fileToRemove?.url) {
        URL.revokeObjectURL(fileToRemove.url)
      }
      return prev.filter((f) => f.id !== fileId)
    })
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      <Card
        className={cn(
          "border-2 border-dashed transition-colors cursor-pointer",
          isDragging ? "border-cyan-500 bg-cyan-950/20" : "border-gray-600 hover:border-gray-500",
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="p-6 text-center">
          <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
          <p className="text-sm text-gray-300 mb-2">Arraste arquivos aqui ou clique para selecionar</p>
          <p className="text-xs text-gray-500">
            Máximo {maxFiles} arquivos, {maxSize}MB cada
          </p>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={startCamera}
          className="bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700"
        >
          <Camera size={16} className="mr-2" />
          Câmera
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={isRecording ? stopRecording : startRecording}
          className={cn(
            "border-gray-700 text-gray-200 hover:bg-gray-700",
            isRecording ? "bg-red-900 border-red-700" : "bg-gray-800",
          )}
        >
          <Mic size={16} className="mr-2" />
          {isRecording ? "Parar" : "Gravar"}
        </Button>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file) => (
            <Card key={file.id} className="p-3 bg-gray-800 border-gray-700">
              <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded", getFileTypeColor(file.type))}>{getFileIcon(file.type)}</div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-gray-200 truncate">{file.name}</p>
                    <Badge variant="outline" className="text-xs">
                      {formatFileSize(file.size)}
                    </Badge>
                  </div>

                  {file.status === "error" ? (
                    <p className="text-xs text-red-400">{file.error}</p>
                  ) : (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {file.status === "uploading" && <Loader2 size={12} className="animate-spin text-cyan-400" />}
                        {file.status === "analyzing" && <Loader2 size={12} className="animate-spin text-yellow-400" />}
                        {file.status === "completed" && <Check size={12} className="text-green-400" />}
                        <span className="text-xs text-gray-400">
                          {file.status === "uploading" && "Enviando..."}
                          {file.status === "analyzing" && "Analisando..."}
                          {file.status === "completed" && "Concluído"}
                        </span>
                      </div>

                      {file.status !== "completed" && <Progress value={file.progress} className="h-1" />}

                      {file.analysis && (
                        <p className="text-xs text-gray-400 mt-1">{file.analysis.summary || "Análise concluída"}</p>
                      )}
                    </div>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFile(file.id)
                  }}
                  className="text-gray-400 hover:text-red-400 h-8 w-8 p-0"
                >
                  <X size={14} />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,audio/*,.pdf,.txt,.csv,.doc,.docx"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  )
}
