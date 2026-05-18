import QRCode from "qrcode";


export async function buildQrFromString(str: string){

    const qrImage = await QRCode.toDataURL(str, {
        errorCorrectionLevel: "L",
        margin: 1,
        width: 500,
        });

    return qrImage;
}