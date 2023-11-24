// origionalImgCanvas
const canvasoi = document.getElementById('canvas-original');
const ctxoi = canvasoi.getContext('2d');
// processedImgCanvas
const canvaspi = document.getElementById('canvas-processed');
const ctxpi = canvaspi.getContext('2d');

const fileInput = document.getElementById('fileInput');
fileInput.addEventListener('change', evt => {
    if (evt.target.files.length > 0) handleFile(evt.target.files[0]);
    else alert('No file chosen!');
});
document.body.addEventListener('dragover', function (e) {
    e.preventDefault();
    document.body.style.border = '2px solid #000';
});
document.body.addEventListener('dragleave', function () {
    document.body.style.border = 'none';
});
document.body.addEventListener('drop', function (e) {
    e.preventDefault();
    document.body.style.border = 'none';

    handleFile(e.dataTransfer.files[0]);
});
function handleFile(file) {
    if (file.type.startsWith('image/')) {
        const reader = new FileReader();

        reader.onload = function (e) {
            const arrayBuffer = e.target.result;
            const blob = new Blob([arrayBuffer], { type: file.type });

            updateImg(blob);
        };

        reader.readAsArrayBuffer(file);
    } else {
        alert('Unsupport file type!');
    }
}

function updateImg(imgBlob) {
    createImageBitmap(imgBlob).then(img => {
        const width = canvasoi.width = canvaspi.width = img.width;
        const height = canvasoi.height = canvaspi.height = img.height;

        ctxoi.drawImage(img, 0, 0, width, height);
        ctxpi.drawImage(img, 0, 0, width, height);
    });
}

document.getElementById('btn-downloadOriginal').addEventListener('click', () => downloadCanvasImg(canvasoi));
document.getElementById('btn-downloadProcessed').addEventListener('click', () => downloadCanvasImg(canvaspi));
function downloadCanvasImg(canvas) {
    const imgDataUrl = canvas.toDataURL();
    const link = document.createElement('a');
    link.href = imgDataUrl;
    
    const originalFileName = fileInput.files[0].name;
    const fileName = originalFileName.split('.').slice(0, -1).join('.');
    const fileExtension = originalFileName.split('.').pop();
    link.download = `${fileName}_modified${Date.now()}.${fileExtension}`;
    
    // document.body.appendChild(link);
    link.click();
    // document.body.removeChild(link);
}
document.getElementById('btn-copyOriginal').addEventListener('click', () => copyCanvasImg(canvasoi));
document.getElementById('btn-copyProcessed').addEventListener('click', () => copyCanvasImg(canvaspi));
function copyCanvasImg(canvas) {
    canvas.toBlob(blob => {
        const clipboardItem = new ClipboardItem({ 'image/png': blob });
        navigator.clipboard.write([clipboardItem])/* .then(() => {
            console.log('Copied successfully.');
        }) */.catch((err) => {
            alert('Copy image error:', err);
        });
    });
}