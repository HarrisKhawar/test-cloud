const { PDFDocument } = require("pdf-lib");
const fs = require("fs");
const admin = require("firebase-admin");
const fetch = require("node-fetch");

const createPOA = (partner, vehicle, signature) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Get Path static path to /assets/docs/partner-agreement.pdf
      const path = `${__dirname}/../../assets/docs/power-of-attorney.pdf`;

      const buffer = await fs.readFileSync(path);
      const pdfDoc = await PDFDocument.load(buffer);

      // Add Partner Information to Template
      addInformation(pdfDoc, partner, vehicle);

      if (signature) {
        // Fetch Image from URL as blob
        const image = await fetch(signature);
        const base64Img = (await image.buffer()).toString("base64");

        // Add Signature to PDF
        await addSignature(pdfDoc, base64Img);
      }

      // Convert PDF to Buffer
      const base64PdfUri = await pdfDoc.saveAsBase64({ dataUri: true });
      const pdfBuffer = Buffer.from(base64PdfUri.split(",")[1], "base64");

      // Upload PDF to Firebase Storage
      const bucket = admin.storage().bucket();
      const file = bucket.file(`partners/${partner.id}/vehicles/${vehicle.vin}/poa.pdf`);
      await file.save(pdfBuffer, {
        metadata: {
          contentType: "application/pdf",
        },
      });

      // Get Download URL
      const downloadURL = await file.getSignedUrl({
        action: "read",
        expires: "03-09-2027",
      });

      // Return Download URL
      resolve(downloadURL[0]);
    } catch (err) {
      console.log(err);
      reject("Could not generate Agreement PDF: " + err.message);
    }
  });
};

/**
 **--------------------------------------------- 
 ** Add Information to PDF
 **---------------------------------------------
 * @param {PDFDocument} pdfDoc PDF Document
 * @param {Object} partner Partner Object: {
*/
const addInformation = (pdfDoc, partner, vehicle) => {
  const pages = pdfDoc.getPages();
  const lastPage = pages[pages.length - 1];
  const { width, height } = lastPage.getSize();

  // ==================================================== Customer Information
  y = height - 140;
  lastPage.drawText(`${new Date().toLocaleDateString()}`, {
    x: 170,
    y: y + 20,
    size: 11,
  });
  lastPage.drawText(`${partner?.name}`, {
    x: 215,
    y: y,
    size: 11,
  });
  y = y - 25;
  lastPage.drawText(`POSHIT Inc.`, {
    x: 280,
    y: y,
    size: 11,
  });
  y = y - 45;
  lastPage.drawText(`${vehicle.year}`, {
    x: 180,
    y: y,
    size: 11,
  });
  lastPage.drawText(`${vehicle.make}`, {
    x: 360,
    y: y,
    size: 11,
  });
  y = y - 25;
  lastPage.drawText(`${vehicle.vin}`, {
    x: 320,
    y: y,
    size: 11,
  });

  y = y - 20;
  lastPage.drawText(`${partner.name}`, {
    x: 160,
    y: y,
    size: 10,
  });
  lastPage.drawText(`${new Date().toLocaleDateString()}`, {
    x: 415,
    y: y,
    size: 10,
  });
  y = y - 68;
  lastPage.drawText(`${partner.address}`, {
    x: 160,
    y: y,
    size: 10,
  });
};


/**
 **---------------------------------------------
 ** Add Signature to last PDF Page
 * @param {PDFDocument} pdfDoc PDF Document
 * @param {String} signature Signature
 **---------------------------------------------
 */

const addSignature = (pdfDoc, signature) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!signature) throw new Error("No Signature Provided");
      const pages = pdfDoc.getPages();
      const lastPage = pages[pages.length - 1];
      const { width, height } = lastPage.getSize();

      // Draw the PNG image in the signature field
      const pngImage = await pdfDoc.embedPng(signature);
      lastPage.drawImage(pngImage, {
        x: 315,
        y: height - 255,
        width: 72,
        height: 14,
      });

      resolve();
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = { createPOA };
