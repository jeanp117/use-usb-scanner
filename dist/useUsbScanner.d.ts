declare function useUsbScanner(options?: {
    serial: {
        baudRate: number;
    };
    textDecoder?: TextDecoder;
    parser?: (data: string) => any;
    filter?: {
        usbVendorId?: number;
        usbProductId?: number;
    };
}): {
    connectToPort: () => Promise<void>;
    disconnectPort: () => Promise<void>;
    status: "connected" | "connecting" | "error" | "disconnected" | "disconnecting";
    parsedData: any;
    error: string;
    savedPortInfo: any;
    clearSavedPort: () => void;
    resetData: () => void;
};
export default useUsbScanner;
//# sourceMappingURL=useUsbScanner.d.ts.map