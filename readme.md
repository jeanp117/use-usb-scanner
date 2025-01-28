# use-usb-scanner

A React hook for working with USB scanners via the Web Serial API. Easily connect, disconnect, and manage USB scanners in your app, with full support for parsing data (e.g., barcodes, ID cards) using a custom parser function.

## Installation

You can install the hook via npm or yarn:

### Using npm:

bash
Copiar

```bash
npm install use-usb-scanner
```

### Using yarn:

```bash
yarn add use-usb-scanner
```

## Usage

Here is an example of how to use useUsbScanner to connect to a USB scanner, automatically reconnect on page reload, and parse data (like a Colombian ID card (Cédula)):

### Example Usage:

```javascript
import "./App.css";
import { useUsbScanner } from "use-usb-scanner";
import { parsearCedulaColombiana } from "./parseCedulaColombiana";

function App() {
    const { connectToPort, disconnectPort, status, parsedData, error, savedPortInfo } = useUsbScanner({
        serial: {
            baudRate: 9600, // You can adjust the baudRate as needed
        },
        filter: {
            usbVendorId: 1659, // Optionally filter by Vendor ID
            usbProductId: 8963, // Optionally filter by Product ID
        },
        parser: parsearCedulaColombiana, // Your custom parser function
    });

    return (
        <>
            <div>
                <pre>{JSON.stringify({ status, parsedData, error, savedPortInfo }, null, 2)}</pre>
                <button onClick={() => (status === "connected" ? disconnectPort() : connectToPort())}>
                    {status === "connected" ? "Disconnect" : "Connect"}
                </button>
            </div>
        </>
    );
}

export default App;
```

### Explanation:

-   **_status_**: The current connection status of the USB scanner (e.g., disconnected, connecting, or connected).
-   **_parsedData_**: The data parsed from the scanner, based on your custom parser function (in this case, parsearCedulaColombiana). `{rawData:string}` if parser not provided.
-   **_error_**: Any errors encountered during connection or data parsing.
-   **_savedPortInfo_**: Information about the connected USB device, such as the port name.

### Key Features:

-   **Automatic Reconnection**: When the page is reloaded, the hook will attempt to automatically reconnect to the previously connected device.
-   **Device Filtering**: Optionally filter devices by usbVendorId and usbProductId. These values can be obtained by connecting the device once, but are not strictly required.
-   **Custom Parser**: The hook allows you to define a custom parser function to handle the raw data sent by the USB scanner. This is useful for parsing barcodes, ID cards, PDF417, etc.

## Custom Parser Function

You can define your own parser function to interpret the raw data received from the USB scanner. Here’s an example of how to parse a Colombian ID card (Cédula):

### Example Parser (Colombian ID card):

```javascript
export function parsearCedulaColombiana(rawData: string) {
    // Align the string if necessary
    const pubDskIndex = rawData.indexOf("PubDSK_1");
    if (pubDskIndex !== -1) {
        const leadingSpaces = 25 - pubDskIndex; // Calculate how many leading spaces are needed
        if (leadingSpaces > 0) {
            rawData = " ".repeat(leadingSpaces) + rawData; // Add leading spaces
        }
    } else {
        throw new Error("Invalid Colombian ID card");
    }

    // Clean up the data by removing invalid characters and null spaces
    const cleanedData = rawData
        .replace(/\u0000/g, " ") // Replace null characters with spaces
        .replace(/[^a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑçÇ+-]/g, ""); // Remove non-alphanumeric characters

    // Extract relevant fields from the ID card
    const afisCode = cleanedData.substring(2, 10).trim();
    const fingerCard = cleanedData.substring(40, 48).trim();
    const documentNumber = cleanedData.substring(48, 58).trim();
    const lastName = cleanedData.substring(58, 80).trim();
    const secondLastName = cleanedData.substring(81, 104).trim();
    const firstName = cleanedData.substring(104, 127).trim();
    const middleName = cleanedData.substring(127, 150).trim();
    const gender = cleanedData.substring(151, 152).trim();

    // Extract and format birthdate
    const birthdayYear = cleanedData.substring(152, 156).trim();
    const birthdayMonth = cleanedData.substring(156, 158).trim();
    const birthdayDay = cleanedData.substring(158, 160).trim();
    const birthday = `${birthdayYear}/${birthdayMonth}/${birthdayDay}`;

    // Extract municipality code, department code, and blood type
    const municipalityCode = cleanedData.substring(160, 162).trim();
    const departmentCode = cleanedData.substring(162, 165).trim();
    const bloodType = cleanedData.substring(166, 168).trim();

    // Return the parsed data as an object
    return {
        afisCode,
        fingerCard,
        documentNumber: parseInt(documentNumber) + "",
        lastName,
        secondLastName,
        firstName,
        middleName,
        gender,
        birthday,
        municipalityCode,
        departmentCode,
        bloodType,
    };
}
```

This parser function is just an example; you can write similar functions to handle different types of data, such as barcodes or PDF417.

## Web Serial API

This hook leverages the Web Serial API, which is supported in modern browsers like Chrome and Edge. The Web Serial API allows web applications to communicate with serial devices like USB scanners directly from the browser, without requiring additional plugins or software.

## How It Works:

The hook requests access to the USB device using the Web Serial API.
After successful connection, it reads raw data from the device and passes it through a custom parser function.
The parsed data is returned to your app for display or further processing.

## Notes

The filter options (usbVendorId and usbProductId) are optional but can help ensure automatic connection to the correct device.
The hook tries to automatically reconnect to the scanner when the page is reloaded, as long as the browser supports the Web Serial API and LocalStorage API
