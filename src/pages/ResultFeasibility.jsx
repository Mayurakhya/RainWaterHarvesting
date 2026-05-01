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
  FaDownload,
  FaExternalLinkAlt,
  FaInfoCircle,
  FaShoppingCart,
  FaStore,
} from "react-icons/fa";
import { toPng } from "html-to-image";
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

  const costEstimate = result.cost_estimate;
  const lineItems = costEstimate?.line_items || [];
  const products = result.products?.length ? result.products : costEstimate?.products || [];
  const featuredProducts = lineItems
    .map((item) => item.selected_product && { ...item.selected_product, quantity: item.quantity, unit: item.unit })
    .filter(Boolean);
  const hasLivePricing = costEstimate?.source === "serpapi_google_shopping" && Number(costEstimate.total) > 0;

  const handleDownloadPDF = async () => {
    const element = printRef.current;
    if (!element) return;

    try {
      const dataUrl = await toPng(element, { cacheBust: true, pixelRatio: 2 });
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (element.offsetHeight * pdfWidth) / element.offsetWidth;

      pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("RTRWH_Assessment_Report.pdf");
    } catch (error) {
      console.error("PDF Generation Error:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  const formatNumber = (num) => new Intl.NumberFormat("en-IN").format(Number(num || 0));
  const formatCurrency = (num) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: costEstimate?.currency || "INR",
      maximumFractionDigits: 0,
    }).format(Number(num || 0));
  const formatCategory = (category = "") =>
    category
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  return (
    <div className="report-shell min-h-screen w-full pb-12">
      <div className="nav-shell no-print">
        <Link to="/home" className="btn-ghost px-5 py-2">
          <FaArrowLeft /> Back to Home
        </Link>
        <h1 className="brand-title">Assessment Report</h1>

        <button
          onClick={handleDownloadPDF}
          className="btn-primary px-5 py-2"
        >
          <FaDownload /> Download PDF
        </button>
      </div>

      <div ref={printRef} className="max-w-5xl mx-auto px-4 pb-10 pt-32">
        <div
          className={`rounded-2xl p-8 text-white shadow-lg mb-8 flex items-center gap-6 ${
            result.feasible ? "bg-gradient-to-r from-green-600 to-teal-600" : "bg-gradient-to-r from-red-500 to-orange-500"
          }`}
        >
          <div className="bg-white/20 p-4 rounded-full">
            {result.feasible ? <FaCheckCircle size={40} /> : <FaTimesCircle size={40} />}
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-1">
              {result.feasible ? "Project is Feasible!" : "Not Feasible"}
            </h2>
            <p className="text-white/90 text-lg">{result.feasibility_reasons?.[0]}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="report-card stagger-in">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                <FaTint size={20} />
              </div>
              <h3 className="font-semibold text-gray-500 text-sm uppercase">Annual Potential</h3>
            </div>
            <p className="text-3xl font-bold text-gray-800">
              {formatNumber(result.harvestable_volume_m3)} <span className="text-lg text-gray-500">m3</span>
            </p>
            <p className="text-sm text-green-600 mt-2 font-medium">
              approx. {formatNumber(result.harvestable_volume_m3 * 1000)} Liters
            </p>
          </div>

          <div className="report-card stagger-in">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
                <FaLayerGroup size={20} />
              </div>
              <h3 className="font-semibold text-gray-500 text-sm uppercase">Recommended Tank</h3>
            </div>
            <p className="text-3xl font-bold text-gray-800">
              {formatNumber(result.recommended_tank_volume_m3)} <span className="text-lg text-gray-500">m3</span>
            </p>
            <p className="text-sm text-gray-400 mt-2">Optimal size for your usage</p>
          </div>

          <div className="report-card stagger-in">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
                <FaRupeeSign size={20} />
              </div>
              <h3 className="font-semibold text-gray-500 text-sm uppercase">Est. Construction Cost</h3>
            </div>
            <p className="text-3xl font-bold text-gray-800">
              {result.estimated_cost ? formatCurrency(result.estimated_cost) : "Unavailable"}
            </p>
            <p className="text-sm text-gray-400 mt-2">
              {hasLivePricing ? "Based on live product prices" : "Live pricing not configured"}
            </p>
          </div>
        </div>

        {(costEstimate || products.length > 0) && (
          <div className="report-card p-8 mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <FaShoppingCart className="text-orange-600 text-xl" />
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Live Price Estimate</h3>
                  <p className="text-sm text-gray-500">
                    Product requirements and market offers for this rainwater harvesting setup
                  </p>
                </div>
              </div>
              <div className="text-left md:text-right">
                <p className="text-sm font-semibold text-gray-500 uppercase">Estimated Total</p>
                <p className="text-3xl font-bold text-gray-900">
                  {costEstimate?.total ? formatCurrency(costEstimate.total) : "Unavailable"}
                </p>
              </div>
            </div>

            {costEstimate?.notes?.length > 0 && (
              <div className="mb-6 rounded-xl bg-amber-50 border border-amber-200 p-4 text-amber-800">
                <div className="flex items-start gap-3">
                  <FaInfoCircle className="mt-1 flex-shrink-0" />
                  <div className="space-y-1">
                    {costEstimate.notes.map((note, index) => (
                      <p key={index} className="text-sm font-medium">
                        {note}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {lineItems.length > 0 && (
              <div className="overflow-x-auto mb-8">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-xs uppercase text-gray-500 border-b border-gray-100">
                      <th className="py-3 pr-4">Component</th>
                      <th className="py-3 pr-4">Quantity</th>
                      <th className="py-3 pr-4">Unit Price</th>
                      <th className="py-3 pr-4 text-right">Line Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map((item, index) => (
                      <tr key={`${item.category}-${index}`} className="border-b border-gray-50">
                        <td className="py-4 pr-4">
                          <p className="font-bold text-gray-800">{formatCategory(item.category)}</p>
                          <p className="text-sm text-gray-500">{item.query}</p>
                        </td>
                        <td className="py-4 pr-4 text-gray-700">
                          {formatNumber(item.quantity)} {item.unit}
                        </td>
                        <td className="py-4 pr-4 text-gray-700">
                          {item.unit_price ? formatCurrency(item.unit_price) : "Not available"}
                        </td>
                        <td className="py-4 pr-4 text-right font-bold text-gray-900">
                          {item.total_price ? formatCurrency(item.total_price) : "Not available"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {featuredProducts.length > 0 && (
              <div>
                <h4 className="text-lg font-bold text-gray-800 mb-4">Selected Products</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {featuredProducts.map((product, index) => (
                    <a
                      key={`${product.title}-${index}`}
                      href={product.link || "#"}
                      target="_blank"
                      rel="noreferrer"
                      className={`group border border-gray-100 rounded-2xl p-4 flex gap-4 hover:border-blue-200 hover:shadow-md transition-all ${
                        !product.link ? "pointer-events-none" : ""
                      }`}
                    >
                      <div className="w-24 h-24 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {product.thumbnail ? (
                          <img src={product.thumbnail} alt={product.title} className="w-full h-full object-cover" />
                        ) : (
                          <FaStore className="text-gray-400 text-2xl" />
                        )}
                      </div>
                      <div className="min-w-0 flex-grow">
                        <div className="flex items-start justify-between gap-3">
                          <p className="font-bold text-gray-800 line-clamp-2">{product.title}</p>
                          {product.link && (
                            <FaExternalLinkAlt className="text-gray-300 group-hover:text-blue-500 flex-shrink-0 mt-1" />
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {formatCategory(product.category)} - {product.source || "Online seller"}
                        </p>
                        <p className="text-lg font-bold text-orange-600 mt-2">
                          {product.price || (product.extracted_price ? formatCurrency(product.extracted_price) : "Price unavailable")}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Quantity: {formatNumber(product.quantity)} {product.unit}
                          {product.rating ? ` - ${product.rating} rating` : ""}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="report-card p-8">
          <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
            <FaClipboardList className="text-blue-600 text-xl" />
            <h3 className="text-xl font-bold text-gray-800">Technical Guidelines & Next Steps</h3>
          </div>

          <div className="space-y-4">
            {(result.guidelines || []).map((guide, index) => (
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
