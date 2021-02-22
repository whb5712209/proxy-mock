import { BrowserWindow } from "electron";

import * as http from 'http'
import * as url from 'url'
import through from 'through2'

export default (mainWin) => {
    const httpMitmProxy = new http.Server();
    // 启动端口
    const port = 6789;
    httpMitmProxy.listen(port, () => {
        console.log(`HTTP中间人代理启动成功，端口：${port}`);
    });
    // 代理接收客户端的转发请求
    httpMitmProxy.on('request', (req, res) => {
        // 解析客户端请求
        const urlObject = url.parse(req.url);
        const options = {
            protocol: 'http:',
            hostname: req.headers.host.split(':')[0],
            method: req.method,
            port: req.headers.host.split(':')[1] || 80,
            path: urlObject.path,
            headers: req.headers
        };
        // 为了方便起见，直接去掉客户端请求所支持的压缩方式
        delete options.headers['accept-encoding'];
        mainWin?.webContents.send('main-process-messages', options);
        // 根据客户端请求，向真正的目标服务器发起请求。
        const realReq = http.request(options, (realRes) => {
            const result = []
            // 设置客户端响应的http头部
            Object.keys(realRes.headers).forEach(function (key) {
                res.setHeader(key, realRes.headers[key]);
            });
            // 设置客户端响应状态码
            res.writeHead(realRes.statusCode);
            realRes.pipe(res);
            realRes.on('data',(res)=>{
                result.push(res)
            })
            realRes.on('end', () => {
                console.log('No more data in response.');
                mainWin?.webContents.send('main-process-messages-res', {
                    resHeader:realRes.headers,
                    res:result.toString()
                });
            });
        });
        // 通过pipe的方式把客户端请求内容转发给目标服务器
        req.pipe(realReq);
        // req.end()
        // mainWin?.webContents.send('main-process-messages-req', req);
        // mainWin?.webContents.send('main-process-messages-res', res);
        realReq.on('error', (e) => {
            console.log('********************请求错误start********************')
            console.error(e);
            console.log('********************请求错误end********************')
        })
    })
    
    httpMitmProxy.on('error', (e: Error & { code: string }) => {
        if (e.code == 'EADDRINUSE') {
            console.error('HTTP中间人代理启动失败！！');
            console.error(`端口：${port}，已被占用。`);
        } else {
            console.error(e);
        }
    });

    return httpMitmProxy
}