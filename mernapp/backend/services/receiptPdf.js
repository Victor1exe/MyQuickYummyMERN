const PDFDocument = require('pdfkit');

// The storefront palette, so a printed receipt still looks like the product.
const ORANGE = '#fc8019';
const DEEP_ORANGE = '#f55d2c';
const INK = '#222222';
const MUTED = '#6c757d';
const RULE = '#e4e4e4';

const money = (value) => `Rs. ${Number(value || 0).toLocaleString('en-IN')}`;

const formatDateTime = (date) =>
    new Date(date).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

const STATUS_LABELS = {
    placed: 'Order placed',
    preparing: 'Being prepared',
    picked_up: 'Picked up',
    out_for_delivery: 'Out for delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled'
};

/**
 * Streams a PDF receipt for one order into `stream`.
 *
 * Used by both the customer download and the admin download, so the two are
 * guaranteed to be byte-for-byte the same document.
 *
 * @param {object} receipt A Receipt document (lean object is fine).
 * @param {WritableStream} stream Where to pipe the PDF.
 */
const buildReceiptPdf = (receipt, stream) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    doc.pipe(stream);

    const left = doc.page.margins.left;
    const right = doc.page.width - doc.page.margins.right;
    const width = right - left;

    // --- Header band -------------------------------------------------------
    doc.rect(0, 0, doc.page.width, 110).fill(ORANGE);

    doc.fillColor('#ffffff')
        .fontSize(24)
        .font('Helvetica-Bold')
        .text('My Quick Yummy', left, 34);

    doc.fontSize(10)
        .font('Helvetica')
        .fillColor('#ffe9d8')
        .text('Order from restaurants, hotels, cloud kitchens and food stalls near you.', left, 64);

    doc.fontSize(9)
        .fillColor('#ffffff')
        .text('TAX INVOICE / RECEIPT', left, 84, { width, align: 'right' });

    doc.fontSize(16)
        .font('Helvetica-Bold')
        .fillColor('#ffffff')
        .text(receipt.receiptNo, left, 34, { width, align: 'right' });

    doc.y = 140;

    // --- Order + customer --------------------------------------------------
    const columnWidth = width / 2 - 10;
    const metaTop = doc.y;

    doc.font('Helvetica-Bold').fontSize(10).fillColor(MUTED).text('ORDER DETAILS', left, metaTop);
    doc.font('Helvetica').fontSize(10).fillColor(INK);
    doc.text(`Placed:  ${formatDateTime(receipt.placedAt)}`, left, metaTop + 18, { width: columnWidth });
    doc.text(`Status:  ${STATUS_LABELS[receipt.status] || receipt.status}`, { width: columnWidth });
    doc.text(`Promised in:  ${receipt.etaMinutes} minutes`, { width: columnWidth });
    if (receipt.deliveredAt) {
        doc.text(`Delivered:  ${formatDateTime(receipt.deliveredAt)}`, { width: columnWidth });
    }

    const customerLeft = left + columnWidth + 20;
    doc.font('Helvetica-Bold').fontSize(10).fillColor(MUTED).text('DELIVERED TO', customerLeft, metaTop);
    doc.font('Helvetica').fontSize(10).fillColor(INK);
    doc.text(receipt.customerName || receipt.email, customerLeft, metaTop + 18, { width: columnWidth });
    doc.text(receipt.email, { width: columnWidth });
    if (receipt.customerAddress) {
        doc.text(receipt.customerAddress, { width: columnWidth });
    }

    doc.y = Math.max(doc.y, metaTop + 90);

    // --- Rider -------------------------------------------------------------
    if (receipt.rider && receipt.rider.name) {
        const boxTop = doc.y;
        doc.roundedRect(left, boxTop, width, 58, 8).fill('#fff5ee');
        doc.fillColor(DEEP_ORANGE)
            .font('Helvetica-Bold')
            .fontSize(10)
            .text('DELIVERY PARTNER', left + 14, boxTop + 12);
        doc.fillColor(INK)
            .font('Helvetica')
            .fontSize(11)
            .text(
                `${receipt.rider.name}  •  ${receipt.rider.vehicle || 'on the way'}` +
                    (receipt.rider.phone ? `  •  ${receipt.rider.phone}` : '') +
                    (receipt.rider.rating ? `  •  ${receipt.rider.rating} rating` : ''),
                left + 14,
                boxTop + 30,
                { width: width - 28 }
            );
        doc.y = boxTop + 78;
    }

    // --- Items table -------------------------------------------------------
    const cols = {
        item: left,
        size: left + width * 0.5,
        qty: left + width * 0.66,
        price: left + width * 0.78
    };

    const headerY = doc.y;
    doc.rect(left, headerY, width, 24).fill('#f6f6f6');
    doc.fillColor(MUTED).font('Helvetica-Bold').fontSize(9);
    doc.text('ITEM', cols.item + 8, headerY + 8);
    doc.text('SIZE', cols.size, headerY + 8);
    doc.text('QTY', cols.qty, headerY + 8, { width: 40, align: 'right' });
    doc.text('AMOUNT', cols.price, headerY + 8, { width: width * 0.22 - 8, align: 'right' });

    let rowY = headerY + 30;
    doc.font('Helvetica').fontSize(10);

    receipt.items.forEach((item) => {
        // Start a new page before a row would run off the bottom.
        if (rowY > doc.page.height - 200) {
            doc.addPage();
            rowY = doc.page.margins.top;
        }

        doc.fillColor(INK).text(item.name, cols.item + 8, rowY, { width: width * 0.48 - 8 });
        const nameHeight = doc.heightOfString(item.name, { width: width * 0.48 - 8 });

        doc.fillColor(MUTED).fontSize(9);
        if (item.kitchen) {
            doc.text(item.kitchen, cols.item + 8, rowY + nameHeight + 1, { width: width * 0.48 - 8 });
        }

        doc.fillColor(INK).fontSize(10);
        doc.text(item.size || '—', cols.size, rowY);
        doc.text(String(item.qty), cols.qty, rowY, { width: 40, align: 'right' });
        doc.text(money(item.price), cols.price, rowY, { width: width * 0.22 - 8, align: 'right' });

        rowY += Math.max(nameHeight, 12) + (item.kitchen ? 14 : 6) + 8;
        doc.moveTo(left, rowY - 6).lineTo(right, rowY - 6).strokeColor(RULE).lineWidth(0.5).stroke();
    });

    // --- Totals ------------------------------------------------------------
    const totalsLeft = left + width * 0.55;
    const totalsWidth = width * 0.45;
    let totalsY = rowY + 10;

    const totalLine = (label, value, bold = false) => {
        doc.font(bold ? 'Helvetica-Bold' : 'Helvetica')
            .fontSize(bold ? 12 : 10)
            .fillColor(bold ? INK : MUTED)
            .text(label, totalsLeft, totalsY, { width: totalsWidth * 0.6 });
        doc.fillColor(INK)
            .text(money(value), totalsLeft + totalsWidth * 0.6, totalsY, {
                width: totalsWidth * 0.4,
                align: 'right'
            });
        totalsY += bold ? 22 : 18;
    };

    totalLine('Subtotal', receipt.subtotal);
    totalLine('Delivery fee', receipt.deliveryFee);
    totalLine('Packaging', receipt.packagingFee);
    totalLine('GST (5%)', receipt.gst);

    doc.moveTo(totalsLeft, totalsY).lineTo(right, totalsY).strokeColor(ORANGE).lineWidth(1).stroke();
    totalsY += 10;
    totalLine('Total paid', receipt.total, true);

    // --- Footer ------------------------------------------------------------
    const footerY = Math.max(totalsY + 30, doc.page.height - 130);
    doc.moveTo(left, footerY).lineTo(right, footerY).strokeColor(RULE).lineWidth(0.5).stroke();

    doc.font('Helvetica').fontSize(8).fillColor(MUTED);
    doc.text(
        'This is a computer generated receipt and does not require a signature. ' +
            'Refunds and cancellations are handled under the Customer Refund and Cancellation Policy ' +
            'published at /policies/customer-refund-and-cancellation-policy.',
        left,
        footerY + 12,
        { width, align: 'left' }
    );
    doc.text('My Quick Yummy, Inc.  •  support@myquickyummy.com', left, footerY + 44, { width });
    doc.text(`Generated ${formatDateTime(new Date())}`, left, footerY + 44, { width, align: 'right' });

    doc.end();
};

module.exports = { buildReceiptPdf, STATUS_LABELS };
