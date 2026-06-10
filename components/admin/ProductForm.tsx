"use client"

import { useState, useCallback, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import { useRouter } from "next/navigation"
import { ImagePlus, X, Loader2, Plus, Trash2 } from "lucide-react"
import toast from "react-hot-toast"
import dynamic from "next/dynamic"

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false })
import "react-quill-new/dist/quill.snow.css"

export function ProductForm({ initialData = null }: { initialData?: any }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categories, setCategories] = useState<{ id: string, name: string }[]>([])

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    categoryId: initialData?.categoryId || "",
    description: initialData?.description || "",
    featured: initialData?.featured || false
  })

  // Start with empty or parsed specs
  const [specs, setSpecs] = useState<{ key: string, value: string }[]>(
    initialData?.specs
      ? Object.entries(initialData.specs).map(([key, value]) => ({ key, value: value as string }))
      : [{ key: "Dimensions", value: "" }]
  )

  const [files, setFiles] = useState<File[]>([])
  const [existingImages, setExistingImages] = useState<string[]>(initialData?.imageKeys || [])

  useEffect(() => {
    fetch('/api/admin/product-categories').then(res => res.json()).then(data => setCategories(data)).catch(() => { })
  }, [])

  const imageHandler = useCallback(function (this: any) {
    const input = document.createElement("input")
    input.setAttribute("type", "file")
    input.setAttribute("accept", "image/*")
    input.click()

    input.onchange = async () => {
      const file = input.files ? input.files[0] : null
      if (!file) return

      const toastId = toast.loading("Uploading inline image...")
      try {
        const presignRes = await fetch('/api/admin/upload/presign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: file.name, contentType: file.type, folder: 'products' })
        })
        const { presignedUrl, key } = await presignRes.json()

        await fetch(presignedUrl, {
          method: 'PUT',
          body: file,
          headers: { 'Content-Type': file.type }
        })

        const quillObj = this.quill
        const range = quillObj.getSelection()
        const url = `https://pub-723d911c6a3442c78b2f69b731577d2b.r2.dev/${key}`

        quillObj.insertEmbed(range?.index || 0, "image", url)
        toast.success("Image embedded", { id: toastId })
      } catch (e) {
        toast.error("Image upload failed", { id: toastId })
      }
    }
  }, [])

  const modules = {
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        ['link', 'image', 'video'],
        ['clean']
      ],
      handlers: {
        image: imageHandler
      }
    }
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] }
  })

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const removeExistingImage = (keyToRemove: string) => {
    setExistingImages(prev => prev.filter(key => key !== keyToRemove))
  }

  const addSpec = () => setSpecs([...specs, { key: "", value: "" }])
  const removeSpec = (index: number) => setSpecs(specs.filter((_, i) => i !== index))
  const updateSpec = (index: number, field: "key" | "value", val: string) => {
    const newSpecs = [...specs]
    newSpecs[index][field] = val
    setSpecs(newSpecs)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    const toastId = toast.loading(initialData ? "Updating Product..." : "Saving Product...")

    try {
      let uploadedKeys: string[] = []

      // Upload new files
      if (files.length > 0) {
        toast.loading("Uploading images...", { id: toastId })
        for (const file of files) {
          const presignRes = await fetch('/api/admin/upload/presign', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename: file.name, contentType: file.type, folder: 'products' })
          })
          const { presignedUrl, key } = await presignRes.json()

          await fetch(presignedUrl, {
            method: 'PUT',
            body: file,
            headers: { 'Content-Type': file.type }
          })
          uploadedKeys.push(key)
        }
      }

      const finalImageKeys = [...existingImages, ...uploadedKeys]
      const specsObj = specs.reduce((acc, curr) => {
        if (curr.key.trim()) acc[curr.key] = curr.value
        return acc
      }, {} as Record<string, string>)

      toast.loading("Saving Data...", { id: toastId })

      const payload = {
        ...formData,
        categoryId: formData.categoryId || null,
        specsStr: JSON.stringify(specsObj),
        imageKeys: finalImageKeys,
        id: initialData?.id
      }

      const res = await fetch(initialData ? '/api/admin/products/update' : '/api/admin/products', {
        method: initialData ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) throw new Error("Database Error")

      toast.success("Product Saved", { id: toastId })
      router.push('/admin/products')
      router.refresh()

    } catch (error) {
      toast.error("Failed to save product", { id: toastId })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Basic Info */}
        <div className="space-y-6">
          <h2 className="text-sm font-['DM_Mono'] text-[#09090B] tracking-widest uppercase pb-2 border-b border-neutral-200">
            Basic Information
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs uppercase font-['DM_Mono'] tracking-widest text-[#52525B] mb-2">Product Name</label>
              <input type="text" required className="w-full border p-3 focus:border-[#10B981] outline-none bg-white"
                value={formData.name} onChange={e => {
                  const name = e.target.value
                  setFormData({
                    ...formData,
                    name,
                    slug: !initialData ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : formData.slug
                  })
                }} />
            </div>

            <div>
              <label className="block text-xs uppercase font-['DM_Mono'] tracking-widest text-[#52525B] mb-2">URL Link (Slug)</label>
              <input type="text" required className="w-full border p-3 focus:border-[#10B981] outline-none bg-white"
                value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} />
            </div>

            <div>
              <label className="block text-xs uppercase font-['DM_Mono'] tracking-widest text-[#52525B] mb-2">Category (Optional)</label>
              <select className="w-full border p-3 focus:border-[#10B981] outline-none bg-white"
                value={formData.categoryId || ""} onChange={e => setFormData({ ...formData, categoryId: e.target.value })}>
                <option value="">None (Uncategorized)</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-neutral-100">
              <input type="checkbox" id="featured" className="w-4 h-4 accent-[#10B981]"
                checked={formData.featured} onChange={e => setFormData({ ...formData, featured: e.target.checked })} />
              <label htmlFor="featured" className="text-xs uppercase font-['DM_Mono'] tracking-widest text-[#10B981] cursor-pointer">
                Show on Homepage Carousel
              </label>
            </div>
          </div>
        </div>

        {/* Specifications */}
        <div className="space-y-6">
          <h2 className="text-sm font-['DM_Mono'] text-[#09090B] tracking-widest uppercase pb-2 border-b border-neutral-200">
            Details & Specifications
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs uppercase font-['DM_Mono'] tracking-widest text-[#52525B] mb-2">Description (Rich HTML)</label>
              <div className="bg-white border focus-within:border-[#10B981] transition-colors">
                {/* @ts-ignore */}
                <ReactQuill
                  theme="snow"
                  value={formData.description}
                  onChange={(val: string) => setFormData({ ...formData, description: val })}
                  modules={modules}
                  className="h-64 mb-12"
                />
              </div>
            </div>

            <div className="border border-neutral-200 bg-neutral-50 p-4">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-xs uppercase font-['DM_Mono'] tracking-widest text-[#52525B]">Add Specifications</label>
                <button type="button" onClick={addSpec} className="bg-[#10B981] text-white p-1 rounded-sm hover:bg-[#0B8A4C]">
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                {specs.map((spec, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <input type="text" placeholder="Key (e.g. Color)" className="flex-1 w-full border p-2 focus:border-[#10B981] outline-none text-sm"
                      value={spec.key} onChange={e => updateSpec(index, "key", e.target.value)} />
                    <input type="text" placeholder="Value (e.g. Red)" className="flex-1 w-full border p-2 focus:border-[#10B981] outline-none text-sm"
                      value={spec.value} onChange={e => updateSpec(index, "value", e.target.value)} />
                    <button type="button" onClick={() => removeSpec(index)} className="p-2 text-rose-500 hover:bg-rose-50 transition-colors bg-white border border-neutral-200">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6 border-t border-neutral-200 pt-8">
        <h2 className="text-sm font-['DM_Mono'] text-[#09090B] tracking-widest uppercase pb-2 border-b border-neutral-200">
          Product Images (Upload)
        </h2>

        <div {...getRootProps()} className={`border-2 border-dashed p-10 text-center cursor-pointer transition-colors bg-white ${isDragActive ? 'border-[#10B981] bg-[#10B981]/5' : 'border-neutral-300 hover:border-[#10B981]'}`}>
          <input {...getInputProps()} />
          <ImagePlus className="w-8 h-8 mx-auto mb-4 text-[#10B981]" />
          <p className="font-['DM_Mono'] text-xs uppercase tracking-widest text-[#52525B]">Drag & Drop Images or Click to Browse</p>
        </div>

        {(files.length > 0 || existingImages.length > 0) && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {existingImages.map((key) => (
              <div key={key} className="relative group aspect-square bg-neutral-100 border border-neutral-200">
                <img src={`https://pub-723d911c6a3442c78b2f69b731577d2b.r2.dev/${key}`} alt="product" className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeExistingImage(key)} className="absolute top-2 right-2 bg-rose-500 text-white p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            {files.map((file, i) => (
              <div key={`new-${i}`} className="relative group aspect-square bg-neutral-100 border border-neutral-200">
                <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeFile(i)} className="absolute top-2 right-2 bg-rose-500 text-white p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute top-2 left-2 bg-[#10B981] text-white text-[9px] uppercase font-['DM_Mono'] px-1 py-0.5">NEW</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button disabled={isSubmitting} type="submit" className="bg-[#09090B] text-[#FAFAFA] font-['DM_Mono'] text-sm font-bold uppercase tracking-widest px-8 py-4 w-full hover:bg-[#10B981] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-8">
        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
        {initialData ? "Update Product" : "Save Product"}
      </button>
    </form>
  )
}
