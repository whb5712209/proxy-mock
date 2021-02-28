import React, { useRef, useEffect } from 'react';
import { Table, Button } from 'antd'

import { ipcRenderer, remote } from "electron";
import './index.less'
const { BrowserWindow } = remote
function uuid() {
    return "00000000-0000-4000-8000-000000000000".replace(/0/g, function () {
        return (0 | (Math.random() * 16)).toString(16);
    });
}

const App = () => {
    const ref = useRef<any>(null)
    return <div>
        <Button onClick={() => {
            ref.current = new BrowserWindow({
                width: 400,
                height: 300,
                webPreferences: {
                    nodeIntegration: true,
                    webSecurity: false,
                    enableRemoteModule: true
                },
            })
            ref.current.loadURL('http://localhost:4000/config');
        }}>弹框</Button>
        <Option></Option>
    </div>

}

class Option extends React.Component<any, {
    simpleDataSource: any[],
    source: {

    }
}>{
    columns: any[]
    dataSource: any[]
    constructor(props: any) {
        super(props);
        this.state = {
            simpleDataSource: [],
            source: {

            }
        }
        this.dataSource = []
        this.columns = [{
            title: 'method',
            dataIndex: 'method',
            key: 'method',
        },
        {
            title: 'hostname',
            dataIndex: 'hostname',
            key: 'hostname',
        },
        {
            title: '地址',
            dataIndex: 'path',
            key: 'path',
        }]
    }
    componentDidMount() {
        ipcRenderer.on('main-process-messages', (event, request: {
            method: string,
            hostname: string,
            path: string,
            id: string
        }) => {
            console.log(request)
            this.setState(
                (state) => {
                    return {
                        simpleDataSource: [
                            ...state.simpleDataSource,
                            {
                                key: request.id,
                                id: request.id,
                                method: request.method,
                                hostname: request.hostname,
                                path: request.path,
                            }
                        ]
                    }
                }

            )
        })

        ipcRenderer.on('main-process-messages-req', (event, request) => {
            this.dataSource.push(request)
        })

        ipcRenderer.on('main-process-messages-res', (event, request) => {
            this.dataSource.push(request)
        })
    }
    
    onRow=(record:any)=>{
        return {
            onClick: ()=>{
                console.log(record.id,this.dataSource)
            }
        }
    }
    onClick = ()=>{}
    render() {
        return <div>
            <Table dataSource={this.state.simpleDataSource} columns={this.columns} pagination={false}
                className='main-table'
                onRow={this.onRow}
            />

        </div>
    }
}

export default App
