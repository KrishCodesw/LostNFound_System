package com.example.backend.service;

import com.example.backend.entity.ClaimRequest;
import com.example.backend.entity.InventoryItem;
import com.example.backend.entity.Item;
import com.example.backend.entity.User;
import com.example.backend.repository.ClaimRequestRepository;
import com.example.backend.repository.InventoryItemRepository;
import com.example.backend.repository.ItemRepository;
import com.example.backend.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;


@Service
@AllArgsConstructor
public class ExportService {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final UserRepository userRepository;
    private final ItemRepository itemRepository;
    private final ClaimRequestRepository claimRequestRepository;
    private final InventoryItemRepository inventoryItemRepository;

    @Transactional
    public byte[] buildWorkbook() {
        List<User> users = userRepository.findAll();
        List<Item> items = itemRepository.findAll();
        List<ClaimRequest> claims = claimRequestRepository.findAll();
        List<InventoryItem> inventory = inventoryItemRepository.findAll();

        try (XSSFWorkbook workbook = new XSSFWorkbook()) {
            CellStyle headerStyle = headerStyle(workbook);

            writeUsersSheet(workbook, headerStyle, users);
            writeItemsSheet(workbook, headerStyle, items);
            writeClaimsSheet(workbook, headerStyle, claims);
            writeInventorySheet(workbook, headerStyle, inventory);
            writeAnalyticsSheet(workbook, headerStyle, users, items, claims, inventory);

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new UncheckedIOException("Failed to build export workbook", e);
        }
    }

    private void writeUsersSheet(Workbook wb, CellStyle headerStyle, List<User> users) {
        Sheet sheet = wb.createSheet("Users");
        writeHeader(sheet, headerStyle, "ID", "Name", "Email", "Role", "Auth Type", "Phone Number");
        int r = 1;
        for (User u : users) {
            Row row = sheet.createRow(r++);
            row.createCell(0).setCellValue(u.getId());
            row.createCell(1).setCellValue(nullSafe(u.getName()));
            row.createCell(2).setCellValue(nullSafe(u.getEmail()));
            row.createCell(3).setCellValue(u.getRole() != null ? u.getRole().name() : "");
            row.createCell(4).setCellValue(u.getAuthType() != null ? u.getAuthType().name() : "");
            row.createCell(5).setCellValue(u.getPhoneNumber() != null ? u.getPhoneNumber().toString() : "");

        }
        autoSize(sheet, 6);
    }

    private void writeItemsSheet(Workbook wb, CellStyle headerStyle, List<Item> items) {
        Sheet sheet = wb.createSheet("Items");
        writeHeader(sheet, headerStyle, "ID", "Type", "Title", "Status", "Category", "Reported By", "Location", "Date Reported");
        int r = 1;
        for (Item i : items) {
            Row row = sheet.createRow(r++);
            row.createCell(0).setCellValue(i.getId());
            row.createCell(1).setCellValue(nullSafe(i.getType()));
            row.createCell(2).setCellValue(nullSafe(i.getTitle()));
            row.createCell(3).setCellValue(i.getStatus() != null ? i.getStatus().name() : "");
            row.createCell(4).setCellValue(i.getCategory() != null ? nullSafe(i.getCategory().getName()) : "");
            row.createCell(5).setCellValue(i.getReportedBy() != null ? nullSafe(i.getReportedBy().getEmail()) : "");
            row.createCell(6).setCellValue(nullSafe(i.getLocation()));
            row.createCell(7).setCellValue(i.getDateReported() != null ? i.getDateReported().format(DATE_FMT) : "");
        }
        autoSize(sheet, 8);
    }

    private void writeClaimsSheet(Workbook wb, CellStyle headerStyle, List<ClaimRequest> claims) {
        Sheet sheet = wb.createSheet("Claims");
        writeHeader(sheet, headerStyle, "ID", "Item", "Claimant Email", "Status", "Proof Description");
        int r = 1;
        for (ClaimRequest c : claims) {
            Row row = sheet.createRow(r++);
            row.createCell(0).setCellValue(c.getId());
            row.createCell(1).setCellValue(c.getItem() != null ? nullSafe(c.getItem().getTitle()) : "");
            row.createCell(2).setCellValue(c.getClaimant() != null ? nullSafe(c.getClaimant().getEmail()) : "");
            row.createCell(3).setCellValue(c.getStatus() != null ? c.getStatus().name() : "");
            row.createCell(4).setCellValue(nullSafe(c.getProofDescription()));
        }
        autoSize(sheet, 5);
    }

    private void writeInventorySheet(Workbook wb, CellStyle headerStyle, List<InventoryItem> inventory) {
        Sheet sheet = wb.createSheet("Inventory");
        writeHeader(sheet, headerStyle, "ID", "Name", "Category", "Quantity", "Location", "Created By", "Updated By", "Created At", "Updated At");
        int r = 1;
        for (InventoryItem inv : inventory) {
            Row row = sheet.createRow(r++);
            row.createCell(0).setCellValue(inv.getId());
            row.createCell(1).setCellValue(nullSafe(inv.getName()));
            row.createCell(2).setCellValue(inv.getCategory() != null ? nullSafe(inv.getCategory().getName()) : "");
            row.createCell(3).setCellValue(inv.getQuantity() != null ? inv.getQuantity() : 0);
            row.createCell(4).setCellValue(nullSafe(inv.getLocation()));
            row.createCell(5).setCellValue(inv.getCreatedBy() != null ? nullSafe(inv.getCreatedBy().getEmail()) : "");
            row.createCell(6).setCellValue(inv.getUpdatedBy() != null ? nullSafe(inv.getUpdatedBy().getEmail()) : "");
            row.createCell(7).setCellValue(inv.getCreatedAt() != null ? inv.getCreatedAt().format(DATE_FMT) : "");
            row.createCell(8).setCellValue(inv.getUpdatedAt() != null ? inv.getUpdatedAt().format(DATE_FMT) : "");
        }
        autoSize(sheet, 9);
    }

    private void writeAnalyticsSheet(Workbook wb, CellStyle headerStyle, List<User> users, List<Item> items,
                                      List<ClaimRequest> claims, List<InventoryItem> inventory) {
        Sheet sheet = wb.createSheet("Analytics Summary");
        writeHeader(sheet, headerStyle, "Metric", "Value");
        int r = 1;

        r = writeMetric(sheet, r, "Total items reported", items.size());
        r = writeGroupCounts(sheet, r, "Items by status", items, i -> i.getStatus() != null ? i.getStatus().name() : "UNKNOWN");
        r = writeGroupCounts(sheet, r, "Items by type", items, i -> nullSafe(i.getType()).isEmpty() ? "UNKNOWN" : i.getType());
        r = writeGroupCounts(sheet, r, "Items by category", items,
                i -> i.getCategory() != null ? nullSafe(i.getCategory().getName()) : "UNCATEGORIZED");

        r = writeMetric(sheet, r, "Total claims", claims.size());
        r = writeGroupCounts(sheet, r, "Claims by status", claims, c -> c.getStatus() != null ? c.getStatus().name() : "UNKNOWN");

        r = writeMetric(sheet, r, "Total users", users.size());
        r = writeGroupCounts(sheet, r, "Users by role", users, u -> u.getRole() != null ? u.getRole().name() : "UNKNOWN");
        r = writeGroupCounts(sheet, r, "Users by auth type", users, u -> u.getAuthType() != null ? u.getAuthType().name() : "UNKNOWN");

        r = writeMetric(sheet, r, "Total inventory line items", inventory.size());
        long totalQuantity = inventory.stream().mapToLong(i -> i.getQuantity() != null ? i.getQuantity() : 0).sum();
        writeMetric(sheet, r, "Total inventory quantity", totalQuantity);

        autoSize(sheet, 2);
    }

    private <T> int writeGroupCounts(Sheet sheet, int startRow, String label, List<T> source, Function<T, String> classifier) {
        Map<String, Long> counts = source.stream()
                .collect(Collectors.groupingBy(classifier, Collectors.counting()));
        int r = startRow;
        for (Map.Entry<String, Long> entry : counts.entrySet().stream()
                .sorted(Comparator.comparing(Map.Entry::getKey)).toList()) {
            r = writeMetric(sheet, r, label + " - " + entry.getKey(), entry.getValue());
        }
        return r;
    }

    private int writeMetric(Sheet sheet, int row, String label, long value) {
        Row r = sheet.createRow(row);
        r.createCell(0).setCellValue(label);
        r.createCell(1).setCellValue(value);
        return row + 1;
    }


private void writeHeader(Sheet sheet, CellStyle style, String... columns) {
        Row header = sheet.createRow(0);
        for (int i = 0; i < columns.length; i++) {
            Cell cell = header.createCell(i);
            cell.setCellValue(columns[i]);
            cell.setCellStyle(style);
        }
    }

    private CellStyle headerStyle(Workbook wb) {
        Font font = wb.createFont();
        font.setBold(true);
        CellStyle style = wb.createCellStyle();
        style.setFont(font);
        return style;
    }

    private void autoSize(Sheet sheet, int columnCount) {
        for (int i = 0; i < columnCount; i++) {
            sheet.autoSizeColumn(i);
        }
    }

    private String nullSafe(String value) {
        return value == null ? "" : value;
    }
}
