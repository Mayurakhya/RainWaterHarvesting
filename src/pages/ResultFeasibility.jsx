import React, { useRef } from "react";
import { useLocation, Link } from "react-router-dom";
import { 
  FaCheckCircle, 
  FaTimesCircle, 
  FaTint, 
  FaLayerGroup, 
  FaRupeeSign, 
  FaClipboardList, 
  FaArrowLeft,
  FaDownload
} from "react-icons/fa";
// 1. Change Import
import { toPng } from 'html-to-image'; 
import jsPDF from "jspdf";

function FeasibilityResult() {
  const location = useLocation();
  const printRef = useRef();

  const responseData = location.state?.data;
  const result = responseData?.result;

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700">No Result Found</h2>
          <Link to="/feasibility" className="text-blue-600 hover:underline mt-4 block">
            Go back to Assessment
          </Link>
        </div>
      </div>
    );
  }

  // --- UPDATED: PDF DOWNLOAD LOGIC ---
  const handleDownloadPDF = async () => {
    const element = printRef.current;
    if (!element) return;

    try {
      // 1. Generate Image using html-to-image (Supports oklch/modern CSS)
      const dataUrl = await toPng(element, { cacheBust: true, pixelRatio: 2 });

      // 2. Initialize PDF
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (element.offsetHeight * pdfWidth) / element.offsetWidth;

      // 3. Add image to PDF
      pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("RTRWH_Assessment_Report.pdf");

    } catch (error) {
      console.error("PDF Generation Error:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  const formatNumber = (num) => new Intl.NumberFormat('en-IN').format(num);

  return (
    <div className="min-h-screen w-full bg-gray-50 font-sans pb-12">
      
      {/* Header (Not included in PDF) */}
      <div className="bg-white shadow-sm py-6 px-8 flex justify-between items-center no-print">
        <Link to="/home" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
          <FaArrowLeft /> Back to Home
        </Link>
        <h1 className="text-xl font-bold text-gray-800">Assessment Report</h1>
        
        <button 
          onClick={handleDownloadPDF}
          className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors"
        >
          <FaDownload /> Download PDF
        </button>
      </div>

      {/* Content to Print */}
      <div ref={printRef} className="max-w-5xl mx-auto mt-10 px-4 bg-gray-50 pb-10">
        
        {/* Status Banner */}
        <div className={`rounded-2xl p-8 text-white shadow-lg mb-8 flex items-center gap-6
          ${result.feasible ? "bg-gradient-to-r from-green-600 to-teal-600" : "bg-gradient-to-r from-red-500 to-orange-500"}`}
        >
          <div className="bg-white/20 p-4 rounded-full">
            {result.feasible ? <FaCheckCircle size={40} /> : <FaTimesCircle size={40} />}
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-1">
              {result.feasible ? "Project is Feasible!" : "Not Feasible"}
            </h2>
            <p className="text-white/90 text-lg">
              {result.feasibility_reasons[0]}
            </p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                <FaTint size={20} />
              </div>
              <h3 className="font-semibold text-gray-500 text-sm uppercase">Annual Potential</h3>
            </div>
            <p className="text-3xl font-bold text-gray-800">
              {formatNumber(result.harvestable_volume_m3)} <span className="text-lg text-gray-500">m³</span>
            </p>
            <p className="text-sm text-green-600 mt-2 font-medium">
              ≈ {formatNumber(result.harvestable_volume_m3 * 1000)} Liters
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
                <FaLayerGroup size={20} />
              </div>
              <h3 className="font-semibold text-gray-500 text-sm uppercase">Recommended Tank</h3>
            </div>
            <p className="text-3xl font-bold text-gray-800">
              {formatNumber(result.recommended_tank_volume_m3)} <span className="text-lg text-gray-500">m³</span>
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Optimal size for your usage
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
                <FaRupeeSign size={20} />
              </div>
              <h3 className="font-semibold text-gray-500 text-sm uppercase">Est. Construction Cost</h3>
            </div>
            <p className="text-3xl font-bold text-gray-800">
              ₹ {formatNumber(result.estimated_cost)}
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Indicative market rates
            </p>
          </div>
        </div>

        {/* Guidelines */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
            <FaClipboardList className="text-blue-600 text-xl" />
            <h3 className="text-xl font-bold text-gray-800">Technical Guidelines & Next Steps</h3>
          </div>

          <div className="space-y-4">
            {result.guidelines.map((guide, index) => (
              <div key={index} className="flex gap-4 items-start p-3 hover:bg-blue-50/50 rounded-lg transition-colors">
                <div className="bg-blue-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  {index + 1}
                </div>
                <p className="text-gray-700 leading-relaxed">{guide}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default FeasibilityResult;