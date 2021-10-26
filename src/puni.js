var Promise = require('promise');
var Buffer = require('buffer');

var TYPE_MAP = {
    eth: '1',
    tron: '2',
    btc: '3',
    eos: '4',
    iost: '5',
    heco: '6',
    iost: '7',
    dot: '8',
    binance: '9',
};

var BLOCKCHAIN_ID_MAP = {
    '1': 'eth',
    '2': 'tron',
    '3': 'btc',
    '4': 'eos',
    '5': 'iost',
    '6': 'heco',
    '7': 'iost',
    '8': 'dot',
    '9': 'binance',
}

var _getTypeByStr = function (typeStr) {
    var reTrim = /^\s+|\s+$/g;
    typeStr += '';
    typeStr = typeStr.replace(reTrim, '').toLowerCase();
    return TYPE_MAP[typeStr] || typeStr;
}

var _getCallbackName = function () {
    var ramdom = parseInt(Math.random() * 100000);
    return 'callback_' + new Date().getTime() + ramdom;
}


var _sendPuniRequest = function (methodName, params, callback) {

    var param = {
        "params": params,
        "callback": callback
    }
    var myJSON = JSON.stringify(param);
    console.log(myJSON)
    window[methodName].postMessage(myJSON)
}

var puni = {
    version: '1.0.0',

    invokeQRScanner: function () {
        return new Promise(function (resolve, reject) {
            var CallbackFun = _getCallbackName();

            window[CallbackFun] = function (result) {
                result = result.replace(/\r/ig, "").replace(/\n/ig, "");
                try {
                    var res = JSON.parse(result);
                    var data = res.qrResult || '';
                    resolve(data);
                } catch (e) {
                    reject(e);
                }
            }

            _sendPuniRequest('invokeQRScanner', '', CallbackFun);

        });
    },
    shareNewsToSNS: function (params) {
        var title = params.title || 'TokenPocket 你的通用数字钱包';
        var description = params.desc || '';
        var url = params.url || 'https://www.mytokenpocket.vip/';
        var previewImage = params.previewImage || '';


        var data = {
            title: title,
            description: description,
            url: url,
            previewImage: previewImage
        };

        _sendPuniRequest('shareNewsToSNS', JSON.stringify(data), '');

    },
    getAppInfo: function () {
        return new Promise(function (resolve, reject) {
            var CallbackFun = _getCallbackName();

            window[CallbackFun] = function (result) {
                resolve(result);
            }
            _sendPuniRequest('getAppInfo', '', CallbackFun);

        });
    },
    getDeviceId: function () {
        return new Promise(function (resolve, reject) {
            var CallbackFun = _getCallbackName();

            window[CallbackFun] = function (result) {
                result = result.replace(/\r/ig, "").replace(/\n/ig, "");
                try {
                    var res = JSON.parse(result);
                    if (res.device_id) {
                        res.data = res.device_id;
                    }
                    resolve(res);
                } catch (e) {
                    reject(e);
                }
            }

            _sendPuniRequest('getDeviceId', '', CallbackFun);

        });

    },
    // Deprecated
    getWalletList: function (type) {
        type = _getTypeByStr(type);

        if (!type) {
            throw new Error('type invalid');
        }

        var params = {
            type: type
        };

        return new Promise(function (resolve, reject) {
            var CallbackFun = _getCallbackName();

            window[CallbackFun] = function (result) {
                result = result.replace(/\r/ig, "").replace(/\n/ig, "");
                try {

                    var res = JSON.parse(result);
                    resolve(res);
                } catch (e) {
                    reject(e);
                }
            }
            _sendPuniRequest('getWalletList', JSON.stringify(params), CallbackFun);

        });
    },
    getWallets: function () {
        return new Promise(function (resolve, reject) {
            var CallbackFun = _getCallbackName();

            window[CallbackFun] = function (result) {
                result = result.replace(/\r/ig, "").replace(/\n/ig, "");
                try {
                    var res = JSON.parse(result);

                    if (res.data && res.data.length) {
                        for (var i = 0; i < res.data.length; i++) {
                            res.data[i].blockchain = BLOCKCHAIN_ID_MAP[res.data[i].blockchain_id + ''] || res.data[i].blockchain_id;
                        }
                    }

                    resolve(res);
                } catch (e) {
                    reject(e);
                }
            }

            _sendPuniRequest('getWallets', '', CallbackFun);

        });
    },
    getCurrentWallet: function () {
        return new Promise(function (resolve, reject) {
            var CallbackFun = _getCallbackName();
            // callback
            window[CallbackFun] = function (result) {
                result = result.replace(/\r/ig, "").replace(/\n/ig, "");
                try {
                    var res = JSON.parse(result);
                    if (res.rawTransaction) {
                        res.data = res.rawTransaction;
                    }

                    if (res.data && res.data.blockchain_id) {
                        res.data.blockchain = BLOCKCHAIN_ID_MAP[res.data.blockchain_id + ''] || res.data.blockchain_id;
                    }

                    resolve(res);
                } catch (e) {
                    reject(e);
                }
            }
            _sendPuniRequest('getCurrentWallet', '', CallbackFun);
        });
    },
    sign: function (params) {

        return new Promise(function (resolve, reject) {
            var CallbackFun = _getCallbackName();

            window[CallbackFun] = function (result) {
                resolve(result);
            }

            _sendPuniRequest('sign', JSON.stringify(params), CallbackFun);
        });
    },
    back: function () {
        _sendPuniRequest('back', '', '');
    },
    fullScreen: function (params) {
        _sendPuniRequest('fullScreen', JSON.stringify(params), '');
    },
    setMenubar: function (params) {
        _sendPuniRequest('setMenubar', JSON.stringify(params), '');
    },
    close: function () {
        _sendPuniRequest('close', '', '');
    },
    importWallet: function (type) {
        type = _getTypeByStr(type);

        if (!type) {
            throw new Error('type invalid');
        }

        var params = {
            blockChainId: type
        };

        _sendPuniRequest('importWallet', JSON.stringify(params), '');
    },
    startChat: function (params) {
        if (params.blockchain) {
            params.blockChainId = _getTypeByStr(params.blockchain);
            delete params.blockchain;
        }
        _sendPuniRequest('startChat', JSON.stringify(params), '');
    },
    getNodeUrl: function (params) {

        if (params.blockchain) {
            params.blockChainId = _getTypeByStr(params.blockchain);
            delete params.blockchain;
        }

        return new Promise(function (resolve, reject) {
            var CallbackFun = _getCallbackName();

            window[CallbackFun] = function (result) {
                result = result.replace(/\r/ig, "").replace(/\n/ig, "");
                try {

                    var res = JSON.parse(result);

                    if (res.data && res.data.blockChainId) {
                        res.blockchain = BLOCKCHAIN_ID_MAP[res.data.blockChainId + ''] || res.data.blockChainId;
                    }

                    resolve(res);
                } catch (e) {
                    reject(e);
                }
            }
            _sendPuniRequest('getNodeUrl', JSON.stringify(params), CallbackFun);

        });



    },
    saveImage: function (params) {
        _sendPuniRequest('saveImage', JSON.stringify(params), '');
    },
    rollHorizontal: function (params) {
        _sendPuniRequest('rollHorizontal', JSON.stringify(params), '');
    },
    popGestureRecognizerEnable: function (params) {
        _sendPuniRequest('popGestureRecognizerEnable', JSON.stringify(params), '');
    },
    forwardNavigationGesturesEnable: function (params) {
        _sendPuniRequest('forwardNavigationGesturesEnable', JSON.stringify(params), '');
    },
    // eos
    eosTokenTransfer: function (params) {
        // 必填项
        if (!params.from || !params.to || !params.amount || !params.contract || !params.precision) {
            throw new Error('missing params; "from", "to", "amount", "contract", "precision" is required ');
        }

        params.amount = '' + params.amount;

        return new Promise(function (resolve, reject) {
            var CallbackFun = _getCallbackName();

            window[CallbackFun] = function (result) {
                resolve(result);
            }

            _sendPuniRequest('eosTokenTransfer', JSON.stringify(params), CallbackFun);
        })
    },
    pushEosAction: function (params) {
        return new Promise(function (resolve, reject) {
            var CallbackFun = _getCallbackName();

            window[CallbackFun] = function (result) {
                result = result.replace(/\r/ig, "").replace(/\n/ig, "");
                try {
                    var res = JSON.parse(result);
                    if (res.result && !res.data.transactionId) {
                        res.data = {
                            transactionId: res.data
                        };
                    }
                    resolve(res);
                } catch (e) {
                    reject(e);
                }
            }

            _sendPuniRequest('pushEosAction', JSON.stringify(params), CallbackFun);

        });
    },
    getEosBalance: function (params) {

        if (!params.account || !params.contract || !params.symbol) {
            throw new Error('missing params; "account", "contract", "symbol" is required ');
        }

        return new Promise(function (resolve, reject) {
            var CallbackFun = _getCallbackName();

            window[CallbackFun] = function (result) {
                resolve(result);
            }

            _sendPuniRequest('getEosBalance', JSON.stringify(params), CallbackFun);

        });
    },
    getTableRows: function (params) {
        return new Promise(function (resolve, reject) {
            var CallbackFun = _getCallbackName();

            window[CallbackFun] = function (result) {
                resolve(result);
            }

            _sendPuniRequest('getTableRows', JSON.stringify(params), CallbackFun);
        });
    },
    getEosTableRows: function (params) {
        return new Promise(function (resolve, reject) {
            var CallbackFun = _getCallbackName();

            window[CallbackFun] = function (result) {
                resolve(result);
            }

            _sendPuniRequest('getEosTableRows', JSON.stringify(params), CallbackFun);
        });
    },
    getEosAccountInfo: function (params) {
        if (!params.account) {
            throw new Error('missing params; "account" is required ');
        }

        return new Promise(function (resolve, reject) {
            var CallbackFun = _getCallbackName();

            window[CallbackFun] = function (result) {
                resolve(result);
            }

            _sendPuniRequest('getEosAccountInfo', JSON.stringify(params), CallbackFun);

        });
    },
    getEosTransactionRecord: function (params) {
        // 必填项
        if (!params.account) {
            throw new Error('missing params; "account" is required ');
        }

        params.count = params.count ? +params.count : 10;
        params.start = params.start ? +params.start : 0;

        return new Promise(function (resolve, reject) {
            var CallbackFun = _getCallbackName();

            window[CallbackFun] = function (result) {
                resolve(result);
            }

            _sendPuniRequest('getEosTransactionRecord', JSON.stringify(params), CallbackFun);

        })
    },
    eosAuthSign: function (params) {
        return new Promise(function (resolve, reject) {
            var CallbackFun = _getCallbackName();

            window[CallbackFun] = function (result) {
                resolve(result);
            }

            _sendPuniRequest('eosAuthSign', JSON.stringify(params), CallbackFun);
        });
    },

    // enu
    enuTokenTransfer: function (params) {
        // 必填项
        if (!params.from || !params.to || !params.amount || !params.tokenName || !params.contract || !params.precision) {
            throw new Error('missing params; "from", "to", "amount", "tokenName","contract", "precision" is required ');
        }

        params.amount = '' + params.amount;

        return new Promise(function (resolve, reject) {
            var CallbackFun = _getCallbackName();

            window[CallbackFun] = function (result) {
                resolve(result);
            }
            _sendPuniRequest('enuTokenTransfer', JSON.stringify(params), CallbackFun);


        })
    },
    pushEnuAction: function (params) {
        return new Promise(function (resolve, reject) {
            var CallbackFun = _getCallbackName();

            window[CallbackFun] = function (result) {
                result = result.replace(/\r/ig, "").replace(/\n/ig, "");
                try {
                    var res = JSON.parse(result);
                    if (res.result && !res.data.transactionId) {
                        res.data = {
                            transactionId: res.data
                        };
                    }
                    resolve(res);
                } catch (e) {
                    reject(e);
                }
            }

            _sendPuniRequest('pushEnuAction', JSON.stringify(params), CallbackFun);

        });
    },
    getEnuBalance: function (params) {

        if (!params.account || !params.contract || !params.symbol) {
            throw new Error('missing params; "account", "contract", "symbol" is required ');
        }

        return new Promise(function (resolve, reject) {
            var CallbackFun = _getCallbackName();

            window[CallbackFun] = function (result) {
                resolve(result);
            }
            _sendPuniRequest('getEnuBalance', JSON.stringify(params), CallbackFun);
        });


    },
    getEnuTableRows: function (params) {
        return new Promise(function (resolve, reject) {
            var CallbackFun = _getCallbackName();

            window[CallbackFun] = function (result) {
                resolve(result);
            }

            _sendPuniRequest('getEnuTableRows', JSON.stringify(params), CallbackFun);
        });
    },
    getEnuAccountInfo: function (params) {
        if (!params.account) {
            throw new Error('missing params; "account" is required ');
        }

        return new Promise(function (resolve, reject) {
            var CallbackFun = _getCallbackName();

            window[CallbackFun] = function (result) {
                resolve(result);
            }
            _sendPuniRequest('getEnuAccountInfo', JSON.stringify(params), CallbackFun);
        });
    },
    getEnuTransactionRecord: function (params) {
        // 必填项
        if (!params.account) {
            throw new Error('missing params; "account" is required ');
        }

        params.count = params.count ? +params.count : 10;
        params.start = params.start ? +params.start : 0;

        return new Promise(function (resolve, reject) {
            var CallbackFun = _getCallbackName();

            window[CallbackFun] = function (result) {
                resolve(result);
            }

            _sendPuniRequest('getEnuTransactionRecord', JSON.stringify(params), CallbackFun);

        })
    },
    // eth moac
    pushMoacTransaction: function (params) {
        return new Promise(function (resolve, reject) {
            var CallbackFun = _getCallbackName();

            window[CallbackFun] = function (result) {
                resolve(result);
            }

            _sendPuniRequest('pushMoacTransaction', JSON.stringify(params), CallbackFun);
        });
    },
    moacTokenTransfer: function (params) {

        if (!params.from || !params.to || !params.amount || !params.gasLimit || !params.tokenName) {
            throw new Error('missing params; "from", "to", "amount", "gasLimit", "tokenName" is required ');
        }

        if (params.contract && !params.decimal) {
            throw new Error('missing params; "decimal" is required ');
        }

        return new Promise(function (resolve, reject) {
            var CallbackFun = _getCallbackName();

            window[CallbackFun] = function (result) {
                resolve(result);
            }
            _sendPuniRequest('moacTokenTransfer', JSON.stringify(params), CallbackFun);


        });

    },
    sendMoacTransaction: function (params) {
        return new Promise(function (resolve, reject) {
            var CallbackFun = _getCallbackName();

            window[CallbackFun] = function (result) {
                resolve(result);
            }

            _sendPuniRequest('sendMoacTransaction', JSON.stringify(params), CallbackFun);
        });
    },
    sendEthTransaction: function (params) {
        return new Promise(function (resolve, reject) {
            var CallbackFun = _getCallbackName();

            window[CallbackFun] = function (result) {
                resolve(result);
            }

            _sendPuniRequest('sendEthTransaction', JSON.stringify(params), CallbackFun);
        });
    },
    signMoacTransaction: function (params) {
        return new Promise(function (resolve, reject) {
            var CallbackFun = _getCallbackName();

            window[CallbackFun] = function (result) {
                resolve(result);
            }

            _sendPuniRequest('signMoacTransaction', JSON.stringify(params), CallbackFun);
        });
    },
    signEthTransaction: function (params) {
        return new Promise(function (resolve, reject) {
            var CallbackFun = _getCallbackName();

            window[CallbackFun] = function (result) {
                resolve(result);
            }

            _sendPuniRequest('signEthTransaction', JSON.stringify(params), CallbackFun);
        });
    },
    signCosmosTransaction: function (params) {
        return new Promise(function (resolve, reject) {
            var CallbackFun = _getCallbackName();

            window[CallbackFun] = function (result) {
                resolve(result);
            }

            _sendPuniRequest('signCosmosTransaction', JSON.stringify(params), CallbackFun);
        });
    },
    cosmosArbitrarySignature: function (pb, data) {
        var params = {
            address: pb,
            data: data
        }
        return new Promise(function (resolve, reject) {
            var CallbackFun = _getCallbackName();

            window[CallbackFun] = function (result) {
                resolve(result);
            }

            _sendPuniRequest('cosmosArbitrarySignature', JSON.stringify(params), CallbackFun);
        });
    },
    signJingtumTransaction: function (params) {
        return new Promise(function (resolve, reject) {
            var CallbackFun = _getCallbackName();

            window[CallbackFun] = function (result) {
                resolve(result);
            }

            _sendPuniRequest('signJingtumTransaction', JSON.stringify(params), CallbackFun);
        });
    },
    signOkexchainTransaction: function (tx, address) {
        return new Promise(function (resolve, reject) {
            var CallbackFun = _getCallbackName();

            window[CallbackFun] = function (result) {
                result = result.replace(/\r/ig, "").replace(/\n/ig, "");
                try {
                    var res = JSON.parse(result);

                    // turn array into buffer 
                    if (res.result && res.data && res.data.signatures) {
                        es.data.signatures.forEach(function (item) {
                            item.signature = item.signature && Buffer.from(item.signature);
                            item.pub_key.value = item.pub_key.value && Buffer.from(item.pub_key.value);
                        });
                    }

                    resolve(res);
                } catch (e) {
                    reject(e);
                }
            }

            var params = {
                tx: tx,
                from: address
            }

            _sendPuniRequest('signOkexchainTransaction', JSON.stringify(params), CallbackFun);
        });
    },
    getCurrentBalance: function () {
        return new Promise(function (resolve, reject) {
            var CallbackFun = _getCallbackName();

            window[CallbackFun] = function (result) {
                resolve(result);
            }

            _sendPuniRequest('getCurrentBalance', '', CallbackFun);
        });
    },
    btcTokenTransfer: function (params) {
        if (!params.from || !params.to || !params.amount) {
            throw new Error('missing params; "from", "to", "amount" is required ');
        }

        return new Promise(function (resolve, reject) {
            var CallbackFun = _getCallbackName();

            window[CallbackFun] = function (result) {
                resolve(result);
            }
            _sendPuniRequest('btcTokenTransfer', JSON.stringify(params), CallbackFun);


        });
    },
    usdtTokenTransfer: function (params) {
        if (!params.from || !params.to || !params.amount) {
            throw new Error('missing params; "from", "to", "amount" is required ');
        }

        return new Promise(function (resolve, reject) {
            var CallbackFun = _getCallbackName();

            window[CallbackFun] = function (result) {
                resolve(result);
            }
            _sendPuniRequest('usdtTokenTransfer', JSON.stringify(params), CallbackFun);


        });
    },
    getUsdtAddress: function () {
        return new Promise(function (resolve, reject) {
            var CallbackFun = _getCallbackName();

            window[CallbackFun] = function (result) {
                resolve(result);
            }
            _sendPuniRequest('getUsdtAddress', '', CallbackFun);


        });
    },
    getWallet: function (params) {
        if (params.walletTypes && params.walletTypes.length) {
            params.walletTypes = params.walletTypes.map(function (item) {
                return TYPE_MAP[item.toLowerCase()] || item;
            })
        }
        else {
            params.walletTypes = [];
        }

        // default
        if (undefined === params.switch) {
            params.switch = true
        }

        return new Promise(function (resolve, reject) {
            var CallbackFun = _getCallbackName();

            window[CallbackFun] = function (result) {
                result = result.replace(/\r/ig, "").replace(/\n/ig, "");
                try {
                    var res = JSON.parse(result);

                    if (res.data && res.data.blockchain_id) {
                        res.data.blockchain = BLOCKCHAIN_ID_MAP[res.data.blockchain_id + ''] || res.data.blockchain_id;
                    }

                    resolve(res);
                } catch (e) {
                    reject(e);
                }
            }
            _sendPuniRequest('getWallet', JSON.stringify(params), CallbackFun);
        });
    }
};


module.exports = puni;