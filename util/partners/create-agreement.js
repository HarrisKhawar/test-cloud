const { PDFDocument } = require("pdf-lib");
const fs = require("fs");
const admin = require("firebase-admin");
const fetch = require("node-fetch");

const createAgreement = (partner, signature) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Get Path static path to /assets/docs/vehicle-rental-agreement.pdf
      const path = `${__dirname}/../../assets/docs/partner-agreement.pdf`;

      const buffer = await fs.readFileSync(path);
      const pdfDoc = await PDFDocument.load(buffer);

      // Add Partner Information to Template
      addPartnerInfo(pdfDoc, partner);

      if (signature) {
        // Fetch Image from URL as blob
        const image = await fetch(signature);
        const base64Img = (await image.buffer()).toString("base64");

        // Add Signature to PDF
        await addSignature(pdfDoc, base64Img);
      }

      // Add Date to all pages
      addDateToAllPages(pdfDoc);

      // Convert PDF to Buffer
      const base64PdfUri = await pdfDoc.saveAsBase64({ dataUri: true });
      const pdfBuffer = Buffer.from(base64PdfUri.split(",")[1], "base64");

      // Upload PDF to Firebase Storage
      const bucket = admin.storage().bucket();
      const file = bucket.file(`partners/${partner.id}/partner-agreement.pdf`);
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
 ** Add Booking Information to PDF
 **---------------------------------------------
 * @param {PDFDocument} pdfDoc PDF Document
 * @param {Object} partner Partner Object: {
}
*/
const addPartnerInfo = (pdfDoc, partner) => {
  const pages = pdfDoc.getPages();
  const lastPage = pages[pages.length - 1];
  const { width, height } = lastPage.getSize();

  // ==================================================== Customer Information
  y = height - 324;

  lastPage.drawText(`${partner?.name}`, {
    x: 150,
    y: y,
    size: 11,
  });
  y = y - 21;

  lastPage.drawText(partner?.dob || "-", {
    x: 150,
    y: y,
    size: 11,
  });
  y = y - 21;
  lastPage.drawText(partner?.email || "-", {
    x: 150,
    y: y,
    size: 11,
  });
  y = y - 21;
  lastPage.drawText(partner?.phone || "-", {
    x: 150,
    y: y,
    size: 11,
  });
  y = y - 21;
  lastPage.drawText(partner?.address || "-", {
    x: 150,
    y: y,
    size: 11,
  });
};

/**
 **---------------------------------------------
 ** Add Dates to all PDF Pages
 **---------------------------------------------
 */

const addDateToAllPages = (pdfDoc) => {
  // Get Current Date String
  const date = new Date();
  const dateString = `${
    date.getMonth() + 1
  }/${date.getDate()}/${date.getFullYear()}`;

  // Get Pages
  const pages = pdfDoc.getPages();
  const { width, height } = pages[0].getSize();

  // Add Date to each page
  pages.forEach((page) => {
    page.drawText(dateString, {
      x: width - 135,
      y: height - 50,
      size: 10,
    });
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

      // Get Current Date String
      const date = new Date();
      const dateString = `${
        date.getMonth() + 1
      }/${date.getDate()}/${date.getFullYear()}`;

      // Draw the PNG image in the signature field
      const pngImage = await pdfDoc.embedPng(signature);
      lastPage.drawImage(pngImage, {
        x: 58,
        y: height - 550,
        width: 120,
        height: 42,
      });

      // Add Date
      lastPage.drawText(dateString, {
        x: width - 134,
        y: height - 552,
        size: 12,
      });
      resolve();
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = { createAgreement };
