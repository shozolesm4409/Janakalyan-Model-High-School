/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { Award, ShieldAlert, Sparkles, Printer, CheckCircle, HelpCircle } from 'lucide-react';

interface AppCertificateProps {
  recipientName: string;
  batch: string;
  registrationId: string;
}

export const AppCertificate: React.FC<AppCertificateProps> = ({ recipientName, batch, registrationId }) => {
  const certificateRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = certificateRef.current?.innerHTML;
    const originalContent = document.body.innerHTML;

    if (printContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Janakalyan Model High School - E-Certificate</title>
              <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Playfair+Display:ital,wght@0,600;0,700;1,400&display=swap" rel="stylesheet">
              <style>
                body {
                  margin: 0;
                  padding: 0;
                  background-color: #ffffff;
                  font-family: 'Inter', sans-serif;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  height: 100vh;
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
                .cert-container {
                  width: 900px;
                  height: 600px;
                  padding: 40px;
                  border: 20px solid #D4AF37;
                  background-color: #FFFFFF;
                  box-sizing: border-box;
                  position: relative;
                  text-align: center;
                  outline: 5px double #0F4C81;
                  outline-offset: -15px;
                }
                .cert-title {
                  font-family: 'Playfair Display', serif;
                  font-size: 38px;
                  font-weight: bold;
                  color: #0F4C81;
                  margin: 10px 0;
                  letter-spacing: 1px;
                }
                .cert-subtitle {
                  font-size: 14px;
                  font-weight: 500;
                  color: #D4AF37;
                  letter-spacing: 3px;
                  text-transform: uppercase;
                  margin-bottom: 30px;
                }
                .cert-text {
                  font-size: 15px;
                  color: #212529;
                  line-height: 1.8;
                  margin: 25px auto;
                  max-width: 650px;
                }
                .cert-name {
                  font-family: 'Playfair Display', serif;
                  font-size: 28px;
                  font-weight: bold;
                  font-style: italic;
                  color: #0F4C81;
                  border-b: 2px solid #D4AF37;
                  display: inline-block;
                  padding-bottom: 5px;
                  margin: 10px 0;
                }
                .cert-footer {
                  display: flex;
                  justify-content: space-between;
                  align-items: flex-end;
                  position: absolute;
                  bottom: 50px;
                  left: 60px;
                  right: 60px;
                }
                .cert-signature {
                  border-top: 1px solid #c0c0c0;
                  width: 180px;
                  font-size: 12px;
                  color: #555555;
                  padding-top: 5px;
                }
                .cert-id {
                  font-family: monospace;
                  font-size: 11px;
                  color: #888888;
                }
                .school-heading {
                  font-size: 20px;
                  font-weight: 700;
                  color: #212529;
                }
                .seal {
                  width: 80px;
                  height: 80px;
                  border: 2px solid #D4AF37;
                  border-radius: 50%;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  font-weight: bold;
                  color: #D4AF37;
                  font-size: 11px;
                  line-height: 1.2;
                  letter-spacing: 1px;
                }
              </style>
            </head>
            <body>
              ${printContent}
              <script>
                window.onload = function() {
                  window.print();
                  window.close();
                }
              <\/script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Preview Frame inside Dashboard */}
      <div className="overflow-x-auto border-4 border-double border-secondary bg-white p-3.5 rounded-xl shadow-lg relative max-w-full">
        
        {/* Printable target wrapper */}
        <div 
          ref={certificateRef}
          className="w-[800px] h-[520px] bg-white border-[16px] border-secondary p-8 box-border relative text-center flex flex-col justify-between"
          style={{ 
            outline: '4px double #0F4C81', 
            outlineOffset: '-12px',
          }}
        >
          {/* Top graphics header */}
          <div className="space-y-1">
            <div className="flex justify-center mb-1">
              <Award className="h-10 w-10 text-secondary" strokeWidth={1.5} />
            </div>
            <h2 className="font-display font-medium text-lg tracking-wide uppercase text-gray-800">
              Janakalyan Model High School
            </h2>
            <div className="text-xs text-secondary font-mono tracking-[4px] uppercase font-semibold">
              Golden Jubilee & Reunion 2026
            </div>
          </div>

          {/* Certificate Main Title */}
          <div>
            <h1 className="font-display text-4.5xl font-bold tracking-tight text-primary">
              Certificate of Attendance
            </h1>
            <div className="text-[10px] text-gray-400 font-mono tracking-widest uppercase mt-0.5">
              স্মারক সম্মাননা ও প্রশংসাপত্র
            </div>
          </div>

          {/* Recipient specification */}
          <div className="space-y-2">
            <p className="text-gray-500 font-sans italic text-sm">
              This digital certificate is proudly presented to
            </p>
            <h3 className="font-display text-2.5xl font-bold italic border-b border-secondary/40 pb-1 inline-block text-primary">
              {recipientName}
            </h3>
            <p className="text-gray-600 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
              who successfully registered as an alumnus representing the SSC <strong>Batch of {batch}</strong>, participating in the grand celebration of the 50th Golden Jubilee of modern education excellence.
            </p>
          </div>

          {/* Certificate footer signatures and seal */}
          <div className="flex items-end justify-between px-6">
            
            {/* Convening Signee */}
            <div className="text-center space-y-1.5 w-44">
              <div className="font-display italic text-sm text-gray-700">Abdul Quadir</div>
              <div className="border-t border-gray-200 pt-1 text-[10px] text-gray-500 font-medium">
                Convener, Jubilee Committee
              </div>
            </div>

            {/* School Central Seal */}
            <div className="h-16 w-16 border-2 border-secondary rounded-full flex flex-col items-center justify-center text-[8px] text-secondary font-bold uppercase leading-tight p-1 select-none">
              <span>JKMHS</span>
              <span>1976-2026</span>
              <span className="text-[6px] tracking-wide mt-0.5">GOLDEN</span>
            </div>

            {/* Secretary/Headmaster Signee */}
            <div className="text-center space-y-1.5 w-44">
              <div className="font-display italic text-sm text-gray-700">Nazrul Islam</div>
              <div className="border-t border-gray-200 pt-1 text-[10px] text-gray-500 font-medium">
                Headmaster & Secretary
              </div>
            </div>

          </div>

          {/* Meta-records barcode placeholder */}
          <div className="absolute bottom-3 left-6 right-6 flex items-center justify-between text-[9px] font-mono text-gray-400">
            <span>REGISTRATION: {registrationId}</span>
            <span>VERIFIED DIGITAL DOCUMENT (২০২৬)</span>
          </div>

        </div>
      </div>

      {/* Button controls */}
      <div className="flex justify-center space-x-3">
        <button
          onClick={handlePrint}
          className="bg-primary hover:bg-primary/95 text-white text-sm font-bold px-6 py-3 rounded-lg flex items-center space-x-2 shadow-md transition cursor-pointer"
        >
          <Printer className="h-4 w-4" />
          <span>প্রশংসাপত্র প্রিন্ট করুন (Print Certificate)</span>
        </button>
      </div>
    </div>
  );
};
