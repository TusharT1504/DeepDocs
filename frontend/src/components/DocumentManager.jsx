"use client"

import React, { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, FileText, Trash2, X, File, Calendar, User, HardDrive } from "lucide-react"

const DocumentManager = React.memo(({ documents, onUpload, onRemove, onClose }) => {
  const [uploading, setUploading] = useState(false)

  const onDrop = useCallback(
    async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return

      setUploading(true)
      try {
        for (const file of acceptedFiles) {
          await onUpload(file)
        }
      } catch (error) {
        console.error("Upload error:", error)
      } finally {
        setUploading(false)
      }
    },
    [onUpload],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    multiple: true,
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  const formatFileSize = useCallback((bytes) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }, [])

  const formatDate = useCallback((dateString) => {
    return new Date(dateString).toLocaleDateString()
  }, [])

  const handleRemove = useCallback(
    (docId) => {
      if (window.confirm("Are you sure you want to remove this document?")) {
        onRemove(docId)
      }
    },
    [onRemove],
  )

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#111111]">Documents</h2>
          <button
            onClick={onClose}
            className="xl:hidden p-2 rounded-lg hover:bg-[#f9f9f9] transition-colors"
            aria-label="Close documents panel"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Upload area */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200
            ${isDragActive ? "border-black bg-[#f9f9f9]" : "border-gray-200 hover:border-gray-300 hover:bg-[#f9f9f9]"}
            ${uploading ? "opacity-50 cursor-not-allowed" : ""}
          `}
        >
          <input {...getInputProps()} />
          <div className="w-10 h-10 bg-[#f9f9f9] rounded-full flex items-center justify-center mx-auto mb-3">
            <Upload className="w-5 h-5 text-gray-600" />
          </div>
          {isDragActive ? (
            <p className="text-[#111111] font-medium">Drop the PDF files here...</p>
          ) : (
            <div>
              <p className="text-[#111111] font-medium mb-1">Drag & drop PDF files here</p>
              <p className="text-base text-gray-600 mb-2">or click to select files</p>
              <p className="text-sm text-gray-500">Maximum file size: 10MB</p>
            </div>
          )}
          {uploading && (
            <div className="mt-3">
              <div className="w-5 h-5 border-2 border-gray-300 border-t-black rounded-full animate-spin mx-auto"></div>
              <p className="text-base text-gray-600 mt-2">Uploading...</p>
            </div>
          )}
        </div>
      </div>

      {/* Documents list */}
      <div className="flex-1 overflow-y-auto p-4">
        {documents.length === 0 ? (
          <div className="text-center text-gray-600 py-8">
            <div className="w-12 h-12 bg-[#f9f9f9] rounded-full flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6 text-gray-400" />
            </div>
            <p className="font-medium text-[#111111] mb-1">No documents uploaded</p>
            <p className="text-base text-gray-600">Upload PDF files to start chatting</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc._id}
                className="bg-[#f9f9f9] rounded-xl p-4 border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                        <File className="w-4 h-4 text-gray-600" />
                      </div>
                      <h3 className="text-base font-medium text-[#111111] truncate">{doc.originalName || doc.title}</h3>
                    </div>

                    <div className="space-y-1 text-sm text-gray-600">
                      {doc.pages && (
                        <div className="flex items-center space-x-1">
                          <FileText className="w-3 h-3" />
                          <span>{doc.pages} pages</span>
                        </div>
                      )}

                      {doc.author && (
                        <div className="flex items-center space-x-1">
                          <User className="w-3 h-3" />
                          <span className="truncate">{doc.author}</span>
                        </div>
                      )}

                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>Uploaded {formatDate(doc.uploadedAt)}</span>
                      </div>

                      {doc.size && (
                        <div className="flex items-center space-x-1">
                          <HardDrive className="w-3 h-3" />
                          <span>{formatFileSize(doc.size)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemove(doc._id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-2"
                    title="Remove document"
                    aria-label="Remove document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 flex-shrink-0">
        <div className="text-sm text-gray-600 text-center font-medium">
          {documents.length} document{documents.length !== 1 ? "s" : ""} uploaded
        </div>
      </div>
    </div>
  )
})

DocumentManager.displayName = "DocumentManager"

export default DocumentManager
