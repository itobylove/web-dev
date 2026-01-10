import { resolve, join } from 'path';
import fs from 'fs';
import fsPromises from 'fs/promises';
import archiver from 'archiver';
import viteConfig from '../../vite.config.js'; // 从 Vite 配置中读取输出目录和远程路径

// 获取当前项目根目录
const __dirname = process.cwd();

// 从 Vite 配置中获取构建输出目录和远程目录
const outDir = viteConfig.build.outDir || 'dist';
const remoteDir = viteConfig.build?.remoteDir || 'W:\\frontend-test';

// 使用当前时间戳生成版本号
const version = Date.now();
const versionContent = `{"version":"${version}"}`;

// ✅ 写入 version.js 到 dist 目录，用于标记版本号
try {
    const versionFilePath = resolve(__dirname, outDir, 'version.js');
    fs.writeFileSync(versionFilePath, versionContent);
    console.log(`✅ version.js written to: ${versionFilePath}`);
} catch (err) {
    console.error('❌ Failed to write version.js:', err);
    process.exit(1);
}

// ✅ 将 dist 目录压缩为 zip 包，压缩包放在项目根目录，避免包含自身导致无限嵌套
function zipDirectory(sourceDir, outPath) {
    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(outPath); // 输出流
        const archive = archiver('zip', { zlib: { level: 9 } }); // 创建 zip 压缩对象

        output.on('close', () => resolve()); // 压缩完成
        archive.on('error', err => reject(err)); // 错误处理

        archive.pipe(output); // 连接输出
        archive.directory(sourceDir, false); // 压缩整个 dist 目录的内容（不含 dist 根路径）
        archive.finalize(); // 启动压缩流程
    });
}

// ✅ 主执行函数
async function main() {
    const zipFileName = `dist_${version}.zip`; // 构建 zip 文件名
    const localZipPath = resolve(__dirname, zipFileName); // 本地 zip 路径（根目录）
    const remoteZipPath = join(remoteDir, zipFileName);   // 远程 zip 路径

    try {
        // 1. 压缩 dist 目录为 zip 文件
        console.log(`📦 Compressing ${outDir} to ${localZipPath}...`);
        await zipDirectory(resolve(__dirname, outDir), localZipPath);
        console.log('✅ Compression complete.');

        // 2. 确保远程目录存在
        await fsPromises.mkdir(remoteDir, { recursive: true });

        // 3. 将 zip 文件复制到远程目录
        await fsPromises.copyFile(localZipPath, remoteZipPath);
        console.log(`🚀 Copied zip to remote directory: ${remoteZipPath}`);

        // 4. 删除本地根目录下的 zip 文件（防止堆积）
        await fsPromises.unlink(localZipPath);
        console.log(`🧹 Deleted local zip file: ${localZipPath}`);

    } catch (err) {
        console.error('❌ Error during post-build process:', err);
        process.exit(1);
    }
}

// 启动主函数
main();