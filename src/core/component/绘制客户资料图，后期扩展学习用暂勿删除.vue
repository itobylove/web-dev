<template>
  <div class="gerber-viewer">
    <div class="controls">
      <input type="file" @change="handleFileUpload" accept=".gbr,.gerber,.rout" />
      <div class="zoom-controls">
        <button @click="zoomIn">+</button>
        <button @click="zoomOut">-</button>
        <button @click="resetView">Reset</button>
      </div>
      <div class="info">
        <p>Zoom: {{ zoomLevel.toFixed(2) }}x</p>
        <p>Position: ({{ viewport.x.toFixed(2) }}, {{ viewport.y.toFixed(2) }})</p>
      </div>
    </div>
    <div class="canvas-container" ref="canvasContainer">
      <canvas
        ref="canvas"
        @mousedown="startDrag"
        @mousemove="handleDrag"
        @mouseup="endDrag"
        @mouseleave="endDrag"
        @wheel="handleWheel"
      ></canvas>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, nextTick } from "vue";

interface Aperture {
  code: string;
  type: "C" | "R" | "O" | "P";
  dimensions: number[];
}

interface Command {
  type: "move" | "draw" | "flash" | "aperture";
  x?: number;
  y?: number;
  aperture?: string;
}

interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

export default defineComponent({
  name: "GerberViewer",
  setup() {
    const canvas = ref<HTMLCanvasElement | null>(null);
    const canvasContainer = ref<HTMLElement | null>(null);
    const ctx = ref<CanvasRenderingContext2D | null>(null);
    const gerberCommands = ref<Command[]>([]);
    const apertures = ref<Record<string, Aperture>>({});
    const zoomLevel = ref(1);
    const viewport = ref<Viewport>({ x: 0, y: 0, zoom: 1 });
    const isDragging = ref(false);
    const lastMousePos = ref({ x: 0, y: 0 });

    // 初始化Canvas
    const initCanvas = () => {
      if (canvas.value && canvasContainer.value) {
        const container = canvasContainer.value;
        canvas.value.width = container.clientWidth;
        canvas.value.height = container.clientHeight;
        ctx.value = canvas.value.getContext("2d");
        redraw();
      }
    };

    // 处理文件上传
    const handleFileUpload = (event: Event) => {
      const input = event.target as HTMLInputElement;
      if (input.files && input.files[0]) {
        const file = input.files[0];
        const reader = new FileReader();

        reader.onload = (e) => {
          const content = e.target?.result as string;
          parseGerberFile(content);
          calculateViewport();
          redraw();
        };

        reader.readAsText(file);
      }
    };

    // 解析Gerber文件
    const parseGerberFile = (content: string) => {
      gerberCommands.value = [];
      apertures.value = {};

      const lines = content.split("\n");
      let currentAperture = "";

      for (const line of lines) {
        // 跳过空行
        if (!line.trim()) continue;
        if (line.startsWith("%")) {
          // 解析参数命令
          if (line.includes("%ADD")) {
            // 光圈定义
            const match = line.match(/%ADD(\d+)([CRO]),(.*)\*/);
            if (match) {
              const code = match[1];
              const type = match[2] as "C" | "R" | "O";
              const dimensions = match[3].split(",").map(Number);

              apertures.value[code] = {
                code,
                type,
                dimensions,
              };
            }
          }
          // 其他参数命令可以在这里处理
        } else if (line.startsWith("G54D")) {
          // 选择光圈
          const match = line.match(/G54D(\d+)\*/);
          if (match) {
            currentAperture = match[1];
          }
        } else if (line.startsWith("X") || line.startsWith("Y")) {
          // 提取X坐标部分
          const xMatch = line.match(/X([+-]?\d+)/);
          // 提取Y坐标部分
          const yMatch = line.match(/Y([+-]?\d+)/);
          // 提取状态部分
          const dMatch = line.match(/D(\d+)\*/);
          let x, y, d;
          if (xMatch) {
            x = parseCoordinate(xMatch[1]);
          }
          if (yMatch) {
            y = parseCoordinate(yMatch[1]);
          }
          if (dMatch) {
            d = dMatch[1];
          }
          // 验证必要信息
          if ((x === null && y === null) || d === null) {
            console.error(`格式错误: ${line}`);
            continue;
          }
          if (d === "02") {
            gerberCommands.value.push({ type: "move", x, y });
          } else if (d === "01") {
            gerberCommands.value.push({
              type: "draw",
              x,
              y,
              aperture: currentAperture,
            });
          } else if (d === "03") {
            gerberCommands.value.push({
              type: "flash",
              x,
              y,
              aperture: currentAperture,
            });
          }
        }
        // 忽略其他命令
      }
    };

    // 解析坐标值
    const parseCoordinate = (coord: string): number => {
      if (!coord) return 0;
      // 假设格式为X26Y26，6位小数
      const integerPart = coord.slice(0, -6) || "0";
      const decimalPart = coord.slice(-6);
      return parseFloat(`${integerPart}.${decimalPart}`);
    };

    // 计算视图范围
    const calculateViewport = () => {
      if (gerberCommands.value.length === 0) return;

      let minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity;

      for (const cmd of gerberCommands.value) {
        if (cmd.x !== undefined) {
          minX = Math.min(minX, cmd.x);
          maxX = Math.max(maxX, cmd.x);
        }
        if (cmd.y !== undefined) {
          minY = Math.min(minY, cmd.y);
          maxY = Math.max(maxY, cmd.y);
        }
      }

      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;
      const width = maxX - minX;
      const height = maxY - minY;

      // 计算适合的缩放级别
      if (canvas.value) {
        const canvasWidth = canvas.value.width;
        const canvasHeight = canvas.value.height;
        const zoomX = canvasWidth / (width * 1.2); // 留20%边距
        const zoomY = canvasHeight / (height * 1.2);
        const zoom = Math.min(zoomX, zoomY);

        viewport.value = {
          x: centerX,
          y: centerY,
          zoom: zoom || 1,
        };
        zoomLevel.value = zoom || 1;
      }
    };

    // 重绘Canvas
    const redraw = () => {
      if (!ctx.value || !canvas.value) return;
      // 清除画布
      ctx.value.clearRect(0, 0, canvas.value.width, canvas.value.height);
      // 应用视口变换
      ctx.value.save();
      ctx.value.translate(canvas.value.width / 2, canvas.value.height / 2);
      // 设置绘图样式
      ctx.value.strokeStyle = "#ff0000"; // 白色线条
      ctx.value.fillStyle = "#ff0000"; // 白色填充
      ctx.value.lineWidth = 1 / viewport.value.zoom; // 根据缩放比例调整线条宽度
      ctx.value.scale(viewport.value.zoom, viewport.value.zoom);
      ctx.value.translate(-viewport.value.x, -viewport.value.y);

      // 绘制所有命令
      let lastX = 0,
        lastY = 0;
      for (const cmd of gerberCommands.value) {
        switch (cmd.type) {
          case "move":
            if (cmd.x !== undefined) {
              lastX = cmd.x;
            }
            if (cmd.y !== undefined) {
              lastY = cmd.y;
            }
            break;
          case "draw":
            ctx.value.beginPath();
            ctx.value.moveTo(lastX, lastY);
            if (cmd.x !== undefined) {
              lastX = cmd.x;
            }
            if (cmd.y !== undefined) {
              lastY = cmd.y;
            }
            ctx.value.lineTo(lastX, lastY);
            ctx.value.stroke();
            break;

          case "flash":
            if (cmd.aperture) {
              const aperture = apertures.value[cmd.aperture];
              if (aperture) {
                if (cmd.x !== undefined) {
                  lastX = cmd.x;
                }
                if (cmd.y !== undefined) {
                  lastY = cmd.y;
                }
                drawAperture(ctx.value, aperture, lastX, lastY);
              }
            }
            break;
        }
      }

      ctx.value.restore();
    };

    // 绘制光圈
    const drawAperture = (
      ctx: CanvasRenderingContext2D,
      aperture: Aperture,
      x: number,
      y: number
    ) => {
      ctx.save();
      ctx.translate(x, y);

      switch (aperture.type) {
        case "C": // 圆形
          const diameter = aperture.dimensions[0];
          ctx.beginPath();
          ctx.arc(0, 0, diameter / 2, 0, Math.PI * 2);
          ctx.fill();
          break;

        case "R": // 矩形
          const [width, height] = aperture.dimensions;
          ctx.fillRect(-width / 2, -height / 2, width, height);
          break;

        // 其他类型的光圈可以在这里扩展
      }

      ctx.restore();
    };

    // 缩放控制
    const zoomIn = () => {
      viewport.value.zoom *= 1.2;
      zoomLevel.value = viewport.value.zoom;
      redraw();
    };

    const zoomOut = () => {
      viewport.value.zoom /= 1.2;
      zoomLevel.value = viewport.value.zoom;
      redraw();
    };

    const resetView = () => {
      calculateViewport();
      redraw();
    };

    // 拖拽视图
    const startDrag = (e: MouseEvent) => {
      isDragging.value = true;
      lastMousePos.value = { x: e.clientX, y: e.clientY };
    };

    const handleDrag = (e: MouseEvent) => {
      if (isDragging.value && canvas.value) {
        const dx = (e.clientX - lastMousePos.value.x) / viewport.value.zoom;
        const dy = (e.clientY - lastMousePos.value.y) / viewport.value.zoom;

        viewport.value.x -= dx;
        viewport.value.y -= dy;

        lastMousePos.value = { x: e.clientX, y: e.clientY };
        redraw();
      }
    };

    const endDrag = () => {
      isDragging.value = false;
    };

    // 鼠标滚轮缩放
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      if (canvas.value) {
        const mouseX = e.clientX - canvas.value.getBoundingClientRect().left;
        const mouseY = e.clientY - canvas.value.getBoundingClientRect().top;

        const worldX =
          viewport.value.x + (mouseX - canvas.value.width / 2) / viewport.value.zoom;
        const worldY =
          viewport.value.y + (mouseY - canvas.value.height / 2) / viewport.value.zoom;

        // 根据滚轮方向调整缩放
        const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
        viewport.value.zoom *= zoomFactor;
        zoomLevel.value = viewport.value.zoom;

        // 调整视口位置以保持鼠标下的点不变
        viewport.value.x =
          worldX - (mouseX - canvas.value.width / 2) / viewport.value.zoom;
        viewport.value.y =
          worldY - (mouseY - canvas.value.height / 2) / viewport.value.zoom;

        redraw();
      }
    };

    // 响应式调整Canvas大小
    const handleResize = () => {
      initCanvas();
      redraw();
    };

    onMounted(() => {
      initCanvas();
      window.addEventListener("resize", handleResize);
    });

    return {
      canvas,
      canvasContainer,
      handleFileUpload,
      zoomIn,
      zoomOut,
      resetView,
      zoomLevel,
      viewport,
      startDrag,
      handleDrag,
      endDrag,
      handleWheel,
    };
  },
});
</script>

<style scoped>
.gerber-viewer {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
}

.controls {
  padding: 10px;
  background: #f0f0f0;
  display: flex;
  gap: 10px;
  align-items: center;
}

.zoom-controls {
  display: flex;
  gap: 5px;
}

.canvas-container {
  flex: 1;
  overflow: hidden;
  position: relative;
}

canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: black; /* 黑色背景 */
}

.info {
  margin-left: auto;
  font-size: 14px;
}
</style>
