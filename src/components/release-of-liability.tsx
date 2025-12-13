import React from "react";
import Link from "next/link";

const WAIVER_PDF_PATH = "/legal/ruh-roh-liability-waiver.pdf";

const ReleaseOfLiabilityComponent: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-10">
        <div className="flex flex-col gap-4 mb-8">
          <p className="uppercase tracking-widest text-sm font-semibold text-[#1A9CB0]">Legal</p>
          <h1 className="text-3xl md:text-4xl font-bold text-[#333333]">Waiver and Release of Liability</h1>
          <p className="text-base text-gray-700">Last Updated: October 5, 2025</p>
          <p className="text-base text-gray-700">
            This page provides access to our Waiver and Release of Liability in PDF format. Please review the full document.
          </p>
          <Link
            href={WAIVER_PDF_PATH}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 rounded-full bg-[#1A9CB0] text-white font-semibold hover:bg-[#158294] transition-colors w-fit"
          >
            View PDF
          </Link>
        </div>

        <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
          <object
            data={WAIVER_PDF_PATH}
            type="application/pdf"
            className="w-full h-[80vh]"
          >
            <div className="p-6 text-sm text-gray-700 space-y-4">
              <p>
                It looks like your browser cannot display the PDF inline. You can download the Waiver instead:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  <Link href={WAIVER_PDF_PATH} target="_blank" rel="noopener noreferrer" className="text-[#1A9CB0] font-semibold hover:underline">
                    Download the PDF
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

export default ReleaseOfLiabilityComponent;
