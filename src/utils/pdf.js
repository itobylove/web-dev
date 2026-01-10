import 'core-js/features/array/at';
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import "pdfjs-dist/build/pdf.worker.mjs";
export const pdfToImg = async (pdfPath,scale=1) => {
    const doc = await getDocument(pdfPath).promise;
    let canvasList = [];
    for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        console.log('strings', await page.getTextContent());
        const viewport = page.getViewport({ scale: scale});
        const canvas = document.createElement("canvas");
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        canvas.style.width = Math.floor(viewport.width) + "px";
        canvas.style.height = Math.floor(viewport.height) + "px";
        await page.render({
            canvasContext: canvas.getContext('2d'),
            viewport: viewport
        }).promise;
        canvasList.push(canvas);
    }

    const finalCanvas = document.createElement('canvas');
    const finalCtx = finalCanvas.getContext('2d');

    // 计算总高度和最大宽度
    let totalHeight = 0;
    let maxWidth = 0;
    canvasList.forEach((canvas) => {
        totalHeight += canvas.height; // 累加每个 Canvas 的高度
        if (canvas.width > maxWidth) {
            maxWidth = canvas.width; // 获取最大宽度
        }
    });
    // 设置新 Canvas 的尺寸
    finalCanvas.width = maxWidth;
    finalCanvas.height = totalHeight;

    // 依次将每个 Canvas 绘制到新 Canvas 上
    let offsetY = 0;
    canvasList.forEach((canvas) => {
        finalCtx.drawImage(canvas, 0, offsetY);
        offsetY += canvas.height + 10; // 设置间距为 10px
    });
    return finalCanvas.toDataURL();
}