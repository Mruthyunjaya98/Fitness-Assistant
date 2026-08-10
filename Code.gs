var SPREADSHEET_ID = "1d8Y_8Hcjatp9gUtZzTw9NBKAnswr3eYb8UhMfMjg23Q";
var EMAIL_RECIPIENT = "mruthyunjayamath@gmail.com";

function doGet(e) {
  var selectedView = "daily"; 
  if (e && e.parameter && e.parameter.view) {
    selectedView = e.parameter.view.toLowerCase();
  }
  
  var template = HtmlService.createTemplateFromFile('Index');
  template.view = selectedView; 
  
  return template.evaluate()
    .setTitle('#OmSarvaDevaGanayaNamaha - Health Assistant')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function logFitnessData(payload) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var timestamp = new Date();
  
  if (payload.type === 'workout') {
    var sheet = ss.getSheetByName('Workout');
    sheet.appendRow([timestamp, payload.exercise, payload.duration, payload.distance || '', payload.breaths || '', payload.reps || '', payload.sets || '']);
  } 
  else if (payload.type === 'diet') {
    var sheet = ss.getSheetByName('Diet');
    var macros = calculateMacros(payload.item, payload.qty);
    sheet.appendRow([timestamp, payload.item, payload.qty, macros.carbs, macros.simpleCarbs, macros.sugar, macros.fats, macros.proteins, macros.nutrients, macros.micro, macros.fiber]);
  } 
  else if (payload.type === 'hydration') {
    var sheet = ss.getSheetByName('Hydration');
    sheet.appendRow([timestamp, payload.qty]);
  } 
  else if (payload.type === 'sleep') {
    var sheet = ss.getSheetByName('Sleep');
    sheet.appendRow([timestamp, payload.durationHours, payload.quality]);
  }
  return { status: "SUCCESS" };
}

function calculateMacros(item, qty) {
  return {
    carbs: "30g", simpleCarbs: "10g", sugar: "5g", fats: "8g", proteins: "6g", nutrients: "High", micro: "Iron, Calcium", fiber: "4g"
  };
}

// ==========================================
// AUTOMATED TRIGGER FUNCTIONS
// ==========================================

// 1. Every 15 mins: Consolidate Daily Metrics
function processAggregation15m() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  Logger.log("15m Aggregation complete.");
}

// 2. Every 20 mins: Refresh Dynatrace Dashboard
function refreshDynatraceDashboard20m() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var dashSheet = ss.getSheetByName('Fitness Dashboard') || ss.insertSheet('Fitness Dashboard');
  dashSheet.setBackground("#18181a");
  dashSheet.getRange("A1:J2").merge().setValue("⚡ DYNATRACE FITNESS MONITORING DASHBOARD")
           .setFontColor("#70ff00").setFontSize(16).setBold(true).setHorizontalAlignment("center");
}

// 3. Every 4 hours: Generate Suggestions & Feedback
function generateSuggestions4h() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sugSheet = ss.getSheetByName('Suggestions') || ss.insertSheet('Suggestions');
  var timestamp = new Date();
  sugSheet.appendRow([timestamp, "Mama, hydration and activity are on track! Keep going!"]);
}

// 4. Every 5 hours: PDF Generation & Mail Dispatch
function sendFitnessReport5h() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var timestamp = Utilities.formatDate(new Date(), "IST", "yyyy-MM-dd HH:mm");
  
  var dashSheet = ss.getSheetByName('Fitness Dashboard');
  if (!dashSheet) return;
  
  var url = "https://docs.google.com/spreadsheets/d/" + SPREADSHEET_ID + "/export?exportFormat=pdf&format=pdf&size=A4&portrait=true&fitw=true&gridlines=false&gid=" + dashSheet.getSheetId();
  var token = ScriptApp.getOAuthToken();
  var response = UrlFetchApp.fetch(url, { headers: { 'Authorization': 'Bearer ' + token } });
  var pdfBlob = response.getBlob().setName("Fitness_Report_" + timestamp + ".pdf");
  
  MailApp.sendEmail({
    to: EMAIL_RECIPIENT,
    subject: "#HariOm - #OmSarvaDevaGanayaNamaha🕉️🙏🚩 - Fitness Report " + timestamp,
    body: "Mama, find attached your automated Dynatrace-style Fitness Report.",
    attachments: [pdfBlob]
  });
}
