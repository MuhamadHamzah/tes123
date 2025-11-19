import QRCode from "qrcode";

export interface AttendanceEvent {
  id: string;
  event_name: string;
  event_date: string;
  event_type: string;
  qr_code_senior: string;
  qr_code_umum: string;
  qr_code_panitia: string;
  spreadsheet_url_senior: string | null;
  spreadsheet_url_umum: string | null;
  spreadsheet_url_panitia: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type AttendanceType = "senior" | "umum" | "panitia";

export interface SeniorAttendance {
  nama: string;
  angkatan: number;
  waktu_checkin: string;
}

export interface UmumAttendance {
  nama: string;
  prodi: string;
  nomor_hp: string;
  waktu_checkin: string;
}

export interface PanitiaAttendance {
  nama: string;
  npm: string;
  angkatan: number;
  waktu_checkin: string;
}

export interface SubmitResult {
  success: boolean;
  message?: string;
}

// URL Logo HMP-TI - GANTI dengan URL logo yang sudah diupload
// Upload ke: Imgur, Cloudinary, atau simpan di folder public
const LOGO_URL = "/img/logo_hmpti.jpg";

/**
 * Generate QR Code dengan logo di tengah
 * @param data - Data yang akan di-encode ke QR
 * @param logoUrl - URL logo (opsional, default menggunakan LOGO_URL)
 * @returns Promise<string> - Data URL QR code dalam format base64
 */
export async function generateQRCode(
  data: string,
  logoUrl: string = LOGO_URL
): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const size = 600; // Ukuran QR Code (pixels)
    canvas.width = size;
    canvas.height = size;

    // Generate QR Code ke canvas
    QRCode.toCanvas(
      canvas,
      data,
      {
        width: size,
        margin: 2,
        errorCorrectionLevel: "H", // High error correction - penting agar QR tetap bisa dibaca meski ada logo
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      },
      (error) => {
        if (error) {
          reject(error);
          return;
        }

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Cannot get canvas context"));
          return;
        }

        // Jika ada logo, tambahkan ke QR Code
        if (logoUrl) {
          const logo = new Image();
          logo.crossOrigin = "anonymous"; // Untuk menghindari CORS error

          logo.onload = () => {
            try {
              // Ukuran logo (sekitar 20-22% dari QR code)
              const logoSize = size * 0.22;
              const logoPos = (size - logoSize) / 2;
              const padding = 15;

              // Gambar background putih bulat untuk logo
              ctx.fillStyle = "#FFFFFF";
              ctx.beginPath();
              ctx.arc(
                size / 2,
                size / 2,
                (logoSize + padding * 2) / 2,
                0,
                Math.PI * 2
              );
              ctx.fill();

              // Tambahkan border untuk logo (opsional, bisa dihapus jika tidak perlu)
              ctx.strokeStyle = "#000000";
              ctx.lineWidth = 3;
              ctx.stroke();

              // Gambar logo di tengah
              ctx.drawImage(logo, logoPos, logoPos, logoSize, logoSize);

              resolve(canvas.toDataURL("image/png"));
            } catch (err) {
              console.error("Error drawing logo:", err);
              // Jika error saat menggambar logo, kembalikan QR tanpa logo
              resolve(canvas.toDataURL("image/png"));
            }
          };

          logo.onerror = (err) => {
            console.error("Error loading logo:", err);
            // Jika logo gagal dimuat, kembalikan QR tanpa logo
            resolve(canvas.toDataURL("image/png"));
          };

          logo.src = logoUrl;
        } else {
          // Tidak ada logo, langsung resolve
          resolve(canvas.toDataURL("image/png"));
        }
      }
    );
  });
}

export function generateAttendanceUrl(
  eventId: string,
  type: AttendanceType
): string {
  const baseUrl = window.location.origin;
  return `${baseUrl}/attendance/${type}/${eventId}`;
}

/**
 * Validasi apakah URL adalah Apps Script URL yang valid
 */
export function isValidAppsScriptUrl(url: string): boolean {
  if (!url) return false;

  // Format yang benar: https://script.google.com/macros/s/{SCRIPT_ID}/exec
  const pattern =
    /^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/(exec|dev)$/;
  return pattern.test(url);
}

/**
 * Submit data absensi ke Google Sheets via Apps Script
 * Menggunakan dual-method approach: POST form-urlencoded dengan GET fallback
 *
 * @param appsScriptUrl - URL Web App dari Apps Script (format: https://script.google.com/macros/s/.../exec)
 * @param data - Data absensi yang akan dikirim
 * @returns Promise<SubmitResult> - Object berisi success status dan message
 */
export async function submitToGoogleSheets(
  appsScriptUrl: string,
  data: Record<string, any>
): Promise<SubmitResult> {
  try {
    // Validasi URL Apps Script
    if (!isValidAppsScriptUrl(appsScriptUrl)) {
      throw new Error(
        "URL Apps Script tidak valid. Pastikan format: https://script.google.com/macros/s/.../exec"
      );
    }

    console.log("📤 Mengirim data ke Google Sheets...", data);
    console.log("📍 URL:", appsScriptUrl);

    // Pastikan URL berakhiran /exec
    const finalUrl = appsScriptUrl.replace(/\/dev$/, "/exec");

    // METHOD 1: POST dengan form-urlencoded (Google Apps Script lebih suka format ini)
    try {
      console.log("🔄 Mencoba METHOD 1: POST form-urlencoded");

      const formData = new URLSearchParams();
      Object.entries(data).forEach(([key, value]) => {
        const stringValue =
          value === null || value === undefined ? "" : String(value);
        formData.append(key, stringValue);
      });

      console.log("📦 FormData:", formData.toString());

      const postResponse = await fetch(finalUrl, {
        method: "POST",
        body: formData.toString(),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        redirect: "follow",
      });

      console.log("📨 POST Response status:", postResponse.status);
      const postText = await postResponse.text();
      console.log("📨 POST Response:", postText);

      const postResult = JSON.parse(postText);

      if (postResult.status === "success") {
        console.log("✅ POST berhasil!");
        return {
          success: true,
          message: postResult.message || "Absensi berhasil dicatat",
        };
      }
    } catch (postError) {
      console.warn("⚠️ POST gagal, mencoba GET...", postError);
    }

    // METHOD 2: GET dengan query parameters (fallback)
    // Apps Script lebih reliable dengan e.parameter (query params) daripada POST body
    console.log("🔄 Mencoba METHOD 2: GET dengan query params");

    const queryParams = new URLSearchParams();
    Object.entries(data).forEach(([key, value]) => {
      const stringValue =
        value === null || value === undefined ? "" : String(value);
      queryParams.append(key, stringValue);
    });

    const getUrl = finalUrl + "?" + queryParams.toString();
    console.log("📍 GET URL:", getUrl.substring(0, 100) + "...");

    const getResponse = await fetch(getUrl, {
      method: "GET",
      redirect: "follow",
    });

    console.log("📨 GET Response status:", getResponse.status);
    const getText = await getResponse.text();
    console.log("📨 GET Response:", getText);

    const getResult = JSON.parse(getText);

    if (getResult.status === "success") {
      console.log("✅ GET berhasil!");
      return {
        success: true,
        message: getResult.message || "Absensi berhasil dicatat",
      };
    } else {
      throw new Error(getResult.message || "Gagal menyimpan data");
    }
  } catch (error) {
    console.error("❌ Error submitting to Google Sheets:", error);

    // Handle berbagai jenis error
    let errorMessage = "Terjadi kesalahan saat menyimpan absensi";

    if (
      error instanceof TypeError &&
      error.message.includes("Failed to fetch")
    ) {
      errorMessage =
        "Tidak dapat terhubung ke Google Sheets. Periksa koneksi internet atau URL Apps Script.";
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return {
      success: false,
      message: errorMessage,
    };
  }
}

/**
 * Helper function untuk format data sebelum dikirim ke Google Sheets
 */
export function formatAttendanceData(
  rawData: SeniorAttendance | UmumAttendance | PanitiaAttendance,
  eventName: string,
  type: AttendanceType
): Record<string, any> {
  return {
    ...rawData,
    event_name: eventName,
    type: type,
    waktu_checkin: rawData.waktu_checkin || new Date().toISOString(),
  };
}

/**
 * Helper function untuk submit absensi berdasarkan event dan tipe
 * @param event - Event absensi
 * @param formData - Data form absensi
 * @param type - Tipe absensi (senior/umum/panitia)
 * @returns Promise<SubmitResult>
 */
export async function submitAttendance(
  event: AttendanceEvent,
  formData: SeniorAttendance | UmumAttendance | PanitiaAttendance,
  type: AttendanceType
): Promise<SubmitResult> {
  // Pilih URL sesuai tipe
  let appsScriptUrl = "";
  switch (type) {
    case "senior":
      appsScriptUrl = event.spreadsheet_url_senior || "";
      break;
    case "umum":
      appsScriptUrl = event.spreadsheet_url_umum || "";
      break;
    case "panitia":
      appsScriptUrl = event.spreadsheet_url_panitia || "";
      break;
  }

  // Validasi URL ada
  if (!appsScriptUrl) {
    return {
      success: false,
      message: `URL Google Sheets belum dikonfigurasi untuk absensi ${type}`,
    };
  }

  // Format data
  const dataToSend = formatAttendanceData(formData, event.event_name, type);

  // Kirim ke Google Sheets
  return await submitToGoogleSheets(appsScriptUrl, dataToSend);
}

/**
 * Validasi URL Apps Script untuk form admin
 * @param url - URL yang akan divalidasi
 * @returns null jika valid, error message jika tidak valid
 */
export function validateAppsScriptUrl(url: string): string | null {
  if (!url) return null; // Boleh kosong

  if (!isValidAppsScriptUrl(url)) {
    return "Format URL tidak valid. Contoh: https://script.google.com/macros/s/ABC123xyz/exec";
  }

  return null; // Valid
}

/**
 * Test koneksi ke Apps Script URL
 * @param url - URL Apps Script yang akan ditest
 * @returns Promise<SubmitResult>
 */
export async function testAppsScriptConnection(
  url: string
): Promise<SubmitResult> {
  try {
    if (!isValidAppsScriptUrl(url)) {
      return {
        success: false,
        message: "Format URL tidak valid",
      };
    }

    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
    });

    if (response.ok) {
      const text = await response.text();
      try {
        const result = JSON.parse(text);
        return {
          success: true,
          message: result.message || "Koneksi berhasil! URL Apps Script valid.",
        };
      } catch {
        return {
          success: true,
          message: "Koneksi berhasil! URL Apps Script valid.",
        };
      }
    } else {
      return {
        success: false,
        message: `Koneksi gagal (HTTP ${response.status})`,
      };
    }
  } catch (error) {
    return {
      success: false,
      message: "Tidak dapat terhubung ke URL tersebut",
    };
  }
}
