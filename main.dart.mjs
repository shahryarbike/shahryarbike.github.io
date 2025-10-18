// Compiles a dart2wasm-generated main module from `source` which can then
// instantiatable via the `instantiate` method.
//
// `source` needs to be a `Response` object (or promise thereof) e.g. created
// via the `fetch()` JS API.
export async function compileStreaming(source) {
  const builtins = {builtins: ['js-string']};
  return new CompiledApp(
      await WebAssembly.compileStreaming(source, builtins), builtins);
}

// Compiles a dart2wasm-generated wasm modules from `bytes` which is then
// instantiatable via the `instantiate` method.
export async function compile(bytes) {
  const builtins = {builtins: ['js-string']};
  return new CompiledApp(await WebAssembly.compile(bytes, builtins), builtins);
}

// DEPRECATED: Please use `compile` or `compileStreaming` to get a compiled app,
// use `instantiate` method to get an instantiated app and then call
// `invokeMain` to invoke the main function.
export async function instantiate(modulePromise, importObjectPromise) {
  var moduleOrCompiledApp = await modulePromise;
  if (!(moduleOrCompiledApp instanceof CompiledApp)) {
    moduleOrCompiledApp = new CompiledApp(moduleOrCompiledApp);
  }
  const instantiatedApp = await moduleOrCompiledApp.instantiate(await importObjectPromise);
  return instantiatedApp.instantiatedModule;
}

// DEPRECATED: Please use `compile` or `compileStreaming` to get a compiled app,
// use `instantiate` method to get an instantiated app and then call
// `invokeMain` to invoke the main function.
export const invoke = (moduleInstance, ...args) => {
  moduleInstance.exports.$invokeMain(args);
}

class CompiledApp {
  constructor(module, builtins) {
    this.module = module;
    this.builtins = builtins;
  }

  // The second argument is an options object containing:
  // `loadDeferredWasm` is a JS function that takes a module name matching a
  //   wasm file produced by the dart2wasm compiler and returns the bytes to
  //   load the module. These bytes can be in either a format supported by
  //   `WebAssembly.compile` or `WebAssembly.compileStreaming`.
  // `loadDynamicModule` is a JS function that takes two string names matching,
  //   in order, a wasm file produced by the dart2wasm compiler during dynamic
  //   module compilation and a corresponding js file produced by the same
  //   compilation. It should return a JS Array containing 2 elements. The first
  //   should be the bytes for the wasm module in a format supported by
  //   `WebAssembly.compile` or `WebAssembly.compileStreaming`. The second
  //   should be the result of using the JS 'import' API on the js file path.
  async instantiate(additionalImports, {loadDeferredWasm, loadDynamicModule} = {}) {
    let dartInstance;

    // Prints to the console
    function printToConsole(value) {
      if (typeof dartPrint == "function") {
        dartPrint(value);
        return;
      }
      if (typeof console == "object" && typeof console.log != "undefined") {
        console.log(value);
        return;
      }
      if (typeof print == "function") {
        print(value);
        return;
      }

      throw "Unable to print message: " + value;
    }

    // A special symbol attached to functions that wrap Dart functions.
    const jsWrappedDartFunctionSymbol = Symbol("JSWrappedDartFunction");

    function finalizeWrapper(dartFunction, wrapped) {
      wrapped.dartFunction = dartFunction;
      wrapped[jsWrappedDartFunctionSymbol] = true;
      return wrapped;
    }

    // Imports
    const dart2wasm = {
            _4: (o, c) => o instanceof c,
      _7: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._7(f,arguments.length,x0) }),
      _8: f => finalizeWrapper(f, function(x0,x1) { return dartInstance.exports._8(f,arguments.length,x0,x1) }),
      _37: x0 => new Array(x0),
      _39: x0 => x0.length,
      _41: (x0,x1) => x0[x1],
      _42: (x0,x1,x2) => { x0[x1] = x2 },
      _43: x0 => new Promise(x0),
      _45: (x0,x1,x2) => new DataView(x0,x1,x2),
      _47: x0 => new Int8Array(x0),
      _48: (x0,x1,x2) => new Uint8Array(x0,x1,x2),
      _49: x0 => new Uint8Array(x0),
      _51: x0 => new Uint8ClampedArray(x0),
      _53: x0 => new Int16Array(x0),
      _55: x0 => new Uint16Array(x0),
      _57: x0 => new Int32Array(x0),
      _59: x0 => new Uint32Array(x0),
      _61: x0 => new Float32Array(x0),
      _63: x0 => new Float64Array(x0),
      _65: (x0,x1,x2) => x0.call(x1,x2),
      _67: (x0,x1) => x0.call(x1),
      _70: (decoder, codeUnits) => decoder.decode(codeUnits),
      _71: () => new TextDecoder("utf-8", {fatal: true}),
      _72: () => new TextDecoder("utf-8", {fatal: false}),
      _73: (s) => +s,
      _74: x0 => new Uint8Array(x0),
      _75: (x0,x1,x2) => x0.set(x1,x2),
      _76: (x0,x1) => x0.transferFromImageBitmap(x1),
      _78: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._78(f,arguments.length,x0) }),
      _79: x0 => new window.FinalizationRegistry(x0),
      _80: (x0,x1,x2,x3) => x0.register(x1,x2,x3),
      _81: (x0,x1) => x0.unregister(x1),
      _82: (x0,x1,x2) => x0.slice(x1,x2),
      _83: (x0,x1) => x0.decode(x1),
      _84: (x0,x1) => x0.segment(x1),
      _85: () => new TextDecoder(),
      _87: x0 => x0.click(),
      _88: x0 => x0.buffer,
      _89: x0 => x0.wasmMemory,
      _90: () => globalThis.window._flutter_skwasmInstance,
      _91: x0 => x0.rasterStartMilliseconds,
      _92: x0 => x0.rasterEndMilliseconds,
      _93: x0 => x0.imageBitmaps,
      _120: x0 => x0.remove(),
      _121: (x0,x1) => x0.append(x1),
      _122: (x0,x1,x2) => x0.insertBefore(x1,x2),
      _123: (x0,x1) => x0.querySelector(x1),
      _125: (x0,x1) => x0.removeChild(x1),
      _203: x0 => x0.stopPropagation(),
      _204: x0 => x0.preventDefault(),
      _206: (x0,x1,x2,x3) => x0.addEventListener(x1,x2,x3),
      _251: x0 => x0.unlock(),
      _252: x0 => x0.getReader(),
      _253: (x0,x1,x2) => x0.addEventListener(x1,x2),
      _254: (x0,x1,x2) => x0.removeEventListener(x1,x2),
      _255: (x0,x1) => x0.item(x1),
      _256: x0 => x0.next(),
      _257: x0 => x0.now(),
      _258: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._258(f,arguments.length,x0) }),
      _259: (x0,x1) => x0.addListener(x1),
      _260: (x0,x1) => x0.removeListener(x1),
      _261: (x0,x1) => x0.matchMedia(x1),
      _262: (x0,x1) => x0.revokeObjectURL(x1),
      _263: x0 => x0.close(),
      _264: (x0,x1,x2,x3,x4) => ({type: x0,data: x1,premultiplyAlpha: x2,colorSpaceConversion: x3,preferAnimation: x4}),
      _265: x0 => new window.ImageDecoder(x0),
      _266: x0 => ({frameIndex: x0}),
      _267: (x0,x1) => x0.decode(x1),
      _268: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._268(f,arguments.length,x0) }),
      _269: (x0,x1) => x0.getModifierState(x1),
      _270: (x0,x1) => x0.removeProperty(x1),
      _271: (x0,x1) => x0.prepend(x1),
      _272: x0 => x0.disconnect(),
      _273: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._273(f,arguments.length,x0) }),
      _274: (x0,x1) => x0.getAttribute(x1),
      _275: (x0,x1) => x0.contains(x1),
      _276: x0 => x0.blur(),
      _277: x0 => x0.hasFocus(),
      _278: (x0,x1) => x0.hasAttribute(x1),
      _279: (x0,x1) => x0.getModifierState(x1),
      _280: (x0,x1) => x0.appendChild(x1),
      _281: (x0,x1) => x0.createTextNode(x1),
      _282: (x0,x1) => x0.removeAttribute(x1),
      _283: x0 => x0.getBoundingClientRect(),
      _284: (x0,x1) => x0.observe(x1),
      _285: x0 => x0.disconnect(),
      _286: (x0,x1) => x0.closest(x1),
      _696: () => globalThis.window.flutterConfiguration,
      _697: x0 => x0.assetBase,
      _703: x0 => x0.debugShowSemanticsNodes,
      _704: x0 => x0.hostElement,
      _705: x0 => x0.multiViewEnabled,
      _706: x0 => x0.nonce,
      _708: x0 => x0.fontFallbackBaseUrl,
      _712: x0 => x0.console,
      _713: x0 => x0.devicePixelRatio,
      _714: x0 => x0.document,
      _715: x0 => x0.history,
      _716: x0 => x0.innerHeight,
      _717: x0 => x0.innerWidth,
      _718: x0 => x0.location,
      _719: x0 => x0.navigator,
      _720: x0 => x0.visualViewport,
      _721: x0 => x0.performance,
      _723: x0 => x0.URL,
      _725: (x0,x1) => x0.getComputedStyle(x1),
      _726: x0 => x0.screen,
      _727: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._727(f,arguments.length,x0) }),
      _728: (x0,x1) => x0.requestAnimationFrame(x1),
      _733: (x0,x1) => x0.warn(x1),
      _735: (x0,x1) => x0.debug(x1),
      _736: x0 => globalThis.parseFloat(x0),
      _737: () => globalThis.window,
      _738: () => globalThis.Intl,
      _739: () => globalThis.Symbol,
      _740: (x0,x1,x2,x3,x4) => globalThis.createImageBitmap(x0,x1,x2,x3,x4),
      _742: x0 => x0.clipboard,
      _743: x0 => x0.maxTouchPoints,
      _744: x0 => x0.vendor,
      _745: x0 => x0.language,
      _746: x0 => x0.platform,
      _747: x0 => x0.userAgent,
      _748: (x0,x1) => x0.vibrate(x1),
      _749: x0 => x0.languages,
      _750: x0 => x0.documentElement,
      _751: (x0,x1) => x0.querySelector(x1),
      _754: (x0,x1) => x0.createElement(x1),
      _757: (x0,x1) => x0.createEvent(x1),
      _758: x0 => x0.activeElement,
      _761: x0 => x0.head,
      _762: x0 => x0.body,
      _764: (x0,x1) => { x0.title = x1 },
      _767: x0 => x0.visibilityState,
      _768: () => globalThis.document,
      _769: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._769(f,arguments.length,x0) }),
      _770: (x0,x1) => x0.dispatchEvent(x1),
      _778: x0 => x0.target,
      _780: x0 => x0.timeStamp,
      _781: x0 => x0.type,
      _783: (x0,x1,x2,x3) => x0.initEvent(x1,x2,x3),
      _789: x0 => x0.baseURI,
      _790: x0 => x0.firstChild,
      _794: x0 => x0.parentElement,
      _796: (x0,x1) => { x0.textContent = x1 },
      _797: x0 => x0.parentNode,
      _799: x0 => x0.isConnected,
      _803: x0 => x0.firstElementChild,
      _805: x0 => x0.nextElementSibling,
      _806: x0 => x0.clientHeight,
      _807: x0 => x0.clientWidth,
      _808: x0 => x0.offsetHeight,
      _809: x0 => x0.offsetWidth,
      _810: x0 => x0.id,
      _811: (x0,x1) => { x0.id = x1 },
      _814: (x0,x1) => { x0.spellcheck = x1 },
      _815: x0 => x0.tagName,
      _816: x0 => x0.style,
      _818: (x0,x1) => x0.querySelectorAll(x1),
      _819: (x0,x1,x2) => x0.setAttribute(x1,x2),
      _820: x0 => x0.tabIndex,
      _821: (x0,x1) => { x0.tabIndex = x1 },
      _822: (x0,x1) => x0.focus(x1),
      _823: x0 => x0.scrollTop,
      _824: (x0,x1) => { x0.scrollTop = x1 },
      _825: x0 => x0.scrollLeft,
      _826: (x0,x1) => { x0.scrollLeft = x1 },
      _827: x0 => x0.classList,
      _829: (x0,x1) => { x0.className = x1 },
      _831: (x0,x1) => x0.getElementsByClassName(x1),
      _832: (x0,x1) => x0.attachShadow(x1),
      _835: x0 => x0.computedStyleMap(),
      _836: (x0,x1) => x0.get(x1),
      _842: (x0,x1) => x0.getPropertyValue(x1),
      _843: (x0,x1,x2,x3) => x0.setProperty(x1,x2,x3),
      _844: x0 => x0.offsetLeft,
      _845: x0 => x0.offsetTop,
      _846: x0 => x0.offsetParent,
      _848: (x0,x1) => { x0.name = x1 },
      _849: x0 => x0.content,
      _850: (x0,x1) => { x0.content = x1 },
      _854: (x0,x1) => { x0.src = x1 },
      _855: x0 => x0.naturalWidth,
      _856: x0 => x0.naturalHeight,
      _860: (x0,x1) => { x0.crossOrigin = x1 },
      _862: (x0,x1) => { x0.decoding = x1 },
      _863: x0 => x0.decode(),
      _868: (x0,x1) => { x0.nonce = x1 },
      _873: (x0,x1) => { x0.width = x1 },
      _875: (x0,x1) => { x0.height = x1 },
      _878: (x0,x1) => x0.getContext(x1),
      _940: (x0,x1) => x0.fetch(x1),
      _941: x0 => x0.status,
      _943: x0 => x0.body,
      _944: x0 => x0.arrayBuffer(),
      _947: x0 => x0.read(),
      _948: x0 => x0.value,
      _949: x0 => x0.done,
      _951: x0 => x0.name,
      _952: x0 => x0.x,
      _953: x0 => x0.y,
      _956: x0 => x0.top,
      _957: x0 => x0.right,
      _958: x0 => x0.bottom,
      _959: x0 => x0.left,
      _971: x0 => x0.height,
      _972: x0 => x0.width,
      _973: x0 => x0.scale,
      _974: (x0,x1) => { x0.value = x1 },
      _977: (x0,x1) => { x0.placeholder = x1 },
      _979: (x0,x1) => { x0.name = x1 },
      _980: x0 => x0.selectionDirection,
      _981: x0 => x0.selectionStart,
      _982: x0 => x0.selectionEnd,
      _985: x0 => x0.value,
      _987: (x0,x1,x2) => x0.setSelectionRange(x1,x2),
      _988: x0 => x0.readText(),
      _989: (x0,x1) => x0.writeText(x1),
      _991: x0 => x0.altKey,
      _992: x0 => x0.code,
      _993: x0 => x0.ctrlKey,
      _994: x0 => x0.key,
      _995: x0 => x0.keyCode,
      _996: x0 => x0.location,
      _997: x0 => x0.metaKey,
      _998: x0 => x0.repeat,
      _999: x0 => x0.shiftKey,
      _1000: x0 => x0.isComposing,
      _1002: x0 => x0.state,
      _1003: (x0,x1) => x0.go(x1),
      _1005: (x0,x1,x2,x3) => x0.pushState(x1,x2,x3),
      _1006: (x0,x1,x2,x3) => x0.replaceState(x1,x2,x3),
      _1007: x0 => x0.pathname,
      _1008: x0 => x0.search,
      _1009: x0 => x0.hash,
      _1013: x0 => x0.state,
      _1016: (x0,x1) => x0.createObjectURL(x1),
      _1018: x0 => new Blob(x0),
      _1020: x0 => new MutationObserver(x0),
      _1021: (x0,x1,x2) => x0.observe(x1,x2),
      _1022: f => finalizeWrapper(f, function(x0,x1) { return dartInstance.exports._1022(f,arguments.length,x0,x1) }),
      _1025: x0 => x0.attributeName,
      _1026: x0 => x0.type,
      _1027: x0 => x0.matches,
      _1028: x0 => x0.matches,
      _1032: x0 => x0.relatedTarget,
      _1034: x0 => x0.clientX,
      _1035: x0 => x0.clientY,
      _1036: x0 => x0.offsetX,
      _1037: x0 => x0.offsetY,
      _1040: x0 => x0.button,
      _1041: x0 => x0.buttons,
      _1042: x0 => x0.ctrlKey,
      _1046: x0 => x0.pointerId,
      _1047: x0 => x0.pointerType,
      _1048: x0 => x0.pressure,
      _1049: x0 => x0.tiltX,
      _1050: x0 => x0.tiltY,
      _1051: x0 => x0.getCoalescedEvents(),
      _1054: x0 => x0.deltaX,
      _1055: x0 => x0.deltaY,
      _1056: x0 => x0.wheelDeltaX,
      _1057: x0 => x0.wheelDeltaY,
      _1058: x0 => x0.deltaMode,
      _1065: x0 => x0.changedTouches,
      _1068: x0 => x0.clientX,
      _1069: x0 => x0.clientY,
      _1072: x0 => x0.data,
      _1075: (x0,x1) => { x0.disabled = x1 },
      _1077: (x0,x1) => { x0.type = x1 },
      _1078: (x0,x1) => { x0.max = x1 },
      _1079: (x0,x1) => { x0.min = x1 },
      _1080: x0 => x0.value,
      _1081: (x0,x1) => { x0.value = x1 },
      _1082: x0 => x0.disabled,
      _1083: (x0,x1) => { x0.disabled = x1 },
      _1085: (x0,x1) => { x0.placeholder = x1 },
      _1087: (x0,x1) => { x0.name = x1 },
      _1089: (x0,x1) => { x0.autocomplete = x1 },
      _1090: x0 => x0.selectionDirection,
      _1092: x0 => x0.selectionStart,
      _1093: x0 => x0.selectionEnd,
      _1096: (x0,x1,x2) => x0.setSelectionRange(x1,x2),
      _1097: (x0,x1) => x0.add(x1),
      _1100: (x0,x1) => { x0.noValidate = x1 },
      _1101: (x0,x1) => { x0.method = x1 },
      _1102: (x0,x1) => { x0.action = x1 },
      _1128: x0 => x0.orientation,
      _1129: x0 => x0.width,
      _1130: x0 => x0.height,
      _1131: (x0,x1) => x0.lock(x1),
      _1150: x0 => new ResizeObserver(x0),
      _1153: f => finalizeWrapper(f, function(x0,x1) { return dartInstance.exports._1153(f,arguments.length,x0,x1) }),
      _1161: x0 => x0.length,
      _1162: x0 => x0.iterator,
      _1163: x0 => x0.Segmenter,
      _1164: x0 => x0.v8BreakIterator,
      _1165: (x0,x1) => new Intl.Segmenter(x0,x1),
      _1166: x0 => x0.done,
      _1167: x0 => x0.value,
      _1168: x0 => x0.index,
      _1172: (x0,x1) => new Intl.v8BreakIterator(x0,x1),
      _1173: (x0,x1) => x0.adoptText(x1),
      _1174: x0 => x0.first(),
      _1175: x0 => x0.next(),
      _1176: x0 => x0.current(),
      _1182: x0 => x0.hostElement,
      _1183: x0 => x0.viewConstraints,
      _1186: x0 => x0.maxHeight,
      _1187: x0 => x0.maxWidth,
      _1188: x0 => x0.minHeight,
      _1189: x0 => x0.minWidth,
      _1190: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1190(f,arguments.length,x0) }),
      _1191: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1191(f,arguments.length,x0) }),
      _1192: (x0,x1) => ({addView: x0,removeView: x1}),
      _1193: x0 => x0.loader,
      _1194: () => globalThis._flutter,
      _1195: (x0,x1) => x0.didCreateEngineInitializer(x1),
      _1196: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1196(f,arguments.length,x0) }),
      _1197: f => finalizeWrapper(f, function() { return dartInstance.exports._1197(f,arguments.length) }),
      _1198: (x0,x1) => ({initializeEngine: x0,autoStart: x1}),
      _1199: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1199(f,arguments.length,x0) }),
      _1200: x0 => ({runApp: x0}),
      _1201: f => finalizeWrapper(f, function(x0,x1) { return dartInstance.exports._1201(f,arguments.length,x0,x1) }),
      _1202: x0 => x0.length,
      _1203: () => globalThis.window.ImageDecoder,
      _1204: x0 => x0.tracks,
      _1206: x0 => x0.completed,
      _1208: x0 => x0.image,
      _1214: x0 => x0.displayWidth,
      _1215: x0 => x0.displayHeight,
      _1216: x0 => x0.duration,
      _1219: x0 => x0.ready,
      _1220: x0 => x0.selectedTrack,
      _1221: x0 => x0.repetitionCount,
      _1222: x0 => x0.frameCount,
      _1270: (x0,x1) => x0.createElement(x1),
      _1276: (x0,x1,x2) => x0.addEventListener(x1,x2),
      _1277: (x0,x1) => x0.querySelector(x1),
      _1278: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1278(f,arguments.length,x0) }),
      _1279: (x0,x1) => x0.removeChild(x1),
      _1280: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1280(f,arguments.length,x0) }),
      _1281: (x0,x1) => x0.appendChild(x1),
      _1282: () => new Map(),
      _1283: (x0,x1,x2) => x0.set(x1,x2),
      _1284: (x0,x1,x2,x3) => x0.call(x1,x2,x3),
      _1285: f => finalizeWrapper(f, function(x0,x1) { return dartInstance.exports._1285(f,arguments.length,x0,x1) }),
      _1286: (x0,x1) => new ZXing.BrowserMultiFormatReader(x0,x1),
      _1288: x0 => x0.play(),
      _1289: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1289(f,arguments.length,x0) }),
      _1290: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1290(f,arguments.length,x0) }),
      _1291: (x0,x1) => x0.append(x1),
      _1292: x0 => x0.getVideoTracks(),
      _1293: x0 => x0.getSupportedConstraints(),
      _1294: x0 => ({video: x0}),
      _1295: x0 => ({facingMode: x0}),
      _1296: (x0,x1) => x0.getUserMedia(x1),
      _1297: x0 => x0.reload(),
      _1299: (x0,x1,x2,x3) => x0.addEventListener(x1,x2,x3),
      _1300: (x0,x1,x2,x3) => x0.removeEventListener(x1,x2,x3),
      _1301: (x0,x1) => x0.createElement(x1),
      _1308: (x0,x1,x2,x3) => x0.open(x1,x2,x3),
      _1320: x0 => x0.decode(),
      _1321: (x0,x1,x2,x3) => x0.open(x1,x2,x3),
      _1322: (x0,x1,x2) => x0.setRequestHeader(x1,x2),
      _1323: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1323(f,arguments.length,x0) }),
      _1324: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1324(f,arguments.length,x0) }),
      _1325: x0 => x0.send(),
      _1326: () => new XMLHttpRequest(),
      _1333: (x0,x1) => x0.query(x1),
      _1334: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1334(f,arguments.length,x0) }),
      _1335: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1335(f,arguments.length,x0) }),
      _1336: (x0,x1,x2) => ({enableHighAccuracy: x0,timeout: x1,maximumAge: x2}),
      _1337: (x0,x1,x2,x3) => x0.getCurrentPosition(x1,x2,x3),
      _1338: (x0,x1) => x0.clearWatch(x1),
      _1339: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1339(f,arguments.length,x0) }),
      _1340: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1340(f,arguments.length,x0) }),
      _1341: (x0,x1,x2,x3) => x0.watchPosition(x1,x2,x3),
      _1342: (x0,x1) => x0.getItem(x1),
      _1344: (x0,x1,x2) => x0.setItem(x1,x2),
      _1345: x0 => x0.barcodeFormat,
      _1346: x0 => x0.text,
      _1347: x0 => x0.rawBytes,
      _1348: x0 => x0.resultPoints,
      _1350: Date.now,
      _1352: s => new Date(s * 1000).getTimezoneOffset() * 60,
      _1353: s => {
        if (!/^\s*[+-]?(?:Infinity|NaN|(?:\.\d+|\d+(?:\.\d*)?)(?:[eE][+-]?\d+)?)\s*$/.test(s)) {
          return NaN;
        }
        return parseFloat(s);
      },
      _1354: () => {
        let stackString = new Error().stack.toString();
        let frames = stackString.split('\n');
        let drop = 2;
        if (frames[0] === 'Error') {
            drop += 1;
        }
        return frames.slice(drop).join('\n');
      },
      _1355: () => typeof dartUseDateNowForTicks !== "undefined",
      _1356: () => 1000 * performance.now(),
      _1357: () => Date.now(),
      _1358: () => {
        // On browsers return `globalThis.location.href`
        if (globalThis.location != null) {
          return globalThis.location.href;
        }
        return null;
      },
      _1359: () => {
        return typeof process != "undefined" &&
               Object.prototype.toString.call(process) == "[object process]" &&
               process.platform == "win32"
      },
      _1360: () => new WeakMap(),
      _1361: (map, o) => map.get(o),
      _1362: (map, o, v) => map.set(o, v),
      _1363: x0 => new WeakRef(x0),
      _1364: x0 => x0.deref(),
      _1371: () => globalThis.WeakRef,
      _1375: s => JSON.stringify(s),
      _1376: s => printToConsole(s),
      _1377: (o, p, r) => o.replaceAll(p, () => r),
      _1378: (o, p, r) => o.replace(p, () => r),
      _1379: Function.prototype.call.bind(String.prototype.toLowerCase),
      _1380: s => s.toUpperCase(),
      _1381: s => s.trim(),
      _1382: s => s.trimLeft(),
      _1383: s => s.trimRight(),
      _1384: (string, times) => string.repeat(times),
      _1385: Function.prototype.call.bind(String.prototype.indexOf),
      _1386: (s, p, i) => s.lastIndexOf(p, i),
      _1387: (string, token) => string.split(token),
      _1388: Object.is,
      _1389: o => o instanceof Array,
      _1390: (a, i) => a.push(i),
      _1394: a => a.pop(),
      _1395: (a, i) => a.splice(i, 1),
      _1396: (a, s) => a.join(s),
      _1397: (a, s, e) => a.slice(s, e),
      _1399: (a, b) => a == b ? 0 : (a > b ? 1 : -1),
      _1400: a => a.length,
      _1402: (a, i) => a[i],
      _1403: (a, i, v) => a[i] = v,
      _1405: o => {
        if (o instanceof ArrayBuffer) return 0;
        if (globalThis.SharedArrayBuffer !== undefined &&
            o instanceof SharedArrayBuffer) {
          return 1;
        }
        return 2;
      },
      _1406: (o, offsetInBytes, lengthInBytes) => {
        var dst = new ArrayBuffer(lengthInBytes);
        new Uint8Array(dst).set(new Uint8Array(o, offsetInBytes, lengthInBytes));
        return new DataView(dst);
      },
      _1408: o => o instanceof Uint8Array,
      _1409: (o, start, length) => new Uint8Array(o.buffer, o.byteOffset + start, length),
      _1410: o => o instanceof Int8Array,
      _1411: (o, start, length) => new Int8Array(o.buffer, o.byteOffset + start, length),
      _1412: o => o instanceof Uint8ClampedArray,
      _1413: (o, start, length) => new Uint8ClampedArray(o.buffer, o.byteOffset + start, length),
      _1414: o => o instanceof Uint16Array,
      _1415: (o, start, length) => new Uint16Array(o.buffer, o.byteOffset + start, length),
      _1416: o => o instanceof Int16Array,
      _1417: (o, start, length) => new Int16Array(o.buffer, o.byteOffset + start, length),
      _1418: o => o instanceof Uint32Array,
      _1419: (o, start, length) => new Uint32Array(o.buffer, o.byteOffset + start, length),
      _1420: o => o instanceof Int32Array,
      _1421: (o, start, length) => new Int32Array(o.buffer, o.byteOffset + start, length),
      _1423: (o, start, length) => new BigInt64Array(o.buffer, o.byteOffset + start, length),
      _1424: o => o instanceof Float32Array,
      _1425: (o, start, length) => new Float32Array(o.buffer, o.byteOffset + start, length),
      _1426: o => o instanceof Float64Array,
      _1427: (o, start, length) => new Float64Array(o.buffer, o.byteOffset + start, length),
      _1428: (t, s) => t.set(s),
      _1429: l => new DataView(new ArrayBuffer(l)),
      _1430: (o) => new DataView(o.buffer, o.byteOffset, o.byteLength),
      _1432: o => o.buffer,
      _1433: o => o.byteOffset,
      _1434: Function.prototype.call.bind(Object.getOwnPropertyDescriptor(DataView.prototype, 'byteLength').get),
      _1435: (b, o) => new DataView(b, o),
      _1436: (b, o, l) => new DataView(b, o, l),
      _1437: Function.prototype.call.bind(DataView.prototype.getUint8),
      _1438: Function.prototype.call.bind(DataView.prototype.setUint8),
      _1439: Function.prototype.call.bind(DataView.prototype.getInt8),
      _1440: Function.prototype.call.bind(DataView.prototype.setInt8),
      _1441: Function.prototype.call.bind(DataView.prototype.getUint16),
      _1442: Function.prototype.call.bind(DataView.prototype.setUint16),
      _1443: Function.prototype.call.bind(DataView.prototype.getInt16),
      _1444: Function.prototype.call.bind(DataView.prototype.setInt16),
      _1445: Function.prototype.call.bind(DataView.prototype.getUint32),
      _1446: Function.prototype.call.bind(DataView.prototype.setUint32),
      _1447: Function.prototype.call.bind(DataView.prototype.getInt32),
      _1448: Function.prototype.call.bind(DataView.prototype.setInt32),
      _1451: Function.prototype.call.bind(DataView.prototype.getBigInt64),
      _1452: Function.prototype.call.bind(DataView.prototype.setBigInt64),
      _1453: Function.prototype.call.bind(DataView.prototype.getFloat32),
      _1454: Function.prototype.call.bind(DataView.prototype.setFloat32),
      _1455: Function.prototype.call.bind(DataView.prototype.getFloat64),
      _1456: Function.prototype.call.bind(DataView.prototype.setFloat64),
      _1469: (ms, c) =>
      setTimeout(() => dartInstance.exports.$invokeCallback(c),ms),
      _1470: (handle) => clearTimeout(handle),
      _1471: (ms, c) =>
      setInterval(() => dartInstance.exports.$invokeCallback(c), ms),
      _1472: (handle) => clearInterval(handle),
      _1473: (c) =>
      queueMicrotask(() => dartInstance.exports.$invokeCallback(c)),
      _1474: () => Date.now(),
      _1479: o => Object.keys(o),
      _1480: () => new AbortController(),
      _1481: x0 => x0.abort(),
      _1482: (x0,x1,x2,x3,x4,x5) => ({method: x0,headers: x1,body: x2,credentials: x3,redirect: x4,signal: x5}),
      _1483: (x0,x1) => globalThis.fetch(x0,x1),
      _1484: (x0,x1) => x0.get(x1),
      _1485: f => finalizeWrapper(f, function(x0,x1,x2) { return dartInstance.exports._1485(f,arguments.length,x0,x1,x2) }),
      _1486: (x0,x1) => x0.forEach(x1),
      _1487: x0 => x0.getReader(),
      _1488: x0 => x0.read(),
      _1489: x0 => x0.cancel(),
      _1493: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1493(f,arguments.length,x0) }),
      _1494: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1494(f,arguments.length,x0) }),
      _1499: x0 => x0.attachStreamToVideo,
      _1501: x0 => x0.decodeContinuously,
      _1505: x0 => x0.reset,
      _1507: x0 => x0.stopContinuousDecode,
      _1509: x0 => x0.stream,
      _1510: x0 => x0.videoElement,
      _1511: (x0,x1) => x0.key(x1),
      _1513: x0 => x0.facingMode,
      _1514: x0 => x0.getSettings(),
      _1515: (x0,x1) => ({width: x0,height: x1}),
      _1516: (x0,x1,x2) => ({width: x0,height: x1,facingMode: x2}),
      _1525: (s, m) => {
        try {
          return new RegExp(s, m);
        } catch (e) {
          return String(e);
        }
      },
      _1526: (x0,x1) => x0.exec(x1),
      _1527: (x0,x1) => x0.test(x1),
      _1528: x0 => x0.pop(),
      _1530: o => o === undefined,
      _1532: o => typeof o === 'function' && o[jsWrappedDartFunctionSymbol] === true,
      _1534: o => {
        const proto = Object.getPrototypeOf(o);
        return proto === Object.prototype || proto === null;
      },
      _1535: o => o instanceof RegExp,
      _1536: (l, r) => l === r,
      _1537: o => o,
      _1538: o => o,
      _1539: o => o,
      _1540: b => !!b,
      _1541: o => o.length,
      _1543: (o, i) => o[i],
      _1544: f => f.dartFunction,
      _1545: () => ({}),
      _1546: () => [],
      _1548: () => globalThis,
      _1549: (constructor, args) => {
        const factoryFunction = constructor.bind.apply(
            constructor, [null, ...args]);
        return new factoryFunction();
      },
      _1551: (o, p) => o[p],
      _1552: (o, p, v) => o[p] = v,
      _1553: (o, m, a) => o[m].apply(o, a),
      _1555: o => String(o),
      _1556: (p, s, f) => p.then(s, (e) => f(e, e === undefined)),
      _1557: o => {
        if (o === undefined) return 1;
        var type = typeof o;
        if (type === 'boolean') return 2;
        if (type === 'number') return 3;
        if (type === 'string') return 4;
        if (o instanceof Array) return 5;
        if (ArrayBuffer.isView(o)) {
          if (o instanceof Int8Array) return 6;
          if (o instanceof Uint8Array) return 7;
          if (o instanceof Uint8ClampedArray) return 8;
          if (o instanceof Int16Array) return 9;
          if (o instanceof Uint16Array) return 10;
          if (o instanceof Int32Array) return 11;
          if (o instanceof Uint32Array) return 12;
          if (o instanceof Float32Array) return 13;
          if (o instanceof Float64Array) return 14;
          if (o instanceof DataView) return 15;
        }
        if (o instanceof ArrayBuffer) return 16;
        // Feature check for `SharedArrayBuffer` before doing a type-check.
        if (globalThis.SharedArrayBuffer !== undefined &&
            o instanceof SharedArrayBuffer) {
            return 17;
        }
        return 18;
      },
      _1558: o => [o],
      _1559: (o0, o1) => [o0, o1],
      _1560: (o0, o1, o2) => [o0, o1, o2],
      _1561: (o0, o1, o2, o3) => [o0, o1, o2, o3],
      _1562: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI8ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      _1563: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI8ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      _1566: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI32ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      _1567: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI32ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      _1568: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmF32ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      _1569: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmF32ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      _1570: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmF64ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      _1571: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmF64ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      _1572: x0 => new ArrayBuffer(x0),
      _1573: s => {
        if (/[[\]{}()*+?.\\^$|]/.test(s)) {
            s = s.replace(/[[\]{}()*+?.\\^$|]/g, '\\$&');
        }
        return s;
      },
      _1575: x0 => x0.index,
      _1577: x0 => x0.flags,
      _1578: x0 => x0.multiline,
      _1579: x0 => x0.ignoreCase,
      _1580: x0 => x0.unicode,
      _1581: x0 => x0.dotAll,
      _1582: (x0,x1) => { x0.lastIndex = x1 },
      _1583: (o, p) => p in o,
      _1584: (o, p) => o[p],
      _1587: x0 => x0.random(),
      _1588: (x0,x1) => x0.getRandomValues(x1),
      _1589: () => globalThis.crypto,
      _1590: () => globalThis.Math,
      _1591: Function.prototype.call.bind(Number.prototype.toString),
      _1592: Function.prototype.call.bind(BigInt.prototype.toString),
      _1593: Function.prototype.call.bind(Number.prototype.toString),
      _1594: (d, digits) => d.toFixed(digits),
      _1598: () => globalThis.document,
      _1604: (x0,x1) => { x0.height = x1 },
      _1606: (x0,x1) => { x0.width = x1 },
      _1615: x0 => x0.style,
      _1618: x0 => x0.src,
      _1619: (x0,x1) => { x0.src = x1 },
      _1620: x0 => x0.naturalWidth,
      _1621: x0 => x0.naturalHeight,
      _1637: x0 => x0.status,
      _1638: (x0,x1) => { x0.responseType = x1 },
      _1640: x0 => x0.response,
      _1641: x0 => x0.x,
      _1642: x0 => x0.y,
      _1739: (x0,x1) => { x0.lang = x1 },
      _1768: x0 => x0.style,
      _1827: (x0,x1) => { x0.onerror = x1 },
      _1843: (x0,x1) => { x0.onload = x1 },
      _1867: (x0,x1) => { x0.onpause = x1 },
      _1869: (x0,x1) => { x0.onplay = x1 },
      _2340: x0 => x0.videoWidth,
      _2341: x0 => x0.videoHeight,
      _2388: x0 => x0.paused,
      _2403: (x0,x1) => { x0.controls = x1 },
      _3002: (x0,x1) => { x0.src = x1 },
      _3004: (x0,x1) => { x0.type = x1 },
      _3008: (x0,x1) => { x0.async = x1 },
      _3010: (x0,x1) => { x0.defer = x1 },
      _3012: (x0,x1) => { x0.crossOrigin = x1 },
      _3471: () => globalThis.window,
      _3511: x0 => x0.document,
      _3514: x0 => x0.location,
      _3533: x0 => x0.navigator,
      _3797: x0 => x0.localStorage,
      _3902: x0 => x0.geolocation,
      _3905: x0 => x0.mediaDevices,
      _3907: x0 => x0.permissions,
      _3908: x0 => x0.maxTouchPoints,
      _3911: x0 => x0.serviceWorker,
      _3918: x0 => x0.platform,
      _3921: x0 => x0.userAgent,
      _3927: x0 => x0.onLine,
      _4129: x0 => x0.length,
      _6070: x0 => x0.signal,
      _6126: x0 => x0.baseURI,
      _6143: () => globalThis.document,
      _6227: x0 => x0.head,
      _6557: (x0,x1) => { x0.id = x1 },
      _7903: x0 => x0.value,
      _7905: x0 => x0.done,
      _8199: x0 => x0.ready,
      _8607: x0 => x0.url,
      _8609: x0 => x0.status,
      _8611: x0 => x0.statusText,
      _8612: x0 => x0.headers,
      _8613: x0 => x0.body,
      _9000: x0 => x0.state,
      _9414: x0 => x0.label,
      _9436: x0 => x0.facingMode,
      _9650: x0 => x0.width,
      _9652: x0 => x0.height,
      _9658: x0 => x0.facingMode,
      _10313: x0 => x0.coords,
      _10314: x0 => x0.timestamp,
      _10316: x0 => x0.accuracy,
      _10317: x0 => x0.latitude,
      _10318: x0 => x0.longitude,
      _10319: x0 => x0.altitude,
      _10320: x0 => x0.altitudeAccuracy,
      _10321: x0 => x0.heading,
      _10322: x0 => x0.speed,
      _10323: x0 => x0.code,
      _10324: x0 => x0.message,
      _11174: (x0,x1) => { x0.height = x1 },
      _11368: (x0,x1) => { x0.objectFit = x1 },
      _11498: (x0,x1) => { x0.pointerEvents = x1 },
      _11796: (x0,x1) => { x0.transform = x1 },
      _11800: (x0,x1) => { x0.transformOrigin = x1 },
      _11864: (x0,x1) => { x0.width = x1 },
      _12232: x0 => x0.name,
      _12977: x0 => x0.message,

    };

    const baseImports = {
      dart2wasm: dart2wasm,
      Math: Math,
      Date: Date,
      Object: Object,
      Array: Array,
      Reflect: Reflect,
      S: new Proxy({}, { get(_, prop) { return prop; } }),

    };

    const jsStringPolyfill = {
      "charCodeAt": (s, i) => s.charCodeAt(i),
      "compare": (s1, s2) => {
        if (s1 < s2) return -1;
        if (s1 > s2) return 1;
        return 0;
      },
      "concat": (s1, s2) => s1 + s2,
      "equals": (s1, s2) => s1 === s2,
      "fromCharCode": (i) => String.fromCharCode(i),
      "length": (s) => s.length,
      "substring": (s, a, b) => s.substring(a, b),
      "fromCharCodeArray": (a, start, end) => {
        if (end <= start) return '';

        const read = dartInstance.exports.$wasmI16ArrayGet;
        let result = '';
        let index = start;
        const chunkLength = Math.min(end - index, 500);
        let array = new Array(chunkLength);
        while (index < end) {
          const newChunkLength = Math.min(end - index, 500);
          for (let i = 0; i < newChunkLength; i++) {
            array[i] = read(a, index++);
          }
          if (newChunkLength < chunkLength) {
            array = array.slice(0, newChunkLength);
          }
          result += String.fromCharCode(...array);
        }
        return result;
      },
      "intoCharCodeArray": (s, a, start) => {
        if (s === '') return 0;

        const write = dartInstance.exports.$wasmI16ArraySet;
        for (var i = 0; i < s.length; ++i) {
          write(a, start++, s.charCodeAt(i));
        }
        return s.length;
      },
      "test": (s) => typeof s == "string",
    };


    

    dartInstance = await WebAssembly.instantiate(this.module, {
      ...baseImports,
      ...additionalImports,
      
      "wasm:js-string": jsStringPolyfill,
    });

    return new InstantiatedApp(this, dartInstance);
  }
}

class InstantiatedApp {
  constructor(compiledApp, instantiatedModule) {
    this.compiledApp = compiledApp;
    this.instantiatedModule = instantiatedModule;
  }

  // Call the main function with the given arguments.
  invokeMain(...args) {
    this.instantiatedModule.exports.$invokeMain(args);
  }
}
