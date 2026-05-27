/**
 * Must be called once at app startup before any QR scanning features are used.
 * Warms up the zxing-wasm engine to avoid delay on first scan.
 * @example
 * // In your app's main.tsx:
 * import { prepareZXingModule } from "@openlguid/ui/features/verification/initializer"
 * void prepareZXingModule()
 */
export { prepareZXingModule } from "@yudiel/react-qr-scanner"