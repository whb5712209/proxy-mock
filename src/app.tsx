import React from 'react';
import ReactDom from 'react-dom';
import Router from './router/index'
const mainElement = document.createElement('div');
document.body.appendChild(mainElement);
ReactDom.render(<Router />, mainElement);

