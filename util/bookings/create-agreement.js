const { PDFDocument } = require("pdf-lib");
const fs = require("fs");
const admin = require("firebase-admin");
const fetch = require("node-fetch");

const createAgreement = (booking, customer, vehicle) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Get Path static path to /assets/docs/vehicle-rental-agreement.pdf
      const path = `${__dirname}/../../assets/docs/vehicle-rental-agreement.pdf`;

      const buffer = await fs.readFileSync(path);
      const pdfDoc = await PDFDocument.load(buffer);

      // Add Booking Information to Template
      addBookingInfo(pdfDoc, booking, customer, vehicle);

      if (customer.signature) {
        // Fetch Image from URL as blob
        const image = await fetch(customer.signature);
        const base64Img = (await image.buffer()).toString("base64");

        // Add Signature to PDF
        await addSignature(pdfDoc, base64Img);
      }

      // Add Date to all pages
      addDateToAllPages(pdfDoc, booking);

      // Convert PDF to Buffer
      const base64PdfUri = await pdfDoc.saveAsBase64({ dataUri: true });
      const pdfBuffer = Buffer.from(base64PdfUri.split(",")[1], "base64");

      // Upload PDF to Firebase Storage
      const bucket = admin.storage().bucket();
      const file = bucket.file(`bookings/${booking.id}/rental-agreement.pdf`);
      await file.save(pdfBuffer, {
        metadata: {
          contentType: "application/pdf",
        },
      });

      // Get Download URL
      const downloadURL = await file.getSignedUrl({
        action: "read",
        expires: "03-09-2030",
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
 * @param {Object} booking Booking Object: {
    start_date: string,
    end_date: string,
    pick_up_location: string,
    drop_off_location: string,
    start_mileage: string,
    start_fuel: string,
    miles_included: string,
    price.total: string,
 }
 * @param {Object} customer Customer Object: {
    firstName: string,
    lastName: string,
    email: string,
    phone: string,
    address: string,
    drivers_license_number: string,
    dob: string,
 }
 * @param {Object} vehicle Vehicle Object: {
    make: string,
    model: string,
    year: string,
    vin: string,
    license: string,
 }
*/
const addBookingInfo = (pdfDoc, booking, customer, vehicle) => {
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];
  const { width, height } = firstPage.getSize();

  // Get Booking Start And End Date Strings
  const startDate = `${
    booking.start_date.getMonth() + 1
  }/${booking.start_date.getDate()}/${booking.start_date.getFullYear()} ${booking.start_date.getHours()}:${booking.start_date.getMinutes()}`;
  const endDate = `${
    booking.end_date.getMonth() + 1
  }/${booking.end_date.getDate()}/${booking.end_date.getFullYear()} ${booking.end_date.getHours()}:${booking.end_date.getMinutes()}`;

  // ==================================================== Customer Information
  // Add Customer Name
  firstPage.drawText(`${customer?.firstName} ${customer?.lastName}`, {
    x: 112,
    y: height - 304,
    size: 12,
  });

  // Add Customer Date of birth
  firstPage.drawText(customer?.dob || "-", {
    x: 414,
    y: height - 304,
    size: 12,
  });

  // Add Customer Drivers License
  firstPage.drawText(customer?.drivers_license_number || "-", {
    x: 184,
    y: height - 324,
    size: 12,
  });

  // Add Customer Phone
  firstPage.drawText(customer?.phone || "-", {
    x: 420,
    y: height - 324,
    size: 12,
  });

  // Add Customer Home Address
  firstPage.drawText(
    typeof customer?.address === "string" ? customer.address : "-",
    {
      x: 134,
      y: height - 344,
      size: 12,
    }
  );

  // ==================================================== Vehicle Information
  // Add Vehicle Make
  firstPage.drawText(vehicle?.make, {
    x: 88,
    y: height - 407,
    size: 12,
  });

  // Add Vehicle Start Mileage
  firstPage.drawText(booking?.start_mileage || "-", {
    x: 426,
    y: height - 407,
    size: 12,
  });

  // Add Vehicle Model
  firstPage.drawText(`${vehicle?.model} ${vehicle?.year}`, {
    x: 124,
    y: height - 428,
    size: 12,
  });

  // Add Vehicle Start Fuel
  firstPage.drawText(
    booking.start_fuel
      ? `${booking.start_fuel === "0" ? "< 25%" : `> ${booking.start_fuel}%`}`
      : "> 90%",
    {
      x: 442,
      y: height - 428,
      size: 12,
    }
  );

  // Add Vehicle License
  firstPage.drawText(vehicle?.license, {
    x: 168,
    y: height - 449,
    size: 12,
  });

  // Add Vehicle VIN
  firstPage.drawText(vehicle?.vin, {
    x: 338,
    y: height - 449,
    size: 12,
  });

  // ==================================================== Booking Information
  // Add Booking Start Date
  firstPage.drawText(startDate, {
    x: 148,
    y: height - 511,
    size: 12,
  });

  // Add Booking End Date
  firstPage.drawText(endDate, {
    x: 362,
    y: height - 511,
    size: 12,
  });

  // Add Booking Pick Up Location
  firstPage.drawText(booking?.pick_up_location, {
    x: 148,
    y: height - 532,
    size: 12,
  });

  // Add Booking Drop Off Location
  firstPage.drawText(booking?.drop_off_location, {
    x: 148,
    y: height - 552,
    size: 12,
  });

  // ==================================================== Price Information
  // Add Total Fee
  firstPage.drawText(`$${booking?.price?.total}`, {
    x: 108,
    y: height - 614,
    size: 12,
  });

  // Add Miles Included
  firstPage.drawText(booking?.miles_included || "800", {
    x: 352,
    y: height - 614,
    size: 12,
  });

  // Add Excess Mileage Rate
  firstPage.drawText(`$${booking?.mileage_rate || "0.35"}/mile`, {
    x: 162,
    y: height - 635,
    size: 12,
  });

  // Add Booking Id
  firstPage.drawText(booking?.id, {
    x: 338,
    y: height - 635,
    size: 12,
  });
};

/**
 **---------------------------------------------
 ** Add Dates to all PDF Pages
 **---------------------------------------------
 */

const addDateToAllPages = (pdfDoc, booking) => {
  // Get Current Date String
  let date;
  if (booking.start_date < new Date()) {
    date = booking.start_date;
  } else {
    date = new Date();
  }
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
      y: height - 63,
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
        y: height - 660,
        width: 132,
        height: 52,
      });

      // Add Date
      lastPage.drawText(dateString, {
        x: width - 134,
        y: height - 656,
        size: 10,
      });
      resolve();
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = { createAgreement };
