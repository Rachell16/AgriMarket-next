'use client'
import { useState } from 'react'

const STYLE: Record<string, string> = {
  Tinggi: 'bg-red-100 text-red-700 border-red-300',
  Sedang: 'bg-amber-100 text-amber-700 border-amber-300',
  Rendah: 'bg-green-100 text-green-700 border-green-300',
}

export function BadgePrioritas({
  prioritas,
  alasan,
}: {
  prioritas: 'Tinggi' | 'Sedang' | 'Rendah'
  alasan: string[]
}) {
  const [buka, setBuka] = useState(false)
  return (
    <div className="relative inline-block">
      <button
        onClick={() => setBuka((v) => !v)}
        className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${STYLE[prioritas]}`}
        title="Klik untuk lihat alasan AI"
      >
        Prioritas {prioritas} ⓘ
      </button>
      {buka && (
        <div className="absolute z-10 mt-1 w-64 bg-white border rounded-lg shadow-lg p-3 text-xs text-gray-700">
          <p className="font-semibold mb-1">Alasan keputusan AI (Decision Tree):</p>
          <ul className="list-disc list-inside space-y-0.5">
            {alasan.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
