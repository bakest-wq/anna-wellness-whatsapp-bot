const fs = require("fs");
const path = require("path");
const axios = require("axios");

let sheetsClientPromise = null;

function isSheetsEnabled() {
  return process.env.GOOGLE_SHEETS_ENABLED === "true";
}

function getCredentials() {
  const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (credPath && fs.existsSync(path.resolve(credPath))) {
    return JSON.parse(fs.readFileSync(path.resolve(credPath), "utf8"));
  }

  if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
    return {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n")
    };
  }

  return null;
}

async function getSheetsClient() {
  if (!sheetsClientPromise) {
    sheetsClientPromise = (async () => {
      const credentials = getCredentials();
      if (!credentials) {
        throw new Error("Google credentials are not configured");
      }

      const { google } = require("googleapis");
      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ["https://www.googleapis.com/auth/spreadsheets"]
      });
      const authClient = await auth.getClient();
      return google.sheets({ version: "v4", auth: authClient });
    })();
  }
  return sheetsClientPromise;
}

function leadToRow(lead) {
  const now = new Date().toISOString();
  return [
    now,
    lead.name || "",
    lead.phone || "",
    lead.language || "",
    lead.service || "",
    lead.day || "",
    lead.time || "",
    lead.contraindications || "",
    lead.comment || "-",
    lead.source || "WhatsApp AI-бот",
    lead.userId || ""
  ];
}

async function appendLeadToGoogleSheet(lead, logger) {
  if (!isSheetsEnabled()) return { skipped: true };

  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const sheetName = process.env.GOOGLE_SHEETS_TAB || "Leads";

  if (!spreadsheetId) {
    logger?.warn?.("GOOGLE_SHEETS_SPREADSHEET_ID is missing");
    return { skipped: true };
  }

  const sheets = await getSheetsClient();
  const range = `${sheetName}!A:K`;

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [leadToRow(lead)]
    }
  });

  logger?.info?.("Lead saved to Google Sheets", { spreadsheetId, sheetName });
  return { ok: true };
}

async function sendLeadToCrmWebhook(lead, logger) {
  const url = process.env.CRM_WEBHOOK_URL;
  if (!url) return { skipped: true };

  await axios.post(
    url,
    {
      type: "whatsapp_lead",
      createdAt: new Date().toISOString(),
      ...lead
    },
    { timeout: 10000 }
  );

  logger?.info?.("Lead sent to CRM webhook");
  return { ok: true };
}

async function persistLead(lead, logger) {
  const results = await Promise.allSettled([
    appendLeadToGoogleSheet(lead, logger),
    sendLeadToCrmWebhook(lead, logger)
  ]);

  const errors = results
    .filter((r) => r.status === "rejected")
    .map((r) => r.reason?.message || "unknown");

  if (errors.length) {
    logger?.error?.("Lead persistence partial failure", { errors });
  }

  return { errors };
}

module.exports = {
  persistLead,
  leadToRow,
  isSheetsEnabled
};
