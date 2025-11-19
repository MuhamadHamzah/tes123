function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheets()[0];

    // Parse data dari form-urlencoded
    var params = e.parameter;

    console.log("Received POST data:", JSON.stringify(params));

    // Cek jika sheet kosong, buat header berdasarkan tipe
    if (sheet.getLastRow() === 0) {
      setupHeaders(sheet, params.type);
    }

    // Simpan data berdasarkan tipe absensi
    var result = saveAttendance(sheet, params);

    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(
      ContentService.MimeType.JSON
    );
  } catch (error) {
    console.error("Error in doPost:", error);
    return ContentService.createTextOutput(
      JSON.stringify({
        status: "error",
        message: "Error: " + error.toString(),
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    var params = e.parameter;

    // Jika ada parameter (dari METHOD 2), simpan data
    if (params && Object.keys(params).length > 0) {
      console.log("Received GET data:", JSON.stringify(params));

      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var sheet = ss.getSheets()[0];

      // Cek jika sheet kosong, buat header
      if (sheet.getLastRow() === 0) {
        setupHeaders(sheet, params.type);
      }

      var result = saveAttendance(sheet, params);

      return ContentService.createTextOutput(
        JSON.stringify(result)
      ).setMimeType(ContentService.MimeType.JSON);
    }

    // Jika tidak ada parameter, return info
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheets()[0];

    return ContentService.createTextOutput(
      JSON.stringify({
        status: "success",
        message: "Apps Script berjalan dengan baik!",
        sheetName: sheet.getName(),
        totalRows: sheet.getLastRow(),
      })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    console.error("Error in doGet:", error);
    return ContentService.createTextOutput(
      JSON.stringify({
        status: "error",
        message: error.toString(),
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Setup headers berdasarkan tipe absensi
 */
function setupHeaders(sheet, type) {
  var headers = ["Timestamp", "Event Name"];

  switch (type) {
    case "senior":
      headers.push("Nama", "Angkatan", "Waktu Check-in");
      break;
    case "umum":
      headers.push("Nama", "Prodi", "Nomor HP", "Waktu Check-in");
      break;
    case "panitia":
      headers.push("Nama", "NPM", "Angkatan", "Waktu Check-in");
      break;
    default:
      headers.push("Nama", "Data", "Waktu Check-in");
  }

  sheet.appendRow(headers);

  // Format header
  var headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight("bold");
  headerRange.setBackground("#4285f4");
  headerRange.setFontColor("#ffffff");
}

/**
 * Simpan data absensi ke spreadsheet
 */
function saveAttendance(sheet, params) {
  try {
    var timestamp = new Date();
    var waktuCheckin = params.waktu_checkin
      ? new Date(params.waktu_checkin)
      : timestamp;
    var eventName = params.event_name || "";
    var type = params.type || "umum";

    var rowData = [timestamp, eventName];

    // Tambahkan data sesuai tipe
    switch (type) {
      case "senior":
        rowData.push(params.nama || "", params.angkatan || "", waktuCheckin);
        break;

      case "umum":
        rowData.push(
          params.nama || "",
          params.prodi || "",
          params.nomor_hp || "",
          waktuCheckin
        );
        break;

      case "panitia":
        rowData.push(
          params.nama || "",
          params.npm || "",
          params.angkatan || "",
          waktuCheckin
        );
        break;

      default:
        rowData.push(params.nama || "", JSON.stringify(params), waktuCheckin);
    }

    // Simpan ke sheet
    sheet.appendRow(rowData);

    return {
      status: "success",
      message: "Absensi berhasil dicatat",
      data: {
        nama: params.nama,
        type: type,
        timestamp: timestamp.toISOString(),
      },
    };
  } catch (error) {
    console.error("Error saving attendance:", error);
    return {
      status: "error",
      message: "Gagal menyimpan data: " + error.toString(),
    };
  }
}

/**
 * Fungsi helper untuk format tanggal Indonesia
 */
function formatDateIndo(date) {
  var options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  };
  return date.toLocaleDateString("id-ID", options);
}

/**
 * Fungsi untuk mendapatkan statistik absensi
 */
function getAttendanceStats() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  var data = sheet.getDataRange().getValues();

  if (data.length <= 1) {
    return {
      total: 0,
      senior: 0,
      umum: 0,
      panitia: 0,
    };
  }

  var stats = {
    total: data.length - 1, // Exclude header
    senior: 0,
    umum: 0,
    panitia: 0,
  };

  // Count by type (assuming type is in a specific column)
  // Adjust column index based on your actual structure

  return stats;
}

/**
 * Fungsi test untuk debugging
 */
function testSaveAttendance() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];

  // Test data senior
  var testDataSenior = {
    type: "senior",
    nama: "Test Senior",
    angkatan: "2020",
    event_name: "Test Event",
    waktu_checkin: new Date().toISOString(),
  };

  var result = saveAttendance(sheet, testDataSenior);
  Logger.log("Test Senior Result: " + JSON.stringify(result));

  // Test data umum
  var testDataUmum = {
    type: "umum",
    nama: "Test Umum",
    prodi: "Teknik Informatika",
    nomor_hp: "08123456789",
    event_name: "Test Event",
    waktu_checkin: new Date().toISOString(),
  };

  var result2 = saveAttendance(sheet, testDataUmum);
  Logger.log("Test Umum Result: " + JSON.stringify(result2));

  // Test data panitia
  var testDataPanitia = {
    type: "panitia",
    nama: "Test Panitia",
    npm: "123456789",
    angkatan: "2021",
    event_name: "Test Event",
    waktu_checkin: new Date().toISOString(),
  };

  var result3 = saveAttendance(sheet, testDataPanitia);
  Logger.log("Test Panitia Result: " + JSON.stringify(result3));
}
