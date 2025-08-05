import { UserBio, Agent, AuditLogData } from "../types/types";
import { getUserByReferralCode } from "./api";
import * as XLSX from "xlsx";

// Define proper types for export data
export interface ExportUserData {
  Name: string;
  Username: string;
  Role: string;
  Phone: string;
  Email: string;
  "Referral Code": string;
  Country: string;
  Status: string;
  "Created At": string;
}

export interface ExportAgentData {
  Name: string;
  "Business Name": string;
  "Role/Model": string;
  "KYC Status": string;
  Status: string;
  "Primary Phone": string;
  "Business Phone": string;
  "Residual Amount": number;
  "Referred By": string;
  Address: string;
  Region: string | null;
  District: string;
  Latitude: string;
  Longitude: string;
  "ID Type": string | null;
  "ID Document": string | null;
  "Business Registration": string | null;
  "Business Image": string | null;
  "Address Document": string | null;
  "Created At": string;
}

export interface ExportAuditLogData {
  Table: string;
  "Action Type": string;
  Description: string;
  Reason: string;
  "Performed By": string;
  Role: string;
  "IP Address": string;
  Time: string;
}

// Convert data to CSV format
export const convertToCSV = (
  data: Record<string, unknown>[],
  headers: string[]
): string => {
  const csvHeaders = headers.join(",");
  const csvRows = data.map((row) => {
    return headers
      .map((header) => {
        const value =
          row[header.toLowerCase().replace(/\s+/g, "_")] || row[header] || "";
        // Escape quotes and wrap in quotes if contains comma
        const escapedValue = String(value).replace(/"/g, '""');
        return escapedValue.includes(",") ? `"${escapedValue}"` : escapedValue;
      })
      .join(",");
  });

  return [csvHeaders, ...csvRows].join("\n");
};

// Convert data to Excel format using xlsx library
export const convertToExcel = (
  data: Record<string, unknown>[],
  headers: string[]
): Uint8Array => {
  // Create a new workbook
  const workbook = XLSX.utils.book_new();

  // Convert data to worksheet format
  const worksheetData = data.map((row) => {
    const rowData: Record<string, unknown> = {};
    headers.forEach((header) => {
      const value =
        row[header.toLowerCase().replace(/\s+/g, "_")] || row[header] || "";
      rowData[header] = value;
    });
    return rowData;
  });

  // Create worksheet from data
  const worksheet = XLSX.utils.json_to_sheet(worksheetData);

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

  // Generate Excel file as array buffer
  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  return new Uint8Array(excelBuffer);
};

// Download CSV file
export const downloadCSV = (csvContent: string, filename: string): void => {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// Download Excel file using xlsx library
export const downloadExcel = (
  excelBuffer: Uint8Array,
  filename: string
): void => {
  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const link = document.createElement("a");

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.xlsx`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// Prepare users data for export
export const prepareUsersForExport = (users: UserBio[]): ExportUserData[] => {
  return users.map((user) => ({
    Name: user.name,
    Username: user.username,
    Role: user.role,
    Phone: user.phone,
    Email: user.email,
    "Referral Code": user.referral_code,
    Country: user.country_code,
    Status: user.status === 1 ? "Active" : "Suspended",
    "Created At": new Date(user.created_at).toLocaleDateString(),
  }));
};

// Cache for referral code lookups to avoid duplicate API calls
const referralCodeCache = new Map<string, string>();

// Prepare agents data for export with optimized referrer name lookup
export const prepareAgentsForExport = async (
  agents: Agent[]
): Promise<ExportAgentData[]> => {
  // First, collect all unique referral codes
  const uniqueReferralCodes = new Set<string>();
  agents.forEach((agent) => {
    if (agent.ref_by && agent.ref_by.trim()) {
      uniqueReferralCodes.add(agent.ref_by.trim());
    }
  });

  // Fetch all unique referral codes in parallel
  const referralCodePromises = Array.from(uniqueReferralCodes).map(
    async (code) => {
      if (referralCodeCache.has(code)) {
        return { code, name: referralCodeCache.get(code)! };
      }

      try {
        const referrerResponse = await getUserByReferralCode(code);
        const name =
          referrerResponse.success && referrerResponse.data?.user
            ? referrerResponse.data.user.name
            : "N/A";

        // Cache the result
        referralCodeCache.set(code, name);
        return { code, name };
      } catch (error) {
        console.warn(`Failed to fetch referrer for code ${code}:`, error);
        referralCodeCache.set(code, "N/A");
        return { code, name: "N/A" };
      }
    }
  );

  // Wait for all referral code lookups to complete
  const referralResults = await Promise.all(referralCodePromises);
  const referralMap = new Map(
    referralResults.map(({ code, name }) => [code, name])
  );

  // Now process all agents with the cached referral names
  return agents.map((agent) => {
    const referrerName =
      agent.ref_by && agent.ref_by.trim()
        ? referralMap.get(agent.ref_by.trim()) || "N/A"
        : "N/A";

    return {
      Name: agent.name,
      "Business Name": agent.business_name,
      "Role/Model": `${agent.type} / ${agent.model || ""}`,
      "Residual Amount": agent.residual_amount || 0,
      "Primary Phone": agent.phone || "N/A",
      "Business Phone": agent.business_phone || "N/A",
      "Referred By": `${
        agent.ref_by ? `${referrerName} - ${agent.ref_by}` : "N/A"
      }`,
      Status:
        agent.status === 1
          ? "Active"
          : agent.status === 2
          ? "Suspended"
          : agent.status === 3
          ? "Rejected"
          : "Pending",
      "KYC Status": agent.temp === 1 ? "Completed" : "InComplete",
      Address: agent.address,
      Region: agent.region || null,
      District: agent.district,
      Latitude: agent.latitude,
      Longitude: agent.longitude,
      "ID Type": agent.id_type || null,
      "ID Document": agent.id_document || null,
      "Business Registration": agent.business_registration || null,
      "Business Image": agent.business_image || null,
      "Address Document": agent.address_document || null,
      "Created At": new Date(agent.created_at).toLocaleDateString(),
    };
  });
};

// Prepare audit logs data for export
export const prepareAuditLogsForExport = (
  logs: AuditLogData[]
): ExportAuditLogData[] => {
  return logs.map((log) => ({
    Table: log.table,
    "Action Type": log.action,
    Description: log.description,
    Reason: log.reason,
    "Performed By": log.performed_by.name,
    Role: log.performed_by.role,
    "IP Address": log.ip_address,
    Time: new Date(log.created_at).toLocaleString(),
  }));
};

// Generic export function with format support
export const exportTableData = (
  data: ExportUserData[] | ExportAgentData[] | ExportAuditLogData[],
  headers: string[],
  filename: string,
  format: "csv" | "excel" = "csv"
): void => {
  if (format === "excel") {
    const excelBuffer = convertToExcel(
      data as unknown as Record<string, unknown>[],
      headers
    );
    downloadExcel(excelBuffer, filename);
  } else {
    const csvContent = convertToCSV(
      data as unknown as Record<string, unknown>[],
      headers
    );
    downloadCSV(csvContent, filename);
  }
};
