import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Image as ImageIcon, Loader2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'react-toastify'

interface ImageUploadProps {
  onImageUpload: (imageUrl: string) => void
  currentImage?: string
  className?: string
}

interface UploadedImage {
  file: File
  preview: string
  uploading: boolean
  uploaded: boolean
  url?: string
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageUpload,
  currentImage,
  className = ''
}) => {
  const [images, setImages] = useState<UploadedImage[]>([])

  // Simulate image upload to a cloud service
  // In a real app, you would upload to services like Cloudinary, AWS S3, etc.
  const uploadImageToCloud = async (file: File): Promise<string> => {
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Create a fake URL (in production, this would be the actual uploaded URL)
    const fakeUrl = `https://images.deliciousbakes.com/${Date.now()}-${file.name}`
    return fakeUrl
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newImages = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      uploading: false,
      uploaded: false
    }))

    setImages(prev => [...prev, ...newImages])

    // Upload each image
    for (let i = 0; i < newImages.length; i++) {
      const imageIndex = images.length + i
      
      // Update uploading state
      setImages(prev => prev.map((img, idx) => 
        idx === imageIndex ? { ...img, uploading: true } : img
      ))

      try {
        const uploadedUrl = await uploadImageToCloud(newImages[i].file)
        
        // Update uploaded state
        setImages(prev => prev.map((img, idx) => 
          idx === imageIndex 
            ? { ...img, uploading: false, uploaded: true, url: uploadedUrl }
            : img
        ))

        // Call the callback with the uploaded URL
        onImageUpload(uploadedUrl)
        toast.success('Image uploaded successfully!')
        
      } catch (error) {
        console.error('Upload failed:', error)
        toast.error('Failed to upload image')
        
        // Update failed state
        setImages(prev => prev.map((img, idx) => 
          idx === imageIndex ? { ...img, uploading: false } : img
        ))
      }
    }
  }, [images.length, onImageUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 5,
    maxSize: 5 * 1024 * 1024, // 5MB
    onDropRejected: (rejectedFiles) => {
      rejectedFiles.forEach(({ file, errors }) => {
        errors.forEach(error => {
          if (error.code === 'file-too-large') {
            toast.error(`${file.name} is too large. Max size is 5MB.`)
          } else if (error.code === 'file-invalid-type') {
            toast.error(`${file.name} is not a valid image type.`)
          } else {
            toast.error(`Error with ${file.name}: ${error.message}`)
          }
        })
      })
    }
  })

  const removeImage = (index: number) => {
    setImages(prev => {
      const newImages = [...prev]
      URL.revokeObjectURL(newImages[index].preview)
      newImages.splice(index, 1)
      return newImages
    })
  }

  const useCurrentImage = () => {
    if (currentImage) {
      onImageUpload(currentImage)
      toast.success('Using current image')
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Current Image Display */}
      {currentImage && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <img
                src={currentImage}
                alt="Current product image"
                className="w-20 h-20 object-cover rounded-lg"
              />
              <div className="flex-1">
                <p className="font-medium">Current Image</p>
                <p className="text-sm text-gray-500">Click to use this image</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={useCurrentImage}
              >
                Use Current
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Area */}
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive 
                ? 'border-amber-500 bg-amber-50' 
                : 'border-gray-300 hover:border-amber-400 hover:bg-amber-50'
              }
            `}
          >
            <input {...getInputProps()} />
            
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <Upload className="w-6 h-6 text-amber-600" />
              </div>
              
              <div>
                <p className="text-lg font-medium text-gray-900">
                  {isDragActive ? 'Drop images here' : 'Upload product images'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Drag and drop images here, or click to select files
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Supports: JPEG, PNG, GIF, WebP (max 5MB each, up to 5 files)
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Images Preview */}
      {images.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium mb-3">Uploaded Images</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={image.preview}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Upload Status Overlay */}
                    {image.uploading && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="text-center text-white">
                          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                          <p className="text-sm">Uploading...</p>
                        </div>
                      </div>
                    )}
                    
                    {image.uploaded && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                    
                    {/* Remove Button */}
                    {!image.uploading && (
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 left-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    )}
                  </div>
                  
                  {/* Image Info */}
                  <div className="mt-2">
                    <p className="text-sm font-medium truncate">{image.file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(image.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    {image.uploaded && image.url && (
                      <p className="text-xs text-green-600">✓ Uploaded</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Guidelines */}
      <Card className="bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <ImageIcon className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Image Guidelines</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Use high-quality images that showcase your products clearly</li>
                <li>• Square images (1:1 ratio) work best for product displays</li>
                <li>• Ensure good lighting and clean backgrounds</li>
                <li>• Images will be automatically optimized for web use</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}