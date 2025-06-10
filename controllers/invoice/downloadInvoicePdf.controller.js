import puppeteer from 'puppeteer';
import fs from 'fs-extra';
import handlebars from 'handlebars';
import path from 'path';
import Invoice from '../../models/Invoice.js';
import { AppError } from '../../utils/AppError.js';

export const downloadInvoicePdf = async (req, res, next) => {
  try {
    const invoiceId = req.params.invoiceId;

    const invoice = await Invoice.findById(invoiceId)
      .populate('issuer receiver createdBy items.product');

    if (!invoice) {
      return next(new AppError('Invoice not found', 404));
    }

    const templatePath = path.resolve('templates', 'invoice-template.html');
    const htmlTemplate = await fs.readFile(templatePath, 'utf-8');

    const template = handlebars.compile(htmlTemplate);
    const html = template(invoice.toObject());

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
    });

    await browser.close();

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=${invoice.invoiceNumber}.pdf`
    });

    res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
};
