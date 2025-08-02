'use client'
import { useEffect, useRef } from 'react'
import html2pdf from 'html2pdf.js'

export default function GeneratePDFPage() {
  const pdfRef = useRef(null)

  const handleDownload = () => {
    const element = pdfRef.current
    const opt = {
      margin:       0.5,
      filename:     'my-notes.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
    }
    html2pdf().set(opt).from(element).save()
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-[#fef6d8] min-h-screen">
      <div ref={pdfRef} className="bg-[#fff8dc] p-10 max-w-2xl w-full shadow-lg rounded-xl text-[#222] font-sans">
        <h1 className="text-3xl font-bold border-b-2 pb-2 mb-6">📘 My Notes</h1>
        
        <h2 className="text-2xl font-semibold mb-3 mt-6">1. Introduction</h2>
        <p className="mb-4">
          This is a <strong>sample note</strong> that will look amazing in PDF. It supports real headings, spacing, and styles.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">2. Key Points</h2>
        <ul className="list-disc list-inside space-y-1 text-[16px]">
          <li>Easy to read</li>
          <li>Organized content</li>
          <li>Pale yellow background like real notebook</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-2">3. Final Thoughts</h2>
        <p>
          With <code>html2pdf</code> and good styling, you can convert any digital note into a beautiful, shareable PDF.
        </p>
      </div>

      <button
        onClick={handleDownload}
        className="mt-8 bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg shadow-lg transition"
      >
        Download as PDF
      </button>
    </div>
  )
}
