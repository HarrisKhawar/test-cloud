const { jsPDF } = require("jspdf");
const fs = require("fs");
const admin = require("firebase-admin");

const generateReceipt = (invoice, customer) => {
  return new Promise(async (resolve, reject) => {
    try {
      const path = `${__dirname}/../../assets/img/posh-logo-cropped.png`;
      const image = fs.readFileSync(path);
      const fileUri = `data:image/png;base64,${image.toString("base64")}`;
      const doc = new jsPDF();

      const date_created = invoice.date_created.toDate();
      const date_created_string = `${
        date_created.getMonth() + 1
      }/${date_created.getDate()}/${date_created.getFullYear()}`;

      const due_date = invoice.due_date.toDate();
      const due_date_string = `${
        due_date.getMonth() + 1
      }/${due_date.getDate()}/${due_date.getFullYear()}`;

      if (invoice.booking) {
        const booking_start_date = invoice.booking.start_date.toDate();
        const boooking_start_date_string = `${
          booking_start_date.getMonth() + 1
        }/${booking_start_date.getDate()}/${booking_start_date.getFullYear()}`;
        const booking_end_date = invoice.booking.end_date.toDate();
        const booking_end_date_string = `${
          booking_end_date.getMonth() + 1
        }/${booking_end_date.getDate()}/${booking_end_date.getFullYear()}`;
      }

      // ============ Header ============
      doc.addImage(fileUri, "png", 12, 8, 36, 12);

      // ============ Receipt Date ============
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor("#000");
      doc.text(`Date: ${date_created_string}`, 168, 16);

      // ============ Title ============
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor("#000");
      doc.text("Invoice", 18, 36);
      doc.setFontSize(10);
      doc.setTextColor(122, 121, 121);
      doc.setFont("Helvetica", "normal");
      doc.text(`Reference ID: ${invoice.id}`, 118, 36);

      // ============ Frame ============
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(10);
      doc.line(16, 40, 200, 40);
      doc.text("Date", 22, 46);
      doc.text("Description", 42, 46);
      doc.text("Amount", 176, 46);
      doc.line(16, 50, 200, 50);

      // ============ Items ============
      let y = 60;
      doc.setFont("Helvetica", "normal");
      doc.setTextColor("#000");
      doc.setFontSize(10);
      doc.text(date_created_string, 22, y);
      const split = doc.splitTextToSize(invoice.description, 100);
      doc.text(split, 42, y);
      doc.text("$" + invoice.subtotal, 176, y);

      // ============ Additional Charges ============
      y = y + 10;
      doc.line(16, y, 200, y);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(122, 121, 121);
      doc.text("Subtotal", 132, y + 6);
      doc.text("Taxes", 132, y + 12);
      doc.text("Total", 132, y + 18);
      doc.text("Status", 132, y + 24);
      doc.text("Due Date", 132, y + 30);
      doc.setTextColor("#000");
      doc.text("$" + invoice.subtotal, 176, y + 6);
      doc.text("$" + invoice.taxes, 176, y + 12);
      doc.text("$" + invoice.amount, 176, y + 18);
      doc.text(invoice.status, 176, y + 24);
      doc.text(due_date_string, 176, y + 30);
      y = y + 36;
      doc.line(124, y, 200, y);

      if (invoice.booking) {
        // ============ Booking ============
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor("#000");
        y = y + 26;
        doc.text("Booking Information", 16, y);
        doc.setFontSize(10);
        doc.setTextColor(122, 121, 121);
        doc.setFont("Helvetica", "normal");
        doc.text(`Booking ID: ${invoice.booking.id}`, 118, y);

        // ============ Vehicle ============
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(10);
        y = y + 4;
        doc.line(16, y, 200, y);
        y = y + 6;
        doc.text("Vehicle", 22, y);
        doc.text("From", 140, y);
        doc.text("To", 176, y);
        y = y + 4;
        doc.line(16, y, 200, y);
        y = y + 6;
        doc.setFont("Helvetica", "normal");
        doc.text(
          `${invoice.vehicle.make} ${invoice.vehicle.model} ${invoice.vehicle.year}`,
          22,
          y
        );
        doc.text(booking_start_date_string, 140, y);
        doc.text(booking_end_date_string, 176, y);
        y = y + 4;
        doc.line(16, y, 200, y);
      }

      // ============ Customer Info ============
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor("#000");
      y = y + 26;
      doc.text("Customer Information", 16, y);
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(122, 121, 121);
      doc.text(`Customer ID: ${customer.id}`, 118, y);
      doc.setTextColor("#000");
      doc.line(16, y + 4, 200, y + 4);
      y = y + 10;
      doc.text(`${customer.firstName} ${customer.lastName}`, 16, y);
      doc.text(customer.email, 16, y + 12);
      doc.text(customer.phone, 16, y + 6);

      // ============ Footer ============
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8);
      doc.text("Copyright © 2023 POSHIT Inc. All rights reserved.", 10, 286);
      doc.text("100 Tradecenter Drive, Woburn, MA 01801", 78, 286);
      doc.text("ph: +1 (413) 210-346", 138, 286);
      doc.text("support@poshcars.io", 172, 286);

      // save pdf as base64
      const base64String = doc.output("datauristring");
      const pdfBuffer = Buffer.from(base64String.split(",")[1], "base64");
      const bucket = admin.storage().bucket();
      const file = bucket.file(`receipts/${invoice.id}/receipt.pdf`);
      await file.save(pdfBuffer, {
        metadata: {
          contentType: "application/pdf",
        },
      });

      const downloadURL = await file.getSignedUrl({
        action: "read",
        expires: "03-09-2030",
      });

      resolve(downloadURL[0]);
    } catch (err) {
      console.log(err);
      reject("Could not generate Receipt PDF: " + err.message);
    }
  });
};

module.exports = { generateReceipt };
