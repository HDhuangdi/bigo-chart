"use strict";function t(t){return t&&t.__esModule&&Object.prototype.hasOwnProperty.call(t,"default")?t.default:t}function e(t,e){return t(e={exports:{}},e.exports),e.exports}require("core-js/modules/es6.array.map.js"),require("core-js/modules/es6.object.keys.js"),require("core-js/modules/es6.array.fill.js"),require("core-js/modules/es6.array.slice.js"),require("core-js/modules/es6.regexp.split.js"),require("core-js/modules/es6.object.to-string.js"),require("core-js/modules/es6.regexp.to-string.js"),require("core-js/modules/es6.number.constructor.js"),require("core-js/modules/es6.regexp.constructor.js"),require("core-js/modules/es6.regexp.replace.js"),require("core-js/modules/es7.string.pad-start.js"),require("core-js/modules/es6.array.filter.js"),require("core-js/modules/es6.function.name.js"),require("core-js/modules/es6.symbol.js"),require("core-js/modules/es6.array.from.js"),require("core-js/modules/es6.string.iterator.js"),require("core-js/modules/es6.array.iterator.js"),require("core-js/modules/web.dom.iterable.js"),require("core-js/modules/es6.array.find.js");var i=e((function(t){t.exports=function(t,e){(null==e||e>t.length)&&(e=t.length);for(var i=0,r=new Array(e);i<e;i++)r[i]=t[i];return r},t.exports.default=t.exports,t.exports.__esModule=!0}));t(i);var r=e((function(t){t.exports=function(t){if(Array.isArray(t))return i(t)},t.exports.default=t.exports,t.exports.__esModule=!0}));t(r);var a=e((function(t){t.exports=function(t){if("undefined"!=typeof Symbol&&null!=t[Symbol.iterator]||null!=t["@@iterator"])return Array.from(t)},t.exports.default=t.exports,t.exports.__esModule=!0}));t(a);var n=e((function(t){t.exports=function(t,e){if(t){if("string"==typeof t)return i(t,e);var r=Object.prototype.toString.call(t).slice(8,-1);return"Object"===r&&t.constructor&&(r=t.constructor.name),"Map"===r||"Set"===r?Array.from(t):"Arguments"===r||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)?i(t,e):void 0}},t.exports.default=t.exports,t.exports.__esModule=!0}));t(n);var o=e((function(t){t.exports=function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")},t.exports.default=t.exports,t.exports.__esModule=!0}));t(o);var s=t(e((function(t){t.exports=function(t){return r(t)||a(t)||n(t)||o()},t.exports.default=t.exports,t.exports.__esModule=!0}))),h=t(e((function(t){t.exports=function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")},t.exports.default=t.exports,t.exports.__esModule=!0}))),l=t(e((function(t){function e(t,e){for(var i=0;i<e.length;i++){var r=e[i];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}t.exports=function(t,i,r){return i&&e(t.prototype,i),r&&e(t,r),t},t.exports.default=t.exports,t.exports.__esModule=!0}))),c=t(e((function(t){t.exports=function(t,e,i){return e in t?Object.defineProperty(t,e,{value:i,enumerable:!0,configurable:!0,writable:!0}):t[e]=i,t},t.exports.default=t.exports,t.exports.__esModule=!0})));function d(t,e){if(0===t)return"0";if(!t)return"--";var i=t.toString().split(".")[1],r=Number(t.toString().split(".")[0]);return i=function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"",e=arguments.length>1?arguments[1]:void 0;if(void 0!==e)if(0!==e)if(t)if(t.length>e)t=t.slice(0,e);else for(var i=0,r=e-t.length;i<r;i++)t+="0";else for(var a=0;a<e;a++)t+="0";else 0===e&&(t="");return t&&(t="."+t),t}(i,e),-1!==t.toString().indexOf("-")&&Math.abs(parseFloat(r))<=0?"-"+"".concat(r).concat(i):"".concat(r).concat(i)}function u(t,e){var i,r={"Y+":e.getFullYear().toString(),"m+":(e.getMonth()+1).toString(),"d+":e.getDate().toString(),"H+":e.getHours().toString(),"M+":e.getMinutes().toString(),"S+":e.getSeconds().toString()};for(var a in r)(i=new RegExp("("+a+")").exec(t))&&(t=t.replace(i[1],1===i[1].length?r[a]:r[a].padStart(i[1].length,"0")));return t}function v(t){throw new Error("[bigo-chart warn]:"+t)}var f=function(){function t(){h(this,t),c(this,"view",void 0),c(this,"service",void 0),c(this,"chart",void 0),c(this,"isMouseDown",!1),c(this,"prevMousePosition",{}),c(this,"nowMousePosition",{}),c(this,"dragCoefficient",1e3)}return l(t,[{key:"inject",value:function(t,e,i){this.view=t,this.service=e,this.chart=i}},{key:"registerMouseEvents",value:function(){var t=this.view;t.canvas.addEventListener("mousedown",this.onMouseDown.bind(this)),t.canvas.addEventListener("mousemove",this.onMouseMove.bind(this)),t.canvas.addEventListener("mouseup",this.onMouseUp.bind(this)),t.canvas.addEventListener("mousewheel",this.onMouseWeel.bind(this))}},{key:"onMouseDown",value:function(t){this.isMouseDown=!0,this.prevMousePosition={x:t.offsetX,y:t.offsetY}}},{key:"onMouseMove",value:function(t){var e=this.chart,i=this.view,r=this.service,a=t.offsetX,n=t.offsetY;if(this.nowMousePosition={x:a,y:n},!this.isMouseDown)return i.draw();r.dataZoom.user=!0;var o=this.prevMousePosition.x-this.nowMousePosition.x,s=e.bars[0].time,h=r.dataZoom.xAxisStartValue+this.dragCoefficient*o,l=r.dataZoom.xAxisEndValue+this.dragCoefficient*o;h-100*e.tickerUnit<=s?r.loadMoreData():(this.dragCoefficient=i.xAxisUnitsVisiable/e.tickerUnit*40,r.updateDataZoom(h,l),i.draw(),this.prevMousePosition={x:a,y:n})}},{key:"onMouseUp",value:function(){this.isMouseDown=!1}},{key:"onMouseWeel",value:function(t){t.preventDefault();var e,i,r,a=this.view,n=this.service;if(n.dataZoom.user=!0,t.wheelDelta?(e=t.wheelDelta/120,window.opera&&(e=-e)):t.detail&&(e=-t.detail/3),e>=0){if(n.dataZoom.data.length<=20)return;i=n.dataZoom.xAxisStartValue+12e4,r=n.dataZoom.xAxisEndValue-12e4}else{if(n.dataZoom.data.length>=200)return;i=n.dataZoom.xAxisStartValue-12e4,r=n.dataZoom.xAxisEndValue+12e4}n.updateDataZoom(i,r),a.draw()}}]),t}(),p=e((function(t){t.exports=function(t){if(Array.isArray(t))return t},t.exports.default=t.exports,t.exports.__esModule=!0}));t(p);var m=e((function(t){t.exports=function(t,e){var i=t&&("undefined"!=typeof Symbol&&t[Symbol.iterator]||t["@@iterator"]);if(null!=i){var r,a,n=[],o=!0,s=!1;try{for(i=i.call(t);!(o=(r=i.next()).done)&&(n.push(r.value),!e||n.length!==e);o=!0);}catch(t){s=!0,a=t}finally{try{o||null==i.return||i.return()}finally{if(s)throw a}}return n}},t.exports.default=t.exports,t.exports.__esModule=!0}));t(m);var g=e((function(t){t.exports=function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")},t.exports.default=t.exports,t.exports.__esModule=!0}));t(g);var x=t(e((function(t){t.exports=function(t,e){return p(t)||m(t,e)||n(t,e)||g()},t.exports.default=t.exports,t.exports.__esModule=!0}))),y=t(e((function(t){function e(t,e,i,r,a,n,o){try{var s=t[n](o),h=s.value}catch(t){return void i(t)}s.done?e(h):Promise.resolve(h).then(r,a)}t.exports=function(t){return function(){var i=this,r=arguments;return new Promise((function(a,n){var o=t.apply(i,r);function s(t){e(o,a,n,s,h,"next",t)}function h(t){e(o,a,n,s,h,"throw",t)}s(void 0)}))}},t.exports.default=t.exports,t.exports.__esModule=!0}))),w=e((function(t){var e=function(t){var e,i=Object.prototype,r=i.hasOwnProperty,a="function"==typeof Symbol?Symbol:{},n=a.iterator||"@@iterator",o=a.asyncIterator||"@@asyncIterator",s=a.toStringTag||"@@toStringTag";function h(t,e,i){return Object.defineProperty(t,e,{value:i,enumerable:!0,configurable:!0,writable:!0}),t[e]}try{h({},"")}catch(t){h=function(t,e,i){return t[e]=i}}function l(t,e,i,r){var a=e&&e.prototype instanceof m?e:m,n=Object.create(a.prototype),o=new D(r||[]);return n._invoke=function(t,e,i){var r=d;return function(a,n){if(r===v)throw new Error("Generator is already running");if(r===f){if("throw"===a)throw n;return T()}for(i.method=a,i.arg=n;;){var o=i.delegate;if(o){var s=M(o,i);if(s){if(s===p)continue;return s}}if("next"===i.method)i.sent=i._sent=i.arg;else if("throw"===i.method){if(r===d)throw r=f,i.arg;i.dispatchException(i.arg)}else"return"===i.method&&i.abrupt("return",i.arg);r=v;var h=c(t,e,i);if("normal"===h.type){if(r=i.done?f:u,h.arg===p)continue;return{value:h.arg,done:i.done}}"throw"===h.type&&(r=f,i.method="throw",i.arg=h.arg)}}}(t,i,o),n}function c(t,e,i){try{return{type:"normal",arg:t.call(e,i)}}catch(t){return{type:"throw",arg:t}}}t.wrap=l;var d="suspendedStart",u="suspendedYield",v="executing",f="completed",p={};function m(){}function g(){}function x(){}var y={};y[n]=function(){return this};var w=Object.getPrototypeOf,_=w&&w(w(k([])));_&&_!==i&&r.call(_,n)&&(y=_);var A=x.prototype=m.prototype=Object.create(y);function b(t){["next","throw","return"].forEach((function(e){h(t,e,(function(t){return this._invoke(e,t)}))}))}function E(t,e){function i(a,n,o,s){var h=c(t[a],t,n);if("throw"!==h.type){var l=h.arg,d=l.value;return d&&"object"==typeof d&&r.call(d,"__await")?e.resolve(d.__await).then((function(t){i("next",t,o,s)}),(function(t){i("throw",t,o,s)})):e.resolve(d).then((function(t){l.value=t,o(l)}),(function(t){return i("throw",t,o,s)}))}s(h.arg)}var a;this._invoke=function(t,r){function n(){return new e((function(e,a){i(t,r,e,a)}))}return a=a?a.then(n,n):n()}}function M(t,i){var r=t.iterator[i.method];if(r===e){if(i.delegate=null,"throw"===i.method){if(t.iterator.return&&(i.method="return",i.arg=e,M(t,i),"throw"===i.method))return p;i.method="throw",i.arg=new TypeError("The iterator does not provide a 'throw' method")}return p}var a=c(r,t.iterator,i.arg);if("throw"===a.type)return i.method="throw",i.arg=a.arg,i.delegate=null,p;var n=a.arg;return n?n.done?(i[t.resultName]=n.value,i.next=t.nextLoc,"return"!==i.method&&(i.method="next",i.arg=e),i.delegate=null,p):n:(i.method="throw",i.arg=new TypeError("iterator result is not an object"),i.delegate=null,p)}function L(t){var e={tryLoc:t[0]};1 in t&&(e.catchLoc=t[1]),2 in t&&(e.finallyLoc=t[2],e.afterLoc=t[3]),this.tryEntries.push(e)}function U(t){var e=t.completion||{};e.type="normal",delete e.arg,t.completion=e}function D(t){this.tryEntries=[{tryLoc:"root"}],t.forEach(L,this),this.reset(!0)}function k(t){if(t){var i=t[n];if(i)return i.call(t);if("function"==typeof t.next)return t;if(!isNaN(t.length)){var a=-1,o=function i(){for(;++a<t.length;)if(r.call(t,a))return i.value=t[a],i.done=!1,i;return i.value=e,i.done=!0,i};return o.next=o}}return{next:T}}function T(){return{value:e,done:!0}}return g.prototype=A.constructor=x,x.constructor=g,g.displayName=h(x,s,"GeneratorFunction"),t.isGeneratorFunction=function(t){var e="function"==typeof t&&t.constructor;return!!e&&(e===g||"GeneratorFunction"===(e.displayName||e.name))},t.mark=function(t){return Object.setPrototypeOf?Object.setPrototypeOf(t,x):(t.__proto__=x,h(t,s,"GeneratorFunction")),t.prototype=Object.create(A),t},t.awrap=function(t){return{__await:t}},b(E.prototype),E.prototype[o]=function(){return this},t.AsyncIterator=E,t.async=function(e,i,r,a,n){void 0===n&&(n=Promise);var o=new E(l(e,i,r,a),n);return t.isGeneratorFunction(i)?o:o.next().then((function(t){return t.done?t.value:o.next()}))},b(A),h(A,s,"Generator"),A[n]=function(){return this},A.toString=function(){return"[object Generator]"},t.keys=function(t){var e=[];for(var i in t)e.push(i);return e.reverse(),function i(){for(;e.length;){var r=e.pop();if(r in t)return i.value=r,i.done=!1,i}return i.done=!0,i}},t.values=k,D.prototype={constructor:D,reset:function(t){if(this.prev=0,this.next=0,this.sent=this._sent=e,this.done=!1,this.delegate=null,this.method="next",this.arg=e,this.tryEntries.forEach(U),!t)for(var i in this)"t"===i.charAt(0)&&r.call(this,i)&&!isNaN(+i.slice(1))&&(this[i]=e)},stop:function(){this.done=!0;var t=this.tryEntries[0].completion;if("throw"===t.type)throw t.arg;return this.rval},dispatchException:function(t){if(this.done)throw t;var i=this;function a(r,a){return s.type="throw",s.arg=t,i.next=r,a&&(i.method="next",i.arg=e),!!a}for(var n=this.tryEntries.length-1;n>=0;--n){var o=this.tryEntries[n],s=o.completion;if("root"===o.tryLoc)return a("end");if(o.tryLoc<=this.prev){var h=r.call(o,"catchLoc"),l=r.call(o,"finallyLoc");if(h&&l){if(this.prev<o.catchLoc)return a(o.catchLoc,!0);if(this.prev<o.finallyLoc)return a(o.finallyLoc)}else if(h){if(this.prev<o.catchLoc)return a(o.catchLoc,!0)}else{if(!l)throw new Error("try statement without catch or finally");if(this.prev<o.finallyLoc)return a(o.finallyLoc)}}}},abrupt:function(t,e){for(var i=this.tryEntries.length-1;i>=0;--i){var a=this.tryEntries[i];if(a.tryLoc<=this.prev&&r.call(a,"finallyLoc")&&this.prev<a.finallyLoc){var n=a;break}}n&&("break"===t||"continue"===t)&&n.tryLoc<=e&&e<=n.finallyLoc&&(n=null);var o=n?n.completion:{};return o.type=t,o.arg=e,n?(this.method="next",this.next=n.finallyLoc,p):this.complete(o)},complete:function(t,e){if("throw"===t.type)throw t.arg;return"break"===t.type||"continue"===t.type?this.next=t.arg:"return"===t.type?(this.rval=this.arg=t.arg,this.method="return",this.next="end"):"normal"===t.type&&e&&(this.next=e),p},finish:function(t){for(var e=this.tryEntries.length-1;e>=0;--e){var i=this.tryEntries[e];if(i.finallyLoc===t)return this.complete(i.completion,i.afterLoc),U(i),p}},catch:function(t){for(var e=this.tryEntries.length-1;e>=0;--e){var i=this.tryEntries[e];if(i.tryLoc===t){var r=i.completion;if("throw"===r.type){var a=r.arg;U(i)}return a}}throw new Error("illegal catch attempt")},delegateYield:function(t,i,r){return this.delegate={iterator:k(t),resultName:i,nextLoc:r},"next"===this.method&&(this.arg=e),p}},t}(t.exports);try{regeneratorRuntime=e}catch(t){Function("r","regeneratorRuntime = r")(e)}})),_=function(){function t(){h(this,t),c(this,"view",void 0),c(this,"controller",void 0),c(this,"chart",void 0),c(this,"unitToXAxisPx",0),c(this,"candleUnitToYAxisPx",0),c(this,"volumeUnitToYAxisPx",0),c(this,"highestVolume",void 0),c(this,"dataZoom",{}),c(this,"loadMorePending",void 0),c(this,"hasMoreData",!0),c(this,"yAxisBuffer",.1)}var e;return l(t,[{key:"inject",value:function(t,e,i){this.view=t,this.controller=e,this.chart=i}},{key:"calcUnitToXAxisPx",value:function(){var t=this.view;this.unitToXAxisPx=t.xAxisUnitsVisiable/t.chartWidth}},{key:"calcUnitToYAxisPx",value:function(){var t=this.view;this.candleUnitToYAxisPx=(this.dataZoom.klineYAxisEndValue-this.dataZoom.klineYAxisStartValue)/t.klineChartHeight,this.volumeUnitToYAxisPx=(this.dataZoom.volumeYAxisEndValue-this.dataZoom.volumeYAxisStartValue)/t.volumeChartHeight}},{key:"calcXAxisCoordinate",value:function(){for(var t=this,e=this.chart,i=Math.floor(this.dataZoom.data.length/8),r=[],a=0;a<e.bars.length;a+=i)r.push({time:e.bars[a].time,value:0});return r.map((function(e){return{x:t.mapDataToCoordinate(e.time,e.value).x,y:0,time:e.time}}))}},{key:"calcYAxisCoordinate",value:function(){var t,e,i=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"candle",r=this.view,a=this.highestVolume;"candle"===i?(e=r.chartYAxisUnitsVisiable,t=(this.dataZoom.klineYAxisEndValue-this.dataZoom.klineYAxisStartValue)/(r.chartYAxisUnitsVisiable-1)):(e=r.volumeYAxisUnitsVisiable,t=(a-this.dataZoom.volumeYAxisStartValue)/(r.volumeYAxisUnitsVisiable-1));for(var n=[],o=0;o<e;o++){var s=void 0;s="candle"===i?this.dataZoom.klineYAxisStartValue+o*t:this.dataZoom.volumeYAxisStartValue+o*t;var h=this.mapDataToCoordinate(0,s,i);n.push({x:r.padding.left+r.chartWidth,y:h.y,value:s})}return n}},{key:"calcPadding",value:function(t){var e=this.chart,i=this.view,r=e.canvasUtils.getTextWidthAndHeight(i.axisLabelSize*i.dpr,"sans-serif",d(Math.max.apply(Math,s(t.map((function(t){return t.volume})))),e.volumeDigitNumber)).width;i.padding.top=15*i.dpr,i.padding.bottom=20*i.dpr,i.padding.left=15*i.dpr,i.padding.right=r}},{key:"updateDataZoom",value:function(t,e){var i=this.chart,r=i.bars[i.bars.length-1].time,a=i.bars[0].time;r<t||a>e||(this.dataZoom.xAxisStartValue=t,this.dataZoom.xAxisEndValue=e)}},{key:"calcDataZoom",value:function(){var t=this,e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"update",i=this.chart,r=this.view;if("init"===e){var a=i.bars[i.bars.length-1].time+3*i.tickerUnit,n=a-r.xAxisUnitsVisiable;this.updateDataZoom(n,a)}else"update"===e&&(r.xAxisUnitsVisiable=this.dataZoom.xAxisEndValue-this.dataZoom.xAxisStartValue);this.dataZoom.data=i.bars.filter((function(e){return e.time<=t.dataZoom.xAxisEndValue&&e.time>=t.dataZoom.xAxisStartValue})),this.dataZoom.realData=i.bars.filter((function(e){return e.time<=t.dataZoom.xAxisEndValue+i.tickerUnit&&e.time>=t.dataZoom.xAxisStartValue-i.tickerUnit}));var o=Array.prototype.concat([],this.dataZoom.realData).sort((function(t,e){return e.high-t.high})),h=o[0].high;o.sort((function(t,e){return t.low-e.low}));var l=o[0].low;this.dataZoom.klineYAxisEndValue=h+(h-l)*this.yAxisBuffer,this.dataZoom.klineYAxisStartValue=l-(h-l)*this.yAxisBuffer,this.highestVolume=Math.max.apply(Math,s(o.map((function(t){return t.volume})))),this.dataZoom.volumeYAxisEndValue=this.highestVolume+this.highestVolume*this.yAxisBuffer,this.dataZoom.volumeYAxisStartValue=0}},{key:"calcMAPoints",value:function(){var t=this.chart;this.calcMAList(),t.MAOptions.forEach((function(e,i,r){for(var a,n=e.interval,o=[],s=[],h=0;h<t.MAData.length;h++){var l={value:t.MAData[h].close,time:t.MAData[h].time};s.push(l),h>=n-1&&(o.push({value:1*(a=s.map((function(t){return t.value})),a.reduce((function(t,e){return t+e}),0)/a.length).toFixed(t.priceDigitNumber),time:l.time}),s.shift())}r[i].points=o}))}},{key:"calcMAList",value:function(){var t=this,e=this.chart;e.MAData=e.bars.filter((function(i){return i.time<=t.dataZoom.xAxisEndValue+e.maxMAInterval*e.tickerUnit&&i.time>=t.dataZoom.xAxisStartValue-e.maxMAInterval*e.tickerUnit}))}},{key:"formatTickerData",value:function(t){t.status=t.close>=t.open?"up":"down",t.amplitude=(100*(t.high-t.low)/t.low).toFixed(2)+"%",t.change=(100*(t.close-t.high)/t.low).toFixed(2)+"%"}},{key:"loadMoreData",value:(e=y(w.mark((function t(){var e,i,r,a;return w.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:if(e=this.chart,i=this.view,!this.loadMorePending&&this.hasMoreData){t.next=3;break}return t.abrupt("return");case 3:if(r=e.bars[0].time,!e.options.loadMore){t.next=18;break}return this.loadMorePending=!0,t.next=8,e.options.loadMore(r);case 8:if(a=t.sent,this.loadMorePending=!1,a){t.next=13;break}return this.hasMoreData=!1,t.abrupt("return");case 13:a.sort((function(t,e){return t.time-e.time})),a[a.length-1].time.time===r.time&&a.splice(a.length-1,1),e.bars=a.concat(e.bars),i.draw();case 18:case"end":return t.stop()}}),t,this)}))),function(){return e.apply(this,arguments)})},{key:"mapDataToCoordinate",value:function(t,e){var i=arguments.length>2&&void 0!==arguments[2]?arguments[2]:"candle",r=this.view,a={x:0,y:0};if(a.x=r.padding.left+1*((t-this.dataZoom.xAxisStartValue)/this.unitToXAxisPx).toFixed(1),"candle"===i){var n=1*((e-this.dataZoom.klineYAxisStartValue)/this.candleUnitToYAxisPx).toFixed(1);a.y=r.padding.top+r.klineChartHeight-n}else{var o=1*((e-this.dataZoom.volumeYAxisStartValue)/this.volumeUnitToYAxisPx).toFixed(1);a.y=r.padding.top+r.chartHeight-o}return a}},{key:"mapCoordinateToData",value:function(t,e){var i=this.chart,r=this.view,a={time:0,value:0,type:""};a.time=Math.floor(this.dataZoom.xAxisStartValue+t*this.unitToXAxisPx);var n=r.klineChartHeight-e;return n<0?(a.type="volume",n=r.chartHeight-e,a.value=1*(this.dataZoom.volumeYAxisStartValue+n*this.volumeUnitToYAxisPx).toFixed(i.priceDigitNumber)):(a.value=1*(this.dataZoom.klineYAxisStartValue+n*this.candleUnitToYAxisPx).toFixed(i.priceDigitNumber),a.type="price"),a}},{key:"findTicker",value:function(t,e){var i=this.chart,r=this.view,a=this.mapCoordinateToData(t-r.padding.left,e-r.padding.top),n=a.time,o=a.value,s=a.type,h=this.dataZoom.data.filter((function(t){return t.time<=n&&t.time+i.tickerUnit>=n}));return{ticker:x(h,1)[0],value:o,type:s}}}]),t}(),A=function t(){h(this,t)};c(A,"up","#04BD75"),c(A,"upHighlight","#03A46B"),c(A,"upLowlight","rgba(4,189,117,0.6)"),c(A,"down","#CF304A"),c(A,"downHighlight","#C02944"),c(A,"downLowlight","rgba(207,48,74,0.6)");var b=function t(){h(this,t)};function E(t,e){var i="undefined"!=typeof Symbol&&t[Symbol.iterator]||t["@@iterator"];if(!i){if(Array.isArray(t)||(i=function(t,e){if(!t)return;if("string"==typeof t)return M(t,e);var i=Object.prototype.toString.call(t).slice(8,-1);"Object"===i&&t.constructor&&(i=t.constructor.name);if("Map"===i||"Set"===i)return Array.from(t);if("Arguments"===i||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(i))return M(t,e)}(t))||e&&t&&"number"==typeof t.length){i&&(t=i);var r=0,a=function(){};return{s:a,n:function(){return r>=t.length?{done:!0}:{done:!1,value:t[r++]}},e:function(t){throw t},f:a}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var n,o=!0,s=!1;return{s:function(){i=i.call(t)},n:function(){var t=i.next();return o=t.done,t},e:function(t){s=!0,n=t},f:function(){try{o||null==i.return||i.return()}finally{if(s)throw n}}}}function M(t,e){(null==e||e>t.length)&&(e=t.length);for(var i=0,r=new Array(e);i<e;i++)r[i]=t[i];return r}c(b,"CANVAS_ID","__bigo-chart__"),c(b,"CANDLE_INFO_CONTAINER_ID","__candle-info__"),c(b,"MA_INFO_CONTAINER_ID","__MA-info__"),c(b,"VOL_INFO_CONTAINER_ID","__vol-info__"),c(b,"VOL_SPAN_ID","__vol-span__"),c(b,"VOL_VALUE_ID","__vol-value__"),c(b,"TIME_SPAN_ID","__time-span__"),c(b,"OPEN_SPAN_ID","__open-span__"),c(b,"OPEN_VALUE_ID","__open-value__"),c(b,"HIGH_SPAN_ID","__high-span__"),c(b,"HIGH_VALUE_ID","__high-value__"),c(b,"LOW_SPAN_ID","__low-span__"),c(b,"LOW_VALUE_ID","__low-value__"),c(b,"CLOSE_SPAN_ID","__close-span__"),c(b,"CLOSE_VALUE_ID","__close-value__"),c(b,"CHANGE_SPAN_ID","__change-span__"),c(b,"CHANGE_VALUE_ID","__change-value__"),c(b,"AMPLITUDE_SPAN_ID","__amplitude-span__"),c(b,"AMPLITUDE_VALUE_ID","__amplitude-value__");var L=function(){function t(){h(this,t),c(this,"service",void 0),c(this,"controller",void 0),c(this,"chart",void 0),c(this,"canvas",void 0),c(this,"ctx",void 0),c(this,"dpr",void 0),c(this,"logo",void 0),c(this,"padding",{}),c(this,"canvasHeight",void 0),c(this,"canvasWidth",void 0),c(this,"chartWidth",void 0),c(this,"chartHeight",void 0),c(this,"klineChartHeight",void 0),c(this,"volumeChartHeight",0),c(this,"xAxisUnitsVisiable",72e5),c(this,"chartYAxisUnitsVisiable",8),c(this,"volumeYAxisUnitsVisiable",4),c(this,"axisLabelSize",10),c(this,"scaleHeight",void 0),c(this,"candleWidth",void 0),c(this,"candleMargin",void 0)}return l(t,[{key:"inject",value:function(t,e,i){this.service=t,this.controller=e,this.chart=i}},{key:"createElements",value:function(){var t=this.chart;t.domUtils.setStyle(t.container,{position:"relative"});var e=t.container.getBoundingClientRect(),i=e.height,r=e.width;this.canvas=t.domUtils.createElm("canvas",{id:b.CANVAS_ID,height:i,width:r}),this.ctx=this.canvas.getContext("2d"),t.domUtils.appendElms(this.canvas);var a=t.domUtils.createElm("div",{id:b.CANDLE_INFO_CONTAINER_ID});t.domUtils.appendElms(a,t.container);var n=t.domUtils.createElm("span",{id:b.TIME_SPAN_ID});n.innerHTML="N/A";var o=t.domUtils.createElm("span",{id:b.OPEN_SPAN_ID});o.innerHTML="O:";var s=t.domUtils.createElm("span",{id:b.OPEN_VALUE_ID});s.innerHTML="N/A";var h=t.domUtils.createElm("span",{id:b.HIGH_SPAN_ID});h.innerHTML="H:";var l=t.domUtils.createElm("span",{id:b.HIGH_VALUE_ID});l.innerHTML="N/A";var c=t.domUtils.createElm("span",{id:b.LOW_SPAN_ID});c.innerHTML="L:";var d=t.domUtils.createElm("span",{id:b.LOW_VALUE_ID});d.innerHTML="N/A";var u=t.domUtils.createElm("span",{id:b.CLOSE_SPAN_ID});u.innerHTML="C:";var v=t.domUtils.createElm("span",{id:b.CLOSE_VALUE_ID});v.innerHTML="N/A";var f=t.domUtils.createElm("span",{id:b.CHANGE_SPAN_ID});f.innerHTML="CHANGE:";var p=t.domUtils.createElm("span",{id:b.CHANGE_VALUE_ID});p.innerHTML="N/A";var m=t.domUtils.createElm("span",{id:b.AMPLITUDE_SPAN_ID});m.innerHTML="AMPLITUDE:";var g=t.domUtils.createElm("span",{id:b.AMPLITUDE_VALUE_ID});g.innerHTML="N/A",t.domUtils.appendElms([n,o,s,h,l,c,d,u,v,f,p,m,g],a);var x=t.domUtils.createElm("div",{id:b.MA_INFO_CONTAINER_ID});if(t.MAOptions.forEach((function(e){var i=t.domUtils.createElm("span");i.innerHTML="MA(".concat(e.interval,"):"),t.domUtils.appendElms(i,x);var r=t.domUtils.createElm("span",{id:"__ma-".concat(e.interval,"__"),style:"color:".concat(e.color)});r.innerHTML="N/A",t.domUtils.appendElms(r,x)})),t.domUtils.appendElms(x,t.container),t.options.hasVolume){var y=t.domUtils.createElm("div",{id:b.VOL_INFO_CONTAINER_ID});t.domUtils.appendElms(y,t.container);var w=t.domUtils.createElm("span",{id:b.VOL_SPAN_ID});w.innerHTML="Vol(".concat(t.options.volumeSymbol,"):");var _=t.domUtils.createElm("span",{id:b.VOL_VALUE_ID});t.domUtils.appendElms([w,_],y)}}},{key:"highDefinition",value:function(){this.dpr=window.devicePixelRatio||1;var t=this.canvas.getBoundingClientRect();this.canvas.width=t.width*this.dpr,this.canvas.height=t.height*this.dpr,this.canvasWidth=this.canvas.width,this.canvasHeight=this.canvas.height,this.canvas.style.height=this.canvas.height/this.dpr+"px",this.canvas.style.width=this.canvas.width/this.dpr+"px"}},{key:"initChart",value:function(){var t=this.chart,e=this.controller,i=t.options.logo;i&&(this.logo=new Image,this.logo.src=i,this.highDefinition(),e.registerMouseEvents(),this.draw())}},{key:"resize",value:function(){var t=this.chart;this.service.calcPadding(t.bars),this.chartHeight=this.canvasHeight-this.padding.top-this.padding.bottom,this.chartWidth=this.canvasWidth-this.padding.left-this.padding.right,t.options.hasVolume&&(this.volumeChartHeight=this.chartHeight/3),this.klineChartHeight=this.chartHeight-this.volumeChartHeight,t.domUtils.getDOMElm("#"+b.VOL_INFO_CONTAINER_ID).style="top:".concat((this.canvasHeight-this.volumeChartHeight)/this.dpr,"px")}},{key:"clearCanvas",value:function(){this.canvas.width=this.canvasWidth,this.canvas.height=this.canvasHeight}},{key:"drawLogo",value:function(){var t=348*this.dpr,e=85.5*this.dpr;this.ctx.drawImage(this.logo,this.canvasWidth/2-t/2,this.canvasHeight/2-e/2,t,e)}},{key:"draw",value:function(){var t=this.service,e=this.controller;this.resize(),t.calcDataZoom(t.dataZoom.user?"update":"init"),this.clearCanvas(),this.drawBg(),this.drawAxis(),this.drawMAs(),this.drawTicker(),this.drawTickerInfo(),this.drawLastTickerPrice(),this.drawCursorCross(e.nowMousePosition.x,e.nowMousePosition.y)}},{key:"drawBg",value:function(){var t=this,e=this.chart;this.ctx.beginPath(),this.ctx.fillStyle=e.options.backgroundColor||"#191b20",this.ctx.fillRect(0,0,this.canvasWidth,this.canvasHeight),this.logo&&(this.logo.complete?this.drawLogo():this.logo.onload=function(){t.drawLogo()})}},{key:"drawAxis",value:function(){var t=this.service;t.calcUnitToXAxisPx(),t.calcUnitToYAxisPx(),this.drawXAxis(),this.drawYAxis()}},{key:"drawXAxis",value:function(){var t=this.service,e=this.chart,i=t.calcXAxisCoordinate();this.scaleHeight=5*this.dpr,e.canvasUtils.drawLine({x:this.padding.left,y:this.chartHeight+this.padding.top},{x:this.chartWidth+this.padding.left,y:this.chartHeight+this.padding.top},"#34383F");var r,a=E(i);try{for(a.s();!(r=a.n()).done;){var n=r.value,o=n.x;o>=this.padding.left+this.chartWidth||o<=this.padding.left||(e.canvasUtils.drawLine({x:o,y:this.chartHeight+this.padding.top},{x:o,y:this.chartHeight+this.padding.top+this.scaleHeight},"rgb(132, 142, 156)"),e.canvasUtils.drawLine({x:o,y:this.padding.top},{x:o,y:this.chartHeight+this.padding.top},"#24272C"),this.drawLabels({x:o,y:void 0},n.time))}}catch(t){a.e(t)}finally{a.f()}}},{key:"drawYAxis",value:function(){var t=this,e=this.service,i=this.chart;(i.canvasUtils.drawLine({x:this.padding.left+this.chartWidth,y:this.padding.top},{x:this.padding.left+this.chartWidth,y:this.chartHeight+this.padding.top},"#34383F"),e.calcYAxisCoordinate("candle").forEach((function(e){i.canvasUtils.drawLine({x:t.padding.left+t.chartWidth,y:e.y},{x:t.chartWidth+t.padding.top+t.scaleHeight,y:e.y},"rgb(132, 142, 156)"),i.canvasUtils.drawLine({x:t.padding.left,y:e.y},{x:t.chartWidth+t.padding.left,y:e.y},"#24272C"),t.drawLabels({x:void 0,y:e.y},e.value)})),i.options.hasVolume)&&e.calcYAxisCoordinate("volume").forEach((function(e){i.canvasUtils.drawLine({x:t.padding.left+t.chartWidth,y:e.y},{x:t.chartWidth+t.padding.top+t.scaleHeight,y:e.y},"rgb(132, 142, 156)"),i.canvasUtils.drawLine({x:t.padding.left,y:e.y},{x:t.chartWidth+t.padding.left,y:e.y},"#24272C"),t.drawLabels({x:void 0,y:e.y},e.value)}))}},{key:"drawLabels",value:function(t,e){var i=this.chart,r=e,a={x:0,y:0};t.x?(r=u("HH:MM",new Date(e)),a.x=t.x,a.y=this.chartHeight+this.padding.top+this.scaleHeight):(r=d(r,i.priceDigitNumber),a.x=this.padding.left+this.chartWidth+this.scaleHeight+2*this.dpr,a.y=t.y),i.canvasUtils.drawText(a.x,a.y,r,this.axisLabelSize*this.dpr+"px sans-serif",t.x?"top":"middle","rgb(132, 142, 156)",t.x?"center":"left")}},{key:"drawTicker",value:function(){var t=this,e=this.service,i=this.chart;e.dataZoom.realData.forEach((function(e){t.drawCandle(e),i.options.hasVolume&&t.drawVolume(e)}))}},{key:"drawCandle",value:function(t){var e=this.service,i=this.chart;e.formatTickerData(t);var r=t.status,a=e.mapDataToCoordinate(t.time,t.open),n=e.mapDataToCoordinate(t.time,t.close),o=e.mapDataToCoordinate(t.time,t.high),s=e.mapDataToCoordinate(t.time,t.low);this.candleMargin=i.tickerUnit/20/e.unitToXAxisPx,this.candleWidth=i.tickerUnit/e.unitToXAxisPx-2*this.candleMargin;var h="up"===r?n.x-this.candleWidth/2:a.x-this.candleWidth/2,l="up"===r?n.y:a.y,c=Math.abs(n.y-a.y),d=this.candleWidth;if(h+d>=this.padding.left+this.chartWidth)(d=d-(h+d-this.padding.left-this.chartWidth)-2*this.dpr)<0&&(d=0);else if(h<this.padding.left){if(h+d<this.padding.left)return;d-=this.padding.left-h,h=this.padding.left}else i.canvasUtils.drawLine({x:a.x,y:o.y},{x:a.x,y:s.y},A[r]);i.canvasUtils.drawRect(h,l,d,c,A[r])}},{key:"drawVolumes",value:function(){var t=this;this.service.dataZoom.realData.forEach((function(e){return t.drawVolume(e)}))}},{key:"drawVolume",value:function(t){var e=this.service,i=this.chart,r=e.mapDataToCoordinate(t.time,t.volume,"volume"),a=r.x,n=r.y,o=this.candleWidth,s=this.canvasHeight-this.padding.bottom-n,h=a-o/2;if(h+o>=this.padding.left+this.chartWidth)(o=o-(h+o-this.padding.left-this.chartWidth)-2*this.dpr)<0&&(o=0);else if(h<this.padding.left){if(h+o<this.padding.left)return;o-=this.padding.left-h,h=this.padding.left}i.canvasUtils.drawRect(h,n,o,s,A[t.status+"Lowlight"])}},{key:"drawMAs",value:function(){var t=this,e=this.service,i=this.chart;e.calcMAPoints(),i.MAOptions.forEach((function(r){var a=r.points.map((function(t){return e.mapDataToCoordinate(t.time,t.value)}));t.ctx.beginPath();for(var n=0;n<a.length;n++){var o=a[n],s=a[n+1];if(!s)break;o.x<=t.padding.left||s.x>=t.chartWidth+t.padding.left||(o.y>t.padding.top+t.klineChartHeight||s.y>t.padding.top+t.klineChartHeight||i.canvasUtils.drawLine({x:o.x,y:o.y},{x:s.x,y:s.y},r.color,!1))}t.ctx.stroke()}))}},{key:"drawTickerInfo",value:function(){var t=this.chart,e=t.cursorTicker||t.bars[t.bars.length-1];this.drawCandleInfo(e);var i,r={},a=E(t.MAOptions);try{for(a.s();!(i=a.n()).done;){var n=i.value;if(r[n.interval]=n.points.find((function(t){return t.time===e.time})),!r[n.interval])return;r[n.interval].color=n.color}}catch(t){a.e(t)}finally{a.f()}this.drawMAInfo(r),t.options.hasVolume&&this.drawVolumeInfo(e)}},{key:"drawCandleInfo",value:function(t){var e=this.chart,i=e.domUtils;e.domUtils.getDOMElm("#"+b.TIME_SPAN_ID).innerHTML=u("YYYY/mm/dd HH:MM",new Date(t.time));var r=e.domUtils.getDOMElm("#"+b.OPEN_VALUE_ID);r.innerHTML=d(t.open,e.priceDigitNumber),i.setStyle(r,{color:A[t.status]});var a=e.domUtils.getDOMElm("#"+b.LOW_VALUE_ID);a.innerHTML=d(t.low,e.priceDigitNumber),i.setStyle(a,{color:A[t.status]});var n=e.domUtils.getDOMElm("#"+b.CLOSE_VALUE_ID);n.innerHTML=d(t.close,e.priceDigitNumber),i.setStyle(n,{color:A[t.status]});var o=e.domUtils.getDOMElm("#"+b.CHANGE_VALUE_ID);o.innerHTML=d(t.change,2),i.setStyle(o,{color:A[t.status]});var s=e.domUtils.getDOMElm("#"+b.AMPLITUDE_VALUE_ID);s.innerHTML=d(t.amplitude,2),i.setStyle(s,{color:A[t.status]})}},{key:"drawMAInfo",value:function(t){var e=this.chart,i=e.domUtils;for(var r in t){var a=t[r],n=e.domUtils.getDOMElm("#__ma-".concat(r,"__"));n.innerHTML=d(a.value,e.priceDigitNumber),i.setStyle(n,{color:a.color})}}},{key:"drawVolumeInfo",value:function(t){var e=this.chart,i=e.domUtils,r=e.domUtils.getDOMElm("#".concat(b.VOL_VALUE_ID));r.innerHTML=d(t.volume,e.volumeDigitNumer),i.setStyle(r,{color:A[t.status]})}},{key:"drawCursorCross",value:function(t,e){if(t&&e){var i=this.chart,r=this.dpr*t,a=this.dpr*e;r>=this.padding.left+this.chartWidth||a>this.padding.top+this.chartHeight?this.canvas.style.cursor="default":(this.canvas.style.cursor="crosshair",r=this.drawCursorLabel(r,a),i.canvasUtils.drawLine({x:this.padding.left,y:a},{x:this.padding.left+this.chartWidth,y:a},"#AEB4BC",!0,[5*this.dpr,5*this.dpr]),i.canvasUtils.drawLine({x:r,y:this.padding.top},{x:r,y:this.padding.top+this.chartHeight},"#AEB4BC",!0,[5*this.dpr,5*this.dpr]))}}},{key:"drawCursorLabel",value:function(t,e){var i=this.chart,r=this.service,a=r.findTicker(t,e),n=a.ticker,o=a.type,s=a.value;if(i.cursorTicker=n,!n)return t;var h=r.mapDataToCoordinate(n.time,0),l=u("YYYY/mm/dd HH:MM",new Date(n.time)),c=i.canvasUtils.getTextWidthAndHeight(this.axisLabelSize*this.dpr,"sans-serif",l),d=c.width,v=c.height,f=d+15*this.dpr,p=this.padding.bottom;return i.canvasUtils.drawRect(h.x-f/2,this.chartHeight+this.padding.top,f,p,"#2B2F36"),i.canvasUtils.drawText(h.x,this.chartHeight+this.padding.top+p/2-v/2,l,this.axisLabelSize*this.dpr+"px sans-serif","top","#fff","center"),this.drawYAxisLabelPolygon(e,"#2B2F36","#3D434C",s,o),h.x}},{key:"drawYAxisLabelPolygon",value:function(t,e,i,r,a){var n=this.chart,o=20*this.dpr,s=this.padding.right,h=[{x:this.padding.left+this.chartWidth,y:t},{x:this.padding.left+this.chartWidth+s/6,y:t-o/2},{x:this.padding.left+this.chartWidth+s,y:t-o/2},{x:this.padding.left+this.chartWidth+s,y:t+o/2},{x:this.padding.left+this.chartWidth+s/6,y:t+o/2}],l="price"===a?d(r,n.priceDigitNumber):r,c=n.canvasUtils.getTextWidthAndHeight(this.axisLabelSize*this.dpr,"sans-serif",l).width;n.canvasUtils.drawPolygon(h,"fill",e,1*this.dpr),n.canvasUtils.drawPolygon(h,"stroke",i,1*this.dpr),n.canvasUtils.drawText(this.padding.left+this.chartWidth+this.scaleHeight+this.padding.right/2-c/2,t,l,12*this.dpr+"px ","middle","#fff","left")}},{key:"drawLastTickerPrice",value:function(){var t=this.service,e=t.dataZoom.data[t.dataZoom.data.length-1],i=t.mapDataToCoordinate(e.time,e.close).y;this.drawYAxisLabelPolygon(i,A[e.status],"up"===e.status?A.upHighlight:A.downHighlight,e.close,"price")}}]),t}(),U=function(){function t(e){var i;h(this,t),c(this,"view",void 0),c(this,"service",void 0),c(this,"controller",void 0),c(this,"options",void 0),c(this,"bars",void 0),c(this,"container",void 0),c(this,"canvasUtils",void 0),c(this,"domUtils",void 0),c(this,"tickerUnit",void 0),c(this,"cursorTicker",void 0),c(this,"priceDigitNumber",2),c(this,"volumeDigitNumer",3),c(this,"MAOptions",[{color:"#FF00FF",interval:7},{color:"#CF3049",interval:25},{color:"#00CCCC",interval:99}]),c(this,"MAData",void 0),c(this,"maxMAInterval",void 0),this.view=new L,this.service=new _,this.controller=new f,this.inject(),this.checkOptions(e),this.container=document.querySelector(this.options.el),this.container||v("invalid dom"),this.domUtils=function(t){function e(t,e){var i=document.createElement(t);for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&(i[r]=e[r]);return i}function i(e,i){var r=i||t;Array.isArray(e)?e.forEach((function(t){return r.appendChild(t)})):r.appendChild(e)}return{createElm:e,appendElms:i,setStyle:function(t,e){for(var i in e)Object.prototype.hasOwnProperty.call(e,i)&&(t.style[i]=e[i])},getDOMElm:function(t,r){var a=document.querySelector(t);if(!a){for(var n=arguments.length,o=new Array(n>2?n-2:0),s=2;s<n;s++)o[s-2]=arguments[s];i(a=e.apply(void 0,o),r)}return a}}}(this.container),this.view.createElements(),this.canvasUtils=(i=this.view.ctx,{drawLine:function(t,e){var r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:"#fff",a=!(arguments.length>3&&void 0!==arguments[3])||arguments[3],n=arguments.length>4&&void 0!==arguments[4]?arguments[4]:[0,0];a&&i.beginPath(),i.setLineDash(n),i.moveTo(t.x,t.y),i.lineTo(e.x,e.y),i.strokeStyle=r,a&&i.stroke()},drawRect:function(t,e,r,a){var n=arguments.length>4&&void 0!==arguments[4]?arguments[4]:"#fff";i.fillStyle=n,i.lineWidth=1,i.beginPath(),i.rect(t,e,r,a),i.fill()},drawPolygon:function(t,e,r,a){i.beginPath(),i.lineWidth=a,i.moveTo(t[0].x,t[0].y),t.forEach((function(t,e){e>=1&&i.lineTo(t.x,t.y)})),i.lineTo(t[0].x,t[0].y),i[e+"Style"]=r,i.closePath(),i[e]()},drawText:function(t,e,r,a,n,o,s){i.font=a,i.textBaseline=n,i.textAlign=s,i.fillStyle=o,i.fillText(r,t,e)},getTextWidthAndHeight:function(t,e,r){return i.font=t+"px "+e,{width:i.measureText(r).width,height:t}}}),e.MA&&(this.MAOptions=e.MA),this.maxMAInterval=Math.max.apply(Math,s(this.MAOptions.map((function(t){return t.interval})))),this.bars=e.bars.sort((function(t,e){return t.time-e.time})),this.options.hasVolume&&(this.options.hasVolume=this.bars.every((function(t){return!!t.volume}))),this.tickerUnit=this.bars[1].time-this.bars[0].time,this.view.initChart()}return l(t,[{key:"inject",value:function(){this.service.inject(this.view,this.controller,this),this.controller.inject(this.view,this.service,this),this.view.inject(this.service,this.controller,this)}},{key:"checkOptions",value:function(t){t&&Object.keys(t).length||v("invalid options"),this.options=t}},{key:"subscribeBars",value:function(t,e,i){var r=this.bars[this.bars.length-1],a={open:r.open,high:r.high,low:r.low,close:t,volume:r.volume,time:r.time};i-r.time>=this.tickerUnit?(a.open=r.close,a.high=t,a.low=t,a.time=i,a.volume=e,this.bars.push(a)):(t>r.high&&(a.high=t),t<r.low&&(a.low=t),a.volume+=e,this.bars[this.bars.length-1]=a),this.view.draw()}}]),t}();module.exports=U;
