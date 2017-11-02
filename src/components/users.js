import React, { Component } from 'react';
import {db, auth} from '../firebase';
import './css/ChatDisplay.css';

function getMyDisplayName(userId) {
    return new Promise((resolve, reject) => {
        db.ref(`users/LwnimAsjHsR9uOvfIaj0FqcTsrE2/publicFields/displayName`).then(value => {
            let pfJSON = JSON.stringify(value);
            let username= JSON.parse(pfJSON);
            resolve(username);
        }).catch(error => reject(error));
    });
}


export {getMyDisplayName};