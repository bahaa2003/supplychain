import puppeteer from "puppeteer";
import renderTemplate from "../utils/templateRenderer.js";

export default async function createInvoicePdf(invoice) {
  try {
    const html = renderTemplate("document", "invoice", invoice);
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
    });
    await browser.close();
    return pdfBuffer;
  } catch (error) {
    throw new Error("Failed to create PDF: " + error.message);
  }
}
