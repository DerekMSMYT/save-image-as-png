// Create the context menu item when the extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "saveAsPng",
    title: "Save Image as PNG",
    contexts: ["image"]
  });
});

// Handle the context menu click event
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "saveAsPng" && info.srcUrl) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: convertAndDownloadImage,
      args: [info.srcUrl]
    });
  }
});

// This function runs directly inside the web page to handle the canvas conversion
async function convertAndDownloadImage(srcUrl) {
  try {
    const img = new Image();
    img.crossOrigin = "anonymous"; 
    
    img.onload = function () {
      // Create a hidden canvas element
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      
      // Draw the image onto the canvas
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      
      // Convert the canvas content to a PNG Data URL
      const pngUrl = canvas.toDataURL("image/png");
      
      // Create a temporary link element to trigger the download
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      
      // Attempt to extract a filename or fall back to 'download.png'
      const originalName = srcUrl.split('/').pop().split('?')[0] || "image";
      downloadLink.download = originalName.replace(/\.[^/.]+$/, "") + ".png";
      
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    };

    img.onerror = function() {
      alert("Failed to convert image. The website's security policies (CORS) may be blocking direct access.");
    };

    img.src = srcUrl;
  } catch (error) {
    console.error("Error converting image to PNG:", error);
  }
}
