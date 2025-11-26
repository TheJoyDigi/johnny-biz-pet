import React from "react";
import Link from "next/link";

const TERMS_PDF_PATH = "/legal/terms-of-service.pdf";
const TERMS_DOCX_PATH = "/legal/terms-of-service.docx";

const TermsOfUseComponent: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-10">
        <div className="flex flex-col gap-4 mb-8">
          <p className="uppercase tracking-widest text-sm font-semibold text-[#1A9CB0]">Terms of Service</p>
          <h1 className="text-3xl md:text-4xl font-bold text-[#333333]">Ruh-Roh Retreat Terms of Service</h1>
          <p className="text-base text-gray-700">
            Last Updated: October 5, 2025
          </p>
          <p className="text-base text-gray-700">
            This page provides access to the current Terms of Service in both PDF and DOCX formats. Please review the full document before booking.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={TERMS_PDF_PATH}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 rounded-full bg-[#1A9CB0] text-white font-semibold hover:bg-[#158294] transition-colors"
            >
              View PDF
            </Link>
            <Link
              href={TERMS_DOCX_PATH}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 rounded-full bg-white border border-[#1A9CB0] text-[#1A9CB0] font-semibold hover:bg-[#E0F7FA] transition-colors"
            >
              Download DOCX
            </Link>
          </div>
        </div>

        <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
          <object
            data={TERMS_PDF_PATH}
            type="application/pdf"
            className="w-full h-[80vh]"
          >
            <div className="p-6 text-sm text-gray-700 space-y-4">
              <p>
                It looks like your browser cannot display the PDF inline. You can download the Terms of Service instead:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  <Link href={TERMS_PDF_PATH} target="_blank" rel="noopener noreferrer" className="text-[#1A9CB0] font-semibold hover:underline">
                    Download the PDF
                  </Link>
                </li>
                <li>
                  <Link href={TERMS_DOCX_PATH} target="_blank" rel="noopener noreferrer" className="text-[#1A9CB0] font-semibold hover:underline">
                    Download the DOCX
                  </Link>
                </li>
              </ul>
            </div>
          </object>
        </div>
      </div>
    </div>
  );
};

export default TermsOfUseComponent;
