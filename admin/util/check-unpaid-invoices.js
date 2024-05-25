const { getSubcollection } = require("../../util/firestore/get-subcollection");
const { updateDocument } = require("../../util/firestore/update-document");

const checkUnpaidInvoices = (customerId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!customerId) throw new Error("Customer ID not provided.");

      // Get Customer Invoices
      const invoices = await getSubcollection(
        "Customers",
        customerId,
        "Payments"
      );

      // Check if all Invoices are paid
      let unpaid_invoice = false;
      for (const i of invoices) {
        if (i.type === "invoice" && i.status !== "succeeded") {
          unpaid_invoice = true;
          break;
        }
      }

      // Update Customer Object
      await updateDocument("Customers", customerId, {
        unpaid_invoices: unpaid_invoice,
      });

      resolve();
    } catch (err) {
      console.error(err);
      reject({ message: "Error checking for unpaid invoices: " + err.message });
    }
  });
};

module.exports = { checkUnpaidInvoices };