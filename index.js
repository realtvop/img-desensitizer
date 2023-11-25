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

document.addEventListener('paste', e => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) if (items[i].type.startsWith('image/')) return updateImg(items[i].getAsFile());
});
document.getElementById('btn-paste').addEventListener('click', async e => {
    const items = await navigator.clipboard.read();
    for (const item of items) if(item.types[0].startsWith("image/")) return updateImg(await item.getType(item.types[0]));
});

function updateImg(imgBlob) {
    createImageBitmap(imgBlob).then(img => {
        const width = canvasoi.width = canvaspi.width = img.width;
        const height = canvasoi.height = canvaspi.height = img.height;

        ctxoi.drawImage(img, 0, 0, width, height);
        modImg();
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
const isAppleDevice = navigator.platform.startsWith("Mac") || navigator.platform.startsWith("i");
document.addEventListener('keydown', e => {
    // e.preventDefault();
    if (isAppleDevice ? event.metaKey : event.ctrlKey)
        if (event.key === 'c' || event.keyCode === 67)
            copyCanvasImg(canvaspi);
        else if (event.key === 's' || event.keyCode === 83)
            downloadCanvasImg(canvaspi);
});

document.querySelectorAll(".imgMod").forEach(element =>
    element.addEventListener('change', modImg)
);

function modImg() {
    // ctxpi.drawImage(canvasoi, 0, 0);

    const imageData = ctxoi.getImageData(0, 0, canvasoi.width, canvasoi.height);
    const data = imageData.data;

    if (document.getElementById('binarization').checked) {
        const levelInterval = 256 / (256 - document.getElementById('binarizationRange').value);
        for (let i = 0; i < data.length; i += 4) {
            if (levelInterval === 256) {
                const grey = (data[i] + data[i + 1] + data[i + 2]) / 3 >= (256 - document.getElementById('binarizationYz').value) ? 255 : 0;
                data[i] = grey;
                data[i + 1] = grey;
                data[i + 2] = grey;
            } else {
                const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
                const level = Math.round(gray / levelInterval) * levelInterval;
                data[i] = level;
                data[i + 1] = level;
                data[i + 2] = level;
            }
        }
    }
    ctxpi.putImageData(imageData, 0, 0);

    if (document.getElementById('antiocr').checked) {
        factor = (canvaspi.height * canvaspi.width) / 32;

        //draw points randomly.
        n2 = factor / 4 * document.getElementById('antiocr-points').value;
        for (var i = 0; i < n2; i++) {
            x = random(0, canvaspi.width);
            y = random(0, canvaspi.height);
            ctxpi.lineWidth = document.getElementById('antiocr-pointSize').value;
            ctxpi.beginPath();
            ctxpi.moveTo(x, y);
            ctxpi.lineTo(x + 1, y + 1);
            ctxpi.closePath();
            ctxpi.stroke();
        }
        i = 0;

        //draw lines randomly.
        for (var i = 0; i < factor / 50; i++) {
            x = random(0, canvaspi.width);
            y = random(0, canvaspi.height);
            ctxpi.lineWidth = document.getElementById('antiocr-lineSize').value / 2;
            ctxpi.beginPath();
            ctxpi.moveTo(x, y);
            ctxpi.lineTo(x + random(- random(0, canvaspi.width / 2), random(0, canvaspi.width / 2)), y + random(- random(0, canvaspi.width / 2), random(0, canvaspi.width / 2))); //隨機畫線
            ctxpi.closePath();
            ctxpi.stroke();
        }

        function random(min, max) {
            return Math.round(Math.random() * (max - min)) + min;
        }
    }

}