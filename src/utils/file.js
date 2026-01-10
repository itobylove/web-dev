import JSZip from 'jszip';
import FileSaver from 'file-saver';
import axios from "axios";
import _ from "lodash";


/**
 * 使用正则表达式去除首尾斜杠和双斜杠
 * @param path
 * @returns {*}
 */
export const pathFormat=(path) =>{
    return  path.replace(/\/{2,}/g, '/').replace(/^\/|\/$/g, '');
}
const getFile = (url,opt) => {
    return new Promise((resolve, reject) => {
        axios({
            method:'get',
            url,
            responseType: opt?.responseType || 'arraybuffer',
            onDownloadProgress:(progressEvent)=>{
                progressEvent.progress=Math.round((progressEvent.loaded * 100) / progressEvent.total);
                const unitArray={Gb:1024*1024*1024,Mb:1024*1024,Kb:1024};
                const unit=progressEvent.total>unitArray.Gb?'Gb':(progressEvent.total>unitArray.Mb?'Mb':'Kb');
                const info=parseInt(progressEvent.loaded/unitArray[unit])+unit+'/'+parseInt(progressEvent.total/unitArray[unit])+unit+'('+progressEvent.progress+'%)';
                opt?.onDownloadProgress?.({...progressEvent,info})
            }
        }).then(data => {
            resolve(data.data)
        }).catch(error => {
            reject(error.toString())
        })
    })
}


/**
 * @typedef {Object} downloadAndCompressCallback 回调
 * @property {function} download - 下载完成回调
 * @property {function} downloadAll - 所有下载完成回调
 * @property {function} finish - 打包完成回调
 */

/**
 * @typedef {Array} downloadAndCompressList 数据
 @property {string} url - 远程URL
 @property {string} name - 文件名
 @property {string} dir - 在压缩包中的文件层级
 */

/**
 * @typedef {Object} downloadOpts 下载选项
 *  @property {number|boolean} saveTree - bool:是否保留目录结构 / number :保留目录结构的最后N层
 */

/**
 * 打包压缩下载
 * @param {downloadAndCompressList} list  源文件数组 [{url:"URL","dir":"文件夹路径","name":"文件名"}]
 * @param zipName  压缩文件的名称
 * @param {downloadAndCompressCallback} callback 回调
 * @param {downloadOpts} opts
 * @return promiseList []
 */
export const downloadAndCompress = (list, zipName,callback,opts={}) => {
    zipName=zipName || new Date().toLocaleDateString().replaceAll("/",'_');
    zipName.endsWith('.zip') || (zipName+='.zip');
    const _opts= _.merge({saveTree:true},opts);
    const zip = new JSZip();
    const promiseList = [];  //用于存储多个promise
    let i=0;
    for (let item of list) {
        if(typeof item.url!=='string' || item.url.length<1){
            continue;
        }
        const promise = getFile(item.url).then((res) => {
            i++;
            if(typeof item.name!=='string' || item.name.length<1){
                item.name=i;
            }
            item.dir=(_opts.saveTree && item.dir)?(typeof _opts.saveTree==='number'? (item.dir.split('/').filter(item=>item!=='').slice(-_opts.saveTree).join('/')+'/'):item.dir): '';
            typeof callback.download==='function' && (item=callback.download(item,i,list.length) || item);
            zip.folder(item.dir).file(item.name, res ,{binary: true});
        })
        promiseList.push(promise)
    }
    Promise.all(promiseList).then(() => {
        typeof callback.downloadAll==='function' && callback.downloadAll({zipName});
        zip.generateAsync({
            type: "blob",
            compression: "DEFLATE",  // STORE：默认不压缩 DEFLATE：需要压缩
            compressionOptions: {
                level: 9               // 压缩等级1~9    1压缩速度最快，9最优压缩方式
            }
        }).then((res) => {
            FileSaver.saveAs(res,zipName)// 利用file-saver保存文件
            typeof callback.finish==='function' && callback.finish({zipName});
        })
    })
    return promiseList;
}

/**
 * 下载文件（axios方式）
 * @param url URL
 * @param fileName 文件名
 * @param opt 配置
 * @returns {Promise<void>}
 */
export const download=async (url, fileName,opt={responseType:'blob'})=>{
    const blob=await getFile(url,opt);
    saveAs(blob, fileName);
}

/**
 * 载文件（浏览器下载）
 * @param url URL
 * @param fileName 文件名
 */
export const download2=(url,fileName='')=>{
    //模拟A链接下载
    // 创建一个临时的 <a> 元素
    const a = document.createElement('a');
    // 设置下载链接（可以是文件的 URL 或 Base64 数据）
    a.href = url;
    // 设置下载文件的名称
    a.download = fileName;
    // 将 <a> 元素添加到 DOM 中，触发点击事件，然后移除 <a>
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}