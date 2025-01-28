import { useState, useEffect, useRef } from "react";

const isSerialSupported = typeof navigator !== "undefined" && "serial" in navigator;

function useUsbScanner(options?: {
    serial: {
        baudRate: number;
    };
    textDecoder?: TextDecoder;
    parser?: (data: string) => any;
    filter?: {
        usbVendorId?: number;
        usbProductId?: number;
    };
}) {
    const [status, setStatus] = useState<"connected" | "connecting" | "error" | "disconnected" | "disconnecting">(
        "disconnected"
    );
    const [parsedData, setParsedData] = useState<any>(null);
    const [error, setError] = useState("");
    const portRef = useRef<any>(null);
    const readerRef = useRef<any>(null);
    const [savedPortInfo, setSavedPortInfo] = useState<any>(
        typeof window !== "undefined"
            ? localStorage.getItem("serialPortInfo")
                ? JSON.parse(localStorage.getItem("serialPortInfo") || "")
                : null
            : null
    );
    // Connect to the serial port
    const connectToPort = async () => {
        if (!isSerialSupported) {
            alert("Web Serial API not available.");
            return;
        }

        if (status === "connecting" || status === "connected") {
            console.log("Already connecting or connected.");
            return;
        }

        setStatus("connecting"); // Change status to "connecting"

        let selectedPort;

        // If there is a saved port, try to connect to it
        if (savedPortInfo) {
            const allPorts = await (navigator as any).serial.getPorts();
            const previousPortInfo = savedPortInfo;

            selectedPort = allPorts.find((port: any) => {
                const info = port.getInfo();
                return (
                    info.usbVendorId === previousPortInfo.usbVendorId &&
                    info.usbProductId === previousPortInfo.usbProductId
                );
            });
        } else {
            const filters = options?.filter
                ? [
                      {
                          usbVendorId: options.filter?.usbVendorId,
                          usbProductId: options.filter?.usbProductId,
                      },
                  ]
                : [];

            // Request the port with the specified filter
            selectedPort = await (navigator as any).serial.requestPort({ filters });

            if (!selectedPort) {
                // If no filtered port is found, request any port
                selectedPort = await (navigator as any).serial.requestPort();
            }
        }

        if (!selectedPort) {
            console.error("No port selected");
            setStatus("disconnected");
            return;
        }

        // Open the port
        await openPort(selectedPort).then(() => {
            const portInfo = selectedPort.getInfo();
            console.log("Connected to serial port:", portInfo);
            localStorage.setItem("serialPortInfo", JSON.stringify(portInfo));
            setSavedPortInfo(portInfo);
            readDataFromPort(selectedPort);
        });
    };

    const clearSavedPort = () => {
        localStorage.removeItem("serialPortInfo");
        setSavedPortInfo(null);
    };

    // Handle port opening in a controlled manner
    const openPort = async (port: any) => {
        if (["connected", "connecting"].includes(status)) {
            console.log("Already connecting or connected.");
            return;
        }

        setStatus("connecting");
        return port
            .open({ baudRate: options?.serial.baudRate || 9600 })
            .then(() => {
                console.log("Port opened successfully");
                setStatus("connected");
                setError("");
                portRef.current = port;
            })
            .catch((err: any) => {
                console.error("Error opening port:", err.message);
                setError(err.message);
                setStatus("error");
            });
    };

    // Read data from the port
    const readDataFromPort = async (port: any) => {
        const reader = port.readable.getReader();
        readerRef.current = reader;
        const decoder = options?.textDecoder || new TextDecoder("latin1");
        let buffer = "";

        try {
            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value);

                // Process complete lines
                const lines = buffer?.split("\r\n");
                buffer = lines.pop() || "";

                lines.forEach((line) => {
                    console.log("Raw data:", line);
                    setParsedData(
                        options?.parser ? options.parser(line) : { rawData: line } // Default parser just returns the raw data
                    ); // Update state with parsed data
                });
            }
        } catch (err: any) {
            console.error(err.message);
            setError("Error reading data: " + err.message);
        }
    };

    // Disconnect the port
    const disconnectPort = async () => {
        console.log("Disconnecting port...");
        if (portRef.current) {
            try {
                if (readerRef.current) {
                    await readerRef.current.cancel();
                    readerRef.current = null;
                }

                setStatus("disconnecting");
                await portRef.current.close();
                portRef.current = null;
                setStatus("disconnected"); // Change status to "disconnected"
                clearSavedPort();
                console.log("Port disconnected.");
            } catch (err: any) {
                console.error("Error disconnecting port:", err.message);
                setError(err.message);
            }
        }
    };

    useEffect(() => {
        // Attempt to automatically reconnect only once on mount
        if (savedPortInfo) {
            connectToPort();
        }
    }, []);

    return {
        connectToPort,
        disconnectPort,
        status,
        parsedData,
        error,
        savedPortInfo,
        clearSavedPort,
        resetData: () => setParsedData(null),
    };
}

export default useUsbScanner;
