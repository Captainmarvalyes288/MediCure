import React, { useState } from "react";
import { Link } from "react-router-dom";

const medicineDatabase = {
  "Paracetamol": {
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQNEAQA8ws9_de41fCd3iTOa82dOMIDMxO1Bg&s",
    description: "Used to treat pain and fever.",
    dosage: "500mg every 4-6 hours",
    price: "$5.99"
  },
  "Ibuprofen": {
    image: "https://static.toiimg.com/thumb/imgsize-23456,msid-118540229,width-600,resizemode-4/118540229.jpg",
    description: "Nonsteroidal anti-inflammatory drug (NSAID).",
    dosage: "200-400mg every 4-6 hours",
    price: "$7.49"
  },
  "Amoxicillin": {
    image: "https://5.imimg.com/data5/SELLER/Default/2024/3/395584575/PN/AA/YO/204659722/product-jpeg-3.jpg",
    description: "Antibiotic used to treat bacterial infections.",
    dosage: "250-500mg every 8 hours",
    price: "$12.99"
  }
};

function PrescriptionUploader() {
  const [medicines, setMedicines] = useState([]);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [fileName, setFileName] = useState("");

  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files[0];
    if (!uploadedFile) return;
    
    setIsProcessing(true);
    setError("");
    setUploadSuccess(false);
    setFileName(uploadedFile.name);
    
    setTimeout(() => {
      setIsProcessing(false);
      setUploadSuccess(true);
      // Set static medicines data
      setMedicines(["Paracetamol", "Amoxicillin", "Ibuprofen"]); // Example medicines
    }, 1500); // Simulate processing delay
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Prescription Upload</h2>
            <Link 
              to="/" 
              className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Home
            </Link>
          </div>

          <div className="mb-8">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              <div className="flex flex-col items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <h3 className="text-lg font-medium text-gray-700 mb-1">Upload Prescription</h3>
                <p className="text-sm text-gray-500 mb-4">Supports JPG, PNG, or PDF files</p>
                <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
                  Select File
                  <input 
                    type="file" 
                    accept=".pdf,.jpg,.jpeg,.png" 
                    onChange={handleFileUpload} 
                    className="hidden"
                  />
                </label>
              </div>
              {fileName && (
                <p className="mt-3 text-sm text-gray-600">
                  Selected: <span className="font-medium">{fileName}</span>
                </p>
              )}
            </div>
          </div>

          {isProcessing && (
            <div className="text-center py-8">
              <div className="inline-flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-lg font-medium text-gray-700">Processing your prescription...</span>
              </div>
              <p className="mt-2 text-gray-500">This may take a few moments</p>
            </div>
          )}

          {uploadSuccess && (
            <div className="mb-6">
              <div className="flex items-center bg-green-50 text-green-800 p-4 rounded-lg border border-green-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <h4 className="font-medium">Prescription uploaded successfully!</h4>
                  <p className="text-sm mt-1">We've identified the following medications</p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 flex items-center bg-red-50 text-red-800 p-4 rounded-lg border border-red-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {(uploadSuccess || medicines.length > 0) && (
            <div className="mt-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Recommended Medications</h3>
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {medicines.length} items
                </span>
              </div>

              <div className="space-y-4">
                {medicines.map((med, index) => (
                  <div key={index} className="flex flex-col sm:flex-row border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    <div className="sm:w-1/4 bg-gray-100 flex items-center justify-center p-4">
                      <img 
                        src={medicineDatabase[med].image} 
                        alt={med} 
                        className="h-32 object-contain" 
                      />
                    </div>
                    <div className="sm:w-3/4 p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-xl font-bold text-gray-900">{med}</h4>
                          <p className="text-gray-600 mt-1">{medicineDatabase[med].description}</p>
                          <div className="mt-3 flex items-center text-sm text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Recommended dosage: {medicineDatabase[med].dosage}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-blue-600">{medicineDatabase[med].price}</span>
                        </div>
                      </div>
                      <div className="mt-4 flex space-x-3">
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                          Add to Cart
                        </button>
                        <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
                <button className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow-md">
                  Proceed to Checkout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PrescriptionUploader;