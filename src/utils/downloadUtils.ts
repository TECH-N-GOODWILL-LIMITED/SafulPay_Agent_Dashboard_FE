import { UserBio, Agent, AuditLogData } from "../types/types";

// Convert data to CSV format
export const convertToCSV = (data: any[], headers: string[]): string => {
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

// Prepare users data for export
export const prepareUsersForExport = (users: UserBio[]): any[] => {
  return users.map((user) => ({
    Name: user.name,
    Username: user.username,
    Phone: user.phone,
    Email: user.email,
    Role: user.role,
    Status: user.status === 1 ? "Active" : "Suspended",
    "Referral Code": user.referral_code,
    Country: user.country_code,
    "Created At": new Date(user.created_at).toLocaleDateString(),
  }));
};

// Prepare agents data for export
export const prepareAgentsForExport = (agents: Agent[]): any[] => {
  return agents.map((agent) => ({
    Name: agent.name,
    "Business Name": agent.business_name,
    "Role/Model": `${agent.type} / ${agent.model || "N/A"}`,
    "Residual Amount": agent.residual_amount || 0,
    "Primary Phone": agent.phone || "N/A",
    "Business Phone": agent.business_phone || "N/A",
    "Referred By": agent.ref_by || "N/A",
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
    Region: agent.region,
    District: agent.district,
    Latitude: agent.latitude,
    Longitude: agent.longitude,
    "ID Type": agent.id_type,
    "ID Document": agent.id_document,
    "Business Registration": agent.business_registration,
    "Business Image": agent.business_image,
    "Address Document": agent.address_document,
    "Created At": new Date(agent.created_at).toLocaleDateString(),
  }));
};

// Prepare audit logs data for export
export const prepareAuditLogsForExport = (logs: AuditLogData[]): any[] => {
  return logs.map((log) => ({
    "Action Type": log.action,
    Table: log.table,
    Reason: log.reason,
    Description: log.description,
    "Performed By": log.performed_by.name,
    Role: log.performed_by.role,
    "IP Address": log.ip_address,
    Time: new Date(log.created_at).toLocaleString(),
  }));
};

// Generic export function
export const exportTableData = (
  data: any[],
  headers: string[],
  filename: string
): void => {
  const csvContent = convertToCSV(data, headers);
  downloadCSV(csvContent, filename);
};
