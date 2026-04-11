# UNIT TESTING REQUIREMENTS

## 1. Unit Testing Report

### 1.1 Tools and Libraries
- Xác định testing framework sử dụng (ví dụ: JUnit, PyTest, Jest).
- Liệt kê các thư viện hỗ trợ (ví dụ: Mockito, Coverage.py, JaCoCo).

---

### 1.2 Scope of Testing

#### Các thành phần ĐƯỢC kiểm thử
- Liệt kê các hàm (functions), lớp (classes) hoặc tệp (files) sẽ được kiểm thử.

#### Các thành phần KHÔNG kiểm thử
- Liệt kê các hàm, lớp hoặc tệp không cần kiểm thử.
- Giải thích lý do (ví dụ: không chứa logic, chỉ là interface, DTO,...).

---

### 1.3 Unit Test Cases

- Tổ chức test case theo:
  - Tên tệp (file)
  - Hoặc tên lớp (class)

- Mỗi test case phải bao gồm:
  - **Test Case ID**
  - **Test Objective** (mục tiêu kiểm thử)
  - **Input**
  - **Expected Output**
  - **Notes** (nếu có)

---

### 1.4 Project Link
- Cung cấp link GitHub chứa:
  - Source code
  - Unit test scripts

---

### 1.5 Execution Report
- Tóm tắt kết quả kiểm thử:
  - Tổng số test case
  - Số lượng pass / fail

- Đính kèm minh chứng:
  - Screenshot kết quả chạy test
  - Console output hoặc test runner

---

### 1.6 Code Coverage Report
- Sử dụng công cụ đo coverage (ví dụ: JaCoCo, Coverage.py).
- Báo cáo:
  - % coverage (line, branch,...)

- Đính kèm:
  - Screenshot report

---

### 1.7 Tài liệu tham khảo & Prompt
- Liệt kê tài liệu đã tham khảo
- Danh sách prompt đã sử dụng (nếu có)

---

## 2. Yêu cầu về Unit Test Scripts

### 2.1 Comment
- Code phải có comment rõ ràng
- Mỗi test case cần có comment chứa **Test Case ID**

---

### 2.2 Naming Convention
- Đặt tên biến, hàm có ý nghĩa rõ ràng
- Tên test nên mô tả:
  - Chức năng
  - Điều kiện
  - Kết quả mong đợi

---

### 2.3 Check Database (CheckDB)
- Với các test liên quan đến database:
  - Phải kiểm tra dữ liệu trong DB sau khi thực thi
  - Đảm bảo dữ liệu được thay đổi đúng như mong đợi

---

### 2.4 Rollback
- Với các test có thay đổi DB:
  - Phải rollback sau khi test
  - Đảm bảo dữ liệu DB trở về trạng thái ban đầu
  - Tránh ảnh hưởng đến các test khác

---

## 3. Tổng kết

- Unit test phải đảm bảo:
  - Độc lập
  - Có thể chạy lại nhiều lần
  - Dễ hiểu, dễ bảo trì