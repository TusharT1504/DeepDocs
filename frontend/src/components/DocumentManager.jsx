import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Trash2, X, File, Calendar, User } from 'lucide-react';

const DocumentManager = ({ documents, onUpload, onRemove, onClose }) => {
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    setUploading(true);
    try {
      for (const file of acceptedFiles) {
        await onUpload(file);
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: true,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Documents</h2>
        </div>
      </div>

      {/* Upload area */}
      <div className="p-4 border-b border-gray-200">
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-primary-400 bg-primary-50' : 'border-gray-300 hover:border-gray-400'}
            ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input {...getInputProps()} />
          <Upload size={32} className="mx-auto mb-2 text-gray-400" />
          {isDragActive ? (
            <p className="text-primary-600">Drop the PDF files here...</p>
          ) : (
            <div>
              <p className="text-gray-600 mb-1">
                Drag & drop PDF files here, or click to select
              </p>
              <p className="text-xs text-gray-500">
                Maximum file size: 10MB
              </p>
            </div>
          )}
          {uploading && (
            <div className="mt-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-1">Uploading...</p>
            </div>
          )}
        </div>
      </div>

      {/* Documents list */}
      <div className="flex-1 overflow-y-auto p-4">
        {documents.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <FileText size={48} className="mx-auto mb-2 opacity-50" />
            <p>No documents uploaded</p>
            <p className="text-sm">Upload PDF files to start chatting</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc._id}
                className="bg-gray-50 rounded-lg p-3 border border-gray-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <File size={16} className="text-gray-400" />
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {doc.originalName || doc.title}
                      </h3>
                    </div>
                    
                    <div className="space-y-1 text-xs text-gray-500">
                      {doc.pages && (
                        <div className="flex items-center space-x-1">
                          <FileText size={12} />
                          <span>{doc.pages} pages</span>
                        </div>
                      )}
                      
                      {doc.author && (
                        <div className="flex items-center space-x-1">
                          <User size={12} />
                          <span>{doc.author}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-1">
                        <Calendar size={12} />
                        <span>Uploaded {formatDate(doc.uploadedAt)}</span>
                      </div>
                      
                      {doc.size && (
                        <span>{formatFileSize(doc.size)}</span>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => onRemove(doc._id)}
                    className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Remove document"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          {documents.length} document{documents.length !== 1 ? 's' : ''} uploaded
        </div>
      </div>
    </div>
  );
};

export default DocumentManager; 