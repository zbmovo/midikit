var n=Object.defineProperty;var c=(e,s,r)=>s in e?n(e,s,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[s]=r;var t=(e,s,r)=>(c(e,typeof s!="symbol"?s+"":s,r),r);(function(){"use strict";class e extends AudioWorkletProcessor{constructor(){super(...arguments);t(this,"index",0);t(this,"closed",!1)}process(o){const i=o[0];return this.port.postMessage({input:i,offset:this.index*128}),this.index++,!0}}registerProcessor("Transfer",e)})();