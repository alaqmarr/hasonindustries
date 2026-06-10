"use client"

import React, { useState, useEffect } from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical } from "lucide-react"

interface SortableRowProps {
  id: string
  item: any
  columns: {
    header: string
    render: (item: any) => React.ReactNode
    className?: string
  }[]
}

function SortableRow({ id, item, columns }: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
  }

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`border-b border-neutral-200 hover:bg-[#262626] transition-colors group bg-white ${
        isDragging ? "bg-neutral-50 shadow-lg relative" : ""
      }`}
    >
      <td className="p-4 w-12 text-neutral-400 group-hover:text-white transition-colors">
        <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1">
          <GripVertical className="w-5 h-5" />
        </button>
      </td>
      {columns.map((col, idx) => (
        <td key={idx} className={`p-4 ${col.className || ""}`}>
          {col.render(item)}
        </td>
      ))}
    </tr>
  )
}

interface DraggableTableProps {
  items: any[]
  columns: {
    header: string
    render: (item: any) => React.ReactNode
    className?: string
  }[]
  onReorder: (newItems: any[]) => void
}

export function DraggableTable({ items: initialItems, columns, onReorder }: DraggableTableProps) {
  const [items, setItems] = useState(initialItems)

  // Sync state if props change (e.g. from server action revalidation)
  useEffect(() => {
    setItems(initialItems)
  }, [initialItems])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id)
        const newIndex = items.findIndex((i) => i.id === over.id)

        const newArray = arrayMove(items, oldIndex, newIndex)
        
        // Re-assign order sequentially based on new array position
        const updatedArray = newArray.map((item, index) => ({
          ...item,
          order: index,
        }))

        // Call the parent handler
        onReorder(updatedArray)
        return updatedArray
      })
    }
  }

  if (items.length === 0) {
    return (
      <div className="p-8 text-center text-[#52525B] font-['DM_Mono'] text-sm uppercase bg-[#FAFAFA] border border-neutral-200">
        No items found in this category.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto border border-neutral-200">
      <table className="w-full text-left font-['DM_Mono'] text-sm bg-white">
        <thead className="bg-[#FAFAFA] border-b border-neutral-200 text-[#52525B] text-xs uppercase tracking-widest">
          <tr>
            <th className="p-4 w-12">Sort</th>
            {columns.map((col, idx) => (
              <th key={idx} className={`p-4 font-normal ${col.className || ""}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
              {items.map((item) => (
                <SortableRow key={item.id} id={item.id} item={item} columns={columns} />
              ))}
            </SortableContext>
          </DndContext>
        </tbody>
      </table>
    </div>
  )
}
