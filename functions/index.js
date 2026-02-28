const { onDocumentCreated, onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { onObjectFinalized } = require("firebase-functions/v2/storage");
const functions = require("firebase-functions");
const vision = require("@google-cloud/vision");
const client = new vision.ImageAnnotatorClient();
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { getStorage } = require("firebase-admin/storage");
const { initializeApp } = require("firebase-admin/app");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const PDFDocument = require("pdfkit");
const QRCode = require("qrcode");
const { randomUUID } = require("crypto");
const logger = require("firebase-functions/logger");

initializeApp();
const db = getFirestore();

exports.analyzeUpload = onDocumentCreated("Uploads/{uploadId}", async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
        logger.info("No data associated with the event");
        return;
    }

    const data = snapshot.data();

    // Make sure we only process documents that need AI processing
    if (data.aiScores) {
        logger.info("Document already contains AI scores, skipping.");
        return;
    }

    const beforeUrl = data.beforeImageUrl;
    const afterUrl = data.afterImageUrl;
    const userId = data.userId;

    if (!beforeUrl || !afterUrl || !userId) {
        logger.warn("Missing required fields (beforeUrl, afterUrl, userId), aborting.");
        return;
    }

    try {
        const API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || "demo-key";

        if (API_KEY === "demo-key" || !API_KEY) {
            logger.warn("GEMINI_API_KEY env not configured. Skipping Gemini AI execution.");
            return;
        }

        logger.info(`Starting Gemini evaluation for upload ${event.params.uploadId}`);

        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

        // Fetch images to pass buffer to Gemini Vision model
        const beforeRes = await fetch(beforeUrl);
        const beforeBuffer = await beforeRes.arrayBuffer();
        const beforeMime = beforeRes.headers.get('content-type') || "image/jpeg";
        const beforeBase64 = Buffer.from(beforeBuffer).toString("base64");

        const afterRes = await fetch(afterUrl);
        const afterBuffer = await afterRes.arrayBuffer();
        const afterMime = afterRes.headers.get('content-type') || "image/jpeg";
        const afterBase64 = Buffer.from(afterBuffer).toString("base64");

        const prompt = `
     Compare before and after cleanup images.
     Return JSON:
     {
       "beforeScore": 0-100,
       "afterScore": 0-100,
       "improvementScore": 0-100,
       "garbageType": [],
       "areaSize": "small | medium | large",
       "impactLevel": "low | medium | high",
       "confidence": 0-100
     }
     Extract garbageType string array from visual evidence (e.g. ["plastic", "organic"]).
     Calculate improvementScore as (afterScore - beforeScore). Ensure valid JSON output only without markdown wrapper.
     `;

        const result = await model.generateContent([
            prompt,
            { inlineData: { data: beforeBase64, mimeType: beforeMime } },
            { inlineData: { data: afterBase64, mimeType: afterMime } }
        ]);

        // Clean string to parse JSON reliably
        let text = result.response.text().trim();
        if (text.startsWith('```json')) text = text.substring(7);
        if (text.startsWith('```')) text = text.substring(3);
        if (text.endsWith('```')) text = text.substring(0, text.length - 3);

        const analysis = JSON.parse(text);

        // Calculate Credits Strategy
        let credits = analysis.improvementScore * 2;
        if (analysis.areaSize === "large") credits += 20;
        if (analysis.impactLevel === "high") credits += 30;

        // Check for plastic
        let hasPlastic = false;
        if (Array.isArray(analysis.garbageType)) {
            hasPlastic = analysis.garbageType.some(type => type.toLowerCase().includes("plastic"));
        } else if (typeof analysis.garbageType === "string") {
            hasPlastic = analysis.garbageType.toLowerCase().includes("plastic");
        }

        if (hasPlastic) {
            credits += 10;
        }

        credits = Math.max(0, Math.floor(credits)); // Ensure no negative & round down

        logger.info(`AI logic matched. Giving ${credits} credits to User ${userId}.`);

        const batch = db.batch();

        // 1. Update Uploads document
        const uploadRef = db.collection("Uploads").doc(event.params.uploadId);
        batch.update(uploadRef, {
            aiScores: {
                ...analysis,
                creditsEarned: credits
            },
            approved: true
        });

        // 2. Update Users document
        const userRef = db.collection("Users").doc(userId);
        batch.update(userRef, {
            totalCredits: FieldValue.increment(credits),
            totalCleanups: FieldValue.increment(1)
        });

        await batch.commit();
        logger.info(`Successfully completed batch write for upload ${event.params.uploadId}`);

    } catch (err) {
        logger.error("Error analyzing upload inside Cloud Function:", err);
    }
});

exports.checkBadges = onDocumentUpdated("Users/{userId}", async (event) => {
    const newValue = event.data.after.data();
    const previousValue = event.data.before.data();

    // Ensure data exists
    if (!newValue || !previousValue) return;

    // Check if totalCleanups has changed
    if (newValue.totalCleanups === previousValue.totalCleanups) {
        return;
    }

    const totalCleanups = newValue.totalCleanups || 0;
    const currentBadges = newValue.badges || [];
    let newBadges = [...currentBadges];

    if (totalCleanups >= 5 && !newBadges.includes("Eco Starter")) {
        newBadges.push("Eco Starter");
    }
    if (totalCleanups >= 10 && !newBadges.includes("Green Warrior")) {
        newBadges.push("Green Warrior");
    }
    if (totalCleanups >= 20 && !newBadges.includes("Madurai Hero")) {
        newBadges.push("Madurai Hero");
    }

    // Only update if there are new badges
    if (newBadges.length > currentBadges.length) {
        logger.info(`Assigning new badges to user ${event.params.userId}: ${newBadges}`);
        return event.data.after.ref.update({
            badges: newBadges
        });
    }
});

exports.checkCertificates = onDocumentUpdated("Users/{userId}", async (event) => {
    const newValue = event.data.after.data();
    const previousValue = event.data.before.data();

    if (!newValue || !previousValue) return;

    const totalCredits = newValue.totalCredits || 0;
    const prevCredits = previousValue.totalCredits || 0;

    if (totalCredits === prevCredits) return;

    let earnedLevel = null;
    if (totalCredits >= 2000 && prevCredits < 2000) earnedLevel = "Gold";
    else if (totalCredits >= 1000 && prevCredits < 1000) earnedLevel = "Silver";
    else if (totalCredits >= 500 && prevCredits < 500) earnedLevel = "Bronze";

    if (!earnedLevel) return; // No new certificate threshold crossed

    // Ensure we don't generate if they already have it
    const existingCerts = newValue.certificates || {};
    if (existingCerts[earnedLevel]) {
        logger.info(`User ${event.params.userId} already has ${earnedLevel} certificate.`);
        return;
    }

    try {
        const userId = event.params.userId;
        const bucket = getStorage().bucket();
        const docName = `certificates/${userId}_${earnedLevel}.pdf`;
        const file = bucket.file(docName);

        logger.info(`Generating ${earnedLevel} PDF Certificate for User ${userId}`);

        // Create PDF in memory
        const doc = new PDFDocument({
            layout: 'landscape',
            size: 'A4',
        });

        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));

        // Let doc execution continue independently to accumulate buffers
        const pdfPromise = new Promise((resolve, reject) => {
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', reject);
        });

        // certificate design
        doc.rect(0, 0, doc.page.width, doc.page.height).fill('#0f172a');
        doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke('#10b981'); // Outer border
        doc.rect(25, 25, doc.page.width - 50, doc.page.height - 50).stroke('#10b981'); // Inner border

        doc.fillColor('#10b981')
            .fontSize(40)
            .font('Helvetica-Bold')
            .text('CERTIFICATE OF ACHIEVEMENT', 0, 100, { align: 'center' });

        doc.fillColor('#94a3b8')
            .fontSize(16)
            .font('Helvetica')
            .text('This proudly recognizes that', 0, 170, { align: 'center' });

        doc.fillColor('#ffffff')
            .fontSize(36)
            .font('Helvetica-Bold')
            .text(newValue.name || newValue.displayName || 'Volunteer', 0, 210, { align: 'center' });

        doc.fillColor('#94a3b8')
            .fontSize(16)
            .font('Helvetica')
            .text('has successfully demonstrated outstanding commitment to', 0, 270, { align: 'center' });

        doc.fillColor('#f59e0b')
            .fontSize(20)
            .font('Helvetica-Bold')
            .text('Clean Madurai AI', 0, 300, { align: 'center' });

        doc.fillColor('#ffffff')
            .fontSize(14)
            .font('Helvetica')
            .text(`Awarded: ${earnedLevel} Level`, doc.page.width / 4 - 60, 420);

        doc.fillColor('#ffffff')
            .fontSize(14)
            .font('Helvetica')
            .text(`Total Credits: ${totalCredits}`, doc.page.width / 2 - 50, 420);

        const dateString = new Date().toLocaleDateString();
        doc.fillColor('#ffffff')
            .fontSize(14)
            .font('Helvetica')
            .text(`Date: ${dateString}`, doc.page.width * 0.75 - 20, 420);

        // QR Code Generation
        const verifyUrl = `https://clean-madurai-ai.web.app/verify/${userId}/${earnedLevel}`;
        const qrDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 1, width: 100, color: { dark: '#10b981', light: '#ffffff' } });

        // embed image by converting base64 Data URL to buffer
        const base64Data = qrDataUrl.replace(/^data:image\/png;base64,/, "");
        const qrBuffer = Buffer.from(base64Data, 'base64');
        doc.image(qrBuffer, doc.page.width / 2 - 50, 460, { width: 100 });

        doc.fillColor('#94a3b8')
            .fontSize(10)
            .font('Helvetica')
            .text('Scan to Verify', 0, 570, { align: 'center' });

        doc.end();

        // Wait for buffer output
        const pdfBuffer = await pdfPromise;

        // Upload to Firebase Storage
        const token = randomUUID();
        await file.save(pdfBuffer, {
            metadata: {
                contentType: 'application/pdf',
                metadata: {
                    firebaseStorageDownloadTokens: token
                }
            }
        });

        const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(docName)}?alt=media&token=${token}`;

        // Save URL string under user's certificates
        const userRef = db.collection("Users").doc(userId);
        await userRef.update({
            [`certificates.${earnedLevel}`]: publicUrl
        });

        logger.info(`Successfully generated and uploaded ${earnedLevel} Certificate for ${userId}`);

    } catch (err) {
        logger.error("Error generating Certificate:", err);
    }
});

exports.resolvePublicReport = onDocumentUpdated("PublicReports/{reportId}", async (event) => {
    const newValue = event.data.after.data();
    const previousValue = event.data.before.data();

    if (!newValue || !previousValue) return;

    if (previousValue.status === "pending" && newValue.status === "resolved") {
        const userId = newValue.userId;

        if (!userId || userId === 'anonymous') {
            logger.info(`Report ${event.params.reportId} resolved, but no valid user to reward.`);
            return;
        }

        try {
            logger.info(`Report ${event.params.reportId} resolved! Awarding 50 reward Points to User ${userId}.`);

            const batch = db.batch();

            // 1. Assign 50 points directly to the PublicReports document record
            const reportRef = db.collection("PublicReports").doc(event.params.reportId);
            batch.update(reportRef, { rewardPoints: 50 });

            // 2. Increment the User's global rewardPoints tally
            const userRef = db.collection("Users").doc(userId);
            batch.update(userRef, { rewardPoints: FieldValue.increment(50) });

            await batch.commit();
            logger.info(`Successfully batched reward for User ${userId}`);
        } catch (error) {
            logger.error(`Error processing reward points for resolved report:`, error);
        }
    }
});

exports.analyzeImage = onObjectFinalized({ bucket: "clean-madurai-698f3.firebasestorage.app" }, async (event) => {
    const fileBucket = event.data.bucket;
    const filePath = event.data.name;

    try {
        const [result] = await client.labelDetection(
            `gs://${fileBucket}/${filePath}`
        );

        const labels = result.labelAnnotations.map((label) => label.description);

        await db.collection("reports").add({
            image: filePath,
            labels: labels,
            createdAt: FieldValue.serverTimestamp()
        });

        logger.info("Image analyzed:", labels);
    } catch (error) {
        logger.error("Error analyzing image:", error);
    }
});
