import { BrowserWindow } from "electron";

import * as http from 'http'
import * as url from 'url'

function uuid() {
    return "00000000-0000-4000-8000-000000000000".replace(/0/g, function () {
        return (0 | (Math.random() * 16)).toString(16);
    });
}

export default (mainWin) => {
    const httpMitmProxy = new http.Server();
    // 启动端口
    const port = 6789;
    httpMitmProxy.listen(port, () => {
        console.log(`HTTP中间人代理启动成功，端口：${port}`);
    });
    // 代理接收客户端的转发请求
    httpMitmProxy.on('request', (req, res) => {
        const id = uuid()
        console.log('代理请求.........')

        // 解析客户端请求
        const urlObject = new url.URL(req.url);
        const options = {
            protocol: urlObject.protocol,
            hostname: urlObject.hostname,
            method: req.method,
            port: urlObject.port || 80,
            path: urlObject.pathname,
            headers: req.headers
        };


        // 为了方便起见，直接去掉客户端请求所支持的压缩方式
        delete options.headers['accept-encoding'];

        const requestBody = []
        req.on("data", (chunk) => {
            requestBody.push(chunk);
        });

        mainWin?.webContents.send('main-process-messages', {
            ...options,
            id
        });


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
            realRes.on('data', (res) => {
                result.push(res)
            })
            realRes.on('end', () => {
                console.log('No more data in response.', result.toString().length);
                mainWin?.webContents.send('main-process-messages-res', {
                    id,
                    req: options,
                    reqBody: requestBody.toString(),
                    reqSize: Buffer.byteLength(Buffer.concat(requestBody)) / 1024,
                    resHeader: realRes.headers,
                    resSize: Buffer.byteLength(Buffer.concat(result)) / 1024,
                    resBody: result.toString()
                });
            });
        });
        // 通过pipe的方式把客户端请求内容转发给目标服务器
        req.pipe(realReq);
        realReq.on('error', (e) => {
            console.log('错误错误..........')
            mainWin?.webContents.send('main-process-messages-res', {
                id,
                req: options,
                reqBody: requestBody.toString(),
                reqSize: Buffer.byteLength(Buffer.concat(requestBody)) / 1024,
                resHeader: {},
                resSize: 0,
                resBody: ''
            });
            res.writeHead(404)
            res.end(e.message)

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