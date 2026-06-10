import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

type Params = Promise<{ id: string }>

export async function GET(req: Request, segmentData: { params: Params }) {
  const session = await auth()
  if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  const { id } = await segmentData.params
  try {
    const material = await prisma.material.findUnique({
      where: { id }
    })
    if (!material) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 })
    return NextResponse.json({ success: true, data: material })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Database error" }, { status: 500 })
  }
}

export async function PUT(req: Request, segmentData: { params: Params }) {
  const session = await auth()
  if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  const { id } = await segmentData.params

  try {
    const json = await req.json()
    const { name, slug, categoryId, description, specsStr, imageKeys } = json

    const specs = specsStr ? JSON.parse(specsStr) : {}

    const material = await prisma.material.update({
      where: { id },
      data: {
        name,
        slug,
        categoryId: categoryId || null,
        description,
        specs,
        imageKeys: imageKeys || [],
      }
    })
    return NextResponse.json({ success: true, data: material })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Invalid data" }, { status: 400 })
  }
}

export async function DELETE(req: Request, segmentData: { params: Params }) {
  const session = await auth()
  if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  const { id } = await segmentData.params

  try {
    await prisma.material.delete({
      where: { id }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Database error" }, { status: 500 })
  }
}
