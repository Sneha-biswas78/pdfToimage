import React, { useState } from "react";
import './App.css'
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.js"; // ✅ for v3
import JSZip from "jszip";
import { saveAs } from "file-saver";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export default function App() {
  const [images, setImages] = useState([]);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileReader = new FileReader();
    fileReader.onload = async function () {
      const typedarray = new Uint8Array(this.result);

      const pdf = await pdfjsLib.getDocument(typedarray).promise;

      let imageUrls = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: context, viewport }).promise;
        imageUrls.push(canvas.toDataURL("image/png"));
      }

      setImages(imageUrls);
    };

    fileReader.readAsArrayBuffer(file);
  };

  // ✅ Download all images as ZIP
  const downloadAll = async () => {
    const zip = new JSZip();

    images.forEach((img, idx) => {
      // remove "data:image/png;base64," prefix
      const base64Data = img.split(",")[1];
      zip.file(`page_${idx + 1}.png`, base64Data, { base64: true });
    });

    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "pdf_images.zip");
  };

  return (
    <div>
      <input type="file" accept="application/pdf" onChange={handleFile} />

      {images.length > 0 && (
        <button onClick={downloadAll} style={{ margin: "20px 0", padding: "10px" }}>
          Download All Pages as ZIP
        </button>
      )}

      <div>
        {images.map((img, idx) => (
          <img key={idx} src={img} alt={`page_${idx + 1}`} style={{ maxWidth: "100%", marginBottom: "10px" }} />
        ))}
      </div>
    </div>
  );
}
