"use client"
// Use dynamic import to load PDF.js only on client-side
let pdfjsLib: typeof import('pdfjs-dist') | null = null;

// Function to initialize PDF.js
const getPdfJs = async () => {
  if (!pdfjsLib && typeof window !== 'undefined') {
    // Use dynamic import for better code splitting
    pdfjsLib = await import('pdfjs-dist');
    
    // Set worker source
    const pdfjsWorker = "/pdf.worker.min.mjs"
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
  }
  return pdfjsLib;
};

export interface ProcessedFile {
  name: string;
  type: "image" | "pdf";
  images: string[];
}

export const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject("No canvas context");

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // Always encode as webp
        const webpData = canvas.toDataURL("image/webp", 0.7);
        resolve(webpData.split(",")[1]);
      };
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};


export const convertPdfToImage = async (file: File): Promise<string[]> => {
  if (typeof window === 'undefined') {
    throw new Error('PDF conversion can only be done in the browser');
  }

  const pdfjs = await getPdfJs();
  if (!pdfjs) {
    throw new Error('Failed to load PDF.js');
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    const images: string[] = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      
      // Get page dimensions and bounds
      const scale = 2;
      const viewport = page.getViewport({ scale });
      
      // Get the page's media box and crop box to understand the actual content area
     
      // Create canvas with extra padding to ensure nothing gets cut off
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d", { alpha: false });
      if (!context) throw new Error("Could not get 2D context from canvas");
      
      // Add padding to prevent cropping - this is the key fix
      const padding = 50; // pixels of padding
      canvas.width = Math.ceil(viewport.width) + (padding * 2);
      canvas.height = Math.ceil(viewport.height) + (padding * 2);
    
      // Fill entire canvas with white background
      context.fillStyle = '#FFFFFF';
      context.fillRect(0, 0, canvas.width, canvas.height);
      
      // Save the current context state
      context.save();
      
      // Translate to center the content with padding
      context.translate(padding, padding);
      
      // Create a new viewport that matches our translated context
      const renderViewport = page.getViewport({ scale });
      
      try {
        const renderTask = page.render({
          canvasContext: context,
          viewport: renderViewport,
          background: 'white',
          canvas
        });
        
        await renderTask.promise;
        
      } catch (renderError) {
        console.error(`Render error for page ${pageNum}:`, renderError);
        throw renderError;
      }
      
      // Restore context state
      context.restore();
      
      // Now crop the canvas to remove the padding and get just the content
      const contentCanvas = document.createElement("canvas");
      const contentContext = contentCanvas.getContext("2d");
      if (!contentContext) throw new Error("Could not get content canvas context");
      
      // Set final canvas size to original viewport dimensions
      contentCanvas.width = Math.ceil(viewport.width);
      contentCanvas.height = Math.ceil(viewport.height);
      
      // Copy the rendered content (excluding padding) to the final canvas
      contentContext.drawImage(
        canvas,
        padding, padding, // source x, y (skip padding)
        viewport.width, viewport.height, // source width, height
        0, 0, // destination x, y
        viewport.width, viewport.height // destination width, height
      );
    
      // Convert final canvas to base64
      const imageData = contentCanvas.toDataURL("image/webp", 0.8);
      const base64Data = imageData.split(",")[1];
      
      console.log(`Page ${pageNum} converted successfully`);
      images.push(base64Data);
      
      // Clean up
      canvas.remove();
      contentCanvas.remove();
    }    
    
    return images;
    
  } catch (error) {
    console.error('Error converting PDF to image:', error);
    throw new Error(`Failed to process PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Alternative method using transform matrix approach
export const convertPdfToImageTransform = async (file: File): Promise<string[]> => {
  if (typeof window === 'undefined') {
    throw new Error('PDF conversion can only be done in the browser');
  }

  const pdfjs = await getPdfJs();
  if (!pdfjs) {
    throw new Error('Failed to load PDF.js');
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    const images: string[] = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      
      const scale = 2;
      const viewport = page.getViewport({ scale });
    
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d", { alpha: false });
      if (!context) throw new Error("Could not get 2D context from canvas");
    
      // Use the exact viewport dimensions
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      
      // Fill with white background
      context.fillStyle = '#FFFFFF';
      context.fillRect(0, 0, canvas.width, canvas.height);
      
      // Apply the viewport transform to handle coordinate system properly
      context.save();
      
      // Get the transformation matrix from the viewport
      const transform = viewport.transform;
      
      // Apply the transformation matrix
      if (transform && transform.length === 6) {
        context.setTransform(
          transform[0], // a: horizontal scaling
          transform[1], // b: vertical skewing
          transform[2], // c: horizontal skewing  
          transform[3], // d: vertical scaling
          transform[4], // e: horizontal translation
          transform[5]  // f: vertical translation
        );
      }
      
      try {
        const renderTask = page.render({
          canvasContext: context,
          viewport: page.getViewport({ scale: 1 }), // Use scale 1 since we handle scaling in transform
          transform: [scale, 0, 0, scale, 0, 0], // Apply scaling through transform
          canvas
        });
        
        await renderTask.promise;
        
      } catch (renderError) {
        console.error(`Transform render error for page ${pageNum}:`, renderError);
        // Fallback to standard rendering
        context.restore();
        context.fillStyle = '#FFFFFF';
        context.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({
          canvasContext: context,
          viewport: viewport,
          canvas
        }).promise;
      }
      
      context.restore();
    
      const imageData = canvas.toDataURL("image/webp", 0.8);
      const base64Data = imageData.split(",")[1];
      
      images.push(base64Data);
      canvas.remove();
    }    
    
    return images;
    
  } catch (error) {
    console.error('Error in transform conversion:', error);
    throw new Error(`Failed to process PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const processFiles = async (
  selectedFiles: File[]
): Promise<ProcessedFile[]> => {
  if (!selectedFiles.length) {
    return [];
  }

  const processedFiles: ProcessedFile[] = [];

  for (const file of selectedFiles) {
    try {
      const fileType = file.type;

      if (fileType.startsWith('image/')) {
        const base64 = await convertFileToBase64(file);
        processedFiles.push({
          name: file.name,
          type: 'image',
          images: [base64],
        });
      } else if (fileType === 'application/pdf') {
        // Try padding method first (most reliable for cropping issues)
        let images: string[];
        try {
          images = await convertPdfToImage(file);
        } catch (error) {
          console.warn('Padding method failed, trying transform method:', error);
          images = await convertPdfToImageTransform(file);
        }
        
        processedFiles.push({
          name: file.name,
          type: 'pdf',
          images,
        });
      } else {
        console.warn(`Unsupported file type: ${fileType}`);
      }
    } catch (error) {
      console.error(`Error processing file ${file.name}:`, error);
      // Continue with other files even if one fails
      continue;
    }
  }

  return processedFiles;
};