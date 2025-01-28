var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { useState, useEffect, useRef } from "react";
var isSerialSupported = typeof navigator !== "undefined" && "serial" in navigator;
function useUsbScanner(options) {
    var _this = this;
    var _a = useState("disconnected"), status = _a[0], setStatus = _a[1];
    var _b = useState(null), parsedData = _b[0], setParsedData = _b[1];
    var _c = useState(""), error = _c[0], setError = _c[1];
    var portRef = useRef(null);
    var readerRef = useRef(null);
    var _d = useState(typeof window !== "undefined"
        ? localStorage.getItem("serialPortInfo")
            ? JSON.parse(localStorage.getItem("serialPortInfo") || "")
            : null
        : null), savedPortInfo = _d[0], setSavedPortInfo = _d[1];
    // Connect to the serial port
    var connectToPort = function () { return __awaiter(_this, void 0, void 0, function () {
        var selectedPort, allPorts, previousPortInfo_1, filters;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!isSerialSupported) {
                        alert("Web Serial API not available.");
                        return [2 /*return*/];
                    }
                    if (status === "connecting" || status === "connected") {
                        console.log("Already connecting or connected.");
                        return [2 /*return*/];
                    }
                    setStatus("connecting"); // Change status to "connecting"
                    if (!savedPortInfo) return [3 /*break*/, 2];
                    return [4 /*yield*/, navigator.serial.getPorts()];
                case 1:
                    allPorts = _c.sent();
                    previousPortInfo_1 = savedPortInfo;
                    selectedPort = allPorts.find(function (port) {
                        var info = port.getInfo();
                        return (info.usbVendorId === previousPortInfo_1.usbVendorId &&
                            info.usbProductId === previousPortInfo_1.usbProductId);
                    });
                    return [3 /*break*/, 5];
                case 2:
                    filters = (options === null || options === void 0 ? void 0 : options.filter)
                        ? [
                            {
                                usbVendorId: (_a = options.filter) === null || _a === void 0 ? void 0 : _a.usbVendorId,
                                usbProductId: (_b = options.filter) === null || _b === void 0 ? void 0 : _b.usbProductId,
                            },
                        ]
                        : [];
                    return [4 /*yield*/, navigator.serial.requestPort({ filters: filters })];
                case 3:
                    // Request the port with the specified filter
                    selectedPort = _c.sent();
                    if (!!selectedPort) return [3 /*break*/, 5];
                    return [4 /*yield*/, navigator.serial.requestPort()];
                case 4:
                    // If no filtered port is found, request any port
                    selectedPort = _c.sent();
                    _c.label = 5;
                case 5:
                    if (!selectedPort) {
                        console.error("No port selected");
                        setStatus("disconnected");
                        return [2 /*return*/];
                    }
                    // Open the port
                    return [4 /*yield*/, openPort(selectedPort).then(function () {
                            var portInfo = selectedPort.getInfo();
                            console.log("Connected to serial port:", portInfo);
                            localStorage.setItem("serialPortInfo", JSON.stringify(portInfo));
                            setSavedPortInfo(portInfo);
                            readDataFromPort(selectedPort);
                        })];
                case 6:
                    // Open the port
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    var clearSavedPort = function () {
        localStorage.removeItem("serialPortInfo");
        setSavedPortInfo(null);
    };
    // Handle port opening in a controlled manner
    var openPort = function (port) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (["connected", "connecting"].includes(status)) {
                console.log("Already connecting or connected.");
                return [2 /*return*/];
            }
            setStatus("connecting");
            return [2 /*return*/, port
                    .open({ baudRate: (options === null || options === void 0 ? void 0 : options.serial.baudRate) || 9600 })
                    .then(function () {
                    console.log("Port opened successfully");
                    setStatus("connected");
                    setError("");
                    portRef.current = port;
                })
                    .catch(function (err) {
                    console.error("Error opening port:", err.message);
                    setError(err.message);
                    setStatus("error");
                })];
        });
    }); };
    // Read data from the port
    var readDataFromPort = function (port) { return __awaiter(_this, void 0, void 0, function () {
        var reader, decoder, buffer, _a, value, done, lines, err_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    reader = port.readable.getReader();
                    readerRef.current = reader;
                    decoder = (options === null || options === void 0 ? void 0 : options.textDecoder) || new TextDecoder("latin1");
                    buffer = "";
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 5, , 6]);
                    _b.label = 2;
                case 2:
                    if (!true) return [3 /*break*/, 4];
                    return [4 /*yield*/, reader.read()];
                case 3:
                    _a = _b.sent(), value = _a.value, done = _a.done;
                    if (done)
                        return [3 /*break*/, 4];
                    buffer += decoder.decode(value);
                    lines = buffer === null || buffer === void 0 ? void 0 : buffer.split("\r\n");
                    buffer = lines.pop() || "";
                    lines.forEach(function (line) {
                        console.log("Raw data:", line);
                        setParsedData((options === null || options === void 0 ? void 0 : options.parser) ? options.parser(line) : { rawData: line } // Default parser just returns the raw data
                        ); // Update state with parsed data
                    });
                    return [3 /*break*/, 2];
                case 4: return [3 /*break*/, 6];
                case 5:
                    err_1 = _b.sent();
                    console.error(err_1.message);
                    setError("Error reading data: " + err_1.message);
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    // Disconnect the port
    var disconnectPort = function () { return __awaiter(_this, void 0, void 0, function () {
        var err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("Disconnecting port...");
                    if (!portRef.current) return [3 /*break*/, 6];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, , 6]);
                    if (!readerRef.current) return [3 /*break*/, 3];
                    return [4 /*yield*/, readerRef.current.cancel()];
                case 2:
                    _a.sent();
                    readerRef.current = null;
                    _a.label = 3;
                case 3:
                    setStatus("disconnecting");
                    return [4 /*yield*/, portRef.current.close()];
                case 4:
                    _a.sent();
                    portRef.current = null;
                    setStatus("disconnected"); // Change status to "disconnected"
                    clearSavedPort();
                    console.log("Port disconnected.");
                    return [3 /*break*/, 6];
                case 5:
                    err_2 = _a.sent();
                    console.error("Error disconnecting port:", err_2.message);
                    setError(err_2.message);
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    useEffect(function () {
        // Attempt to automatically reconnect only once on mount
        if (savedPortInfo) {
            connectToPort();
        }
    }, []);
    return {
        connectToPort: connectToPort,
        disconnectPort: disconnectPort,
        status: status,
        parsedData: parsedData,
        error: error,
        savedPortInfo: savedPortInfo,
        clearSavedPort: clearSavedPort,
        resetData: function () { return setParsedData(null); },
    };
}
export default useUsbScanner;
