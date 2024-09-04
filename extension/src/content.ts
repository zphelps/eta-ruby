// src/content.ts
function addCustomButton() {
    // Find the "Share" button on Google Slides
    const shareButton = document.querySelector("div[aria-label='Share']");

    if (!shareButton) {
        console.warn('Share button not found');
        return;
    }

    // Create a new button element
    const customButton = document.createElement('button');
    customButton.textContent = 'Export to PDF';
    customButton.style.marginLeft = '8px';
    customButton.style.padding = '8px';
    customButton.style.backgroundColor = '#4285F4';
    customButton.style.color = '#FFF';
    customButton.style.border = 'none';
    customButton.style.borderRadius = '4px';
    customButton.style.cursor = 'pointer';

    // Add click event listener to the custom button
    customButton.addEventListener('click', () => {
        exportSlidesToPdf();
    });

    // Insert the custom button next to the "Share" button
    shareButton.parentNode?.insertBefore(customButton, shareButton.nextSibling);
}

function exportSlidesToPdf() {
    const presentationId = window.location.pathname.split('/')[3];
    const downloadUrl = `https://docs.google.com/presentation/d/${presentationId}/export/pdf`;

    chrome.runtime.sendMessage({ action: 'downloadPdf', url: downloadUrl });
}

// Run the function to add the button when the script loads
addCustomButton();
