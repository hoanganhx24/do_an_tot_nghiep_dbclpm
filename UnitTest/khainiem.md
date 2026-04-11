# 5.3 KIỂM THỬ ĐƠN VỊ

## 5.3.1 Khái niệm

Kiểm thử đơn vị (Unit Test) là quá trình kiểm tra các thành phần nhỏ nhất của hệ thống như hàm, phương thức hoặc lớp một cách độc lập nhằm đảm bảo chúng hoạt động đúng theo thiết kế.

Mục tiêu của kiểm thử đơn vị là:
- Phát hiện lỗi sớm trong quá trình phát triển
- Đảm bảo tính đúng đắn của từng thành phần
- Hỗ trợ việc bảo trì và nâng cấp hệ thống

---

## 5.3.2 Xây dựng bộ test case

Bộ test case cho kiểm thử đơn vị được xây dựng dựa trên các chức năng chính của hệ thống.  
Mỗi chức năng sẽ được phân tích thành các trường hợp kiểm thử khác nhau nhằm bao phủ các tình huống có thể xảy ra, bao gồm:

- Trường hợp dữ liệu hợp lệ
- Trường hợp dữ liệu không hợp lệ
- Trường hợp biên (edge cases)
- Các tình huống đặc biệt liên quan đến logic xử lý

Đối với mỗi phương thức trong các lớp xử lý dữ liệu (DAO), cần xác định:
- Input đầu vào
- Điều kiện thực thi
- Kết quả mong đợi (expected output)

Việc xây dựng test case cần đảm bảo mức độ bao phủ đủ lớn, đặc biệt là bao phủ các nhánh logic quan trọng trong chương trình.

---

## 5.3.3 Cài đặt kiểm thử đơn vị

Việc kiểm thử đơn vị được thực hiện bằng framework JUnit.  
Tất cả các class (trừ interface) đều cần được viết unit test.

Quy trình thực hiện gồm các bước:

- **Bước 1:** Thiết kế test case  
  Xác định các bộ dữ liệu đầu vào và kết quả mong đợi dựa trên tài liệu thiết kế.

- **Bước 2:** Cài đặt test  
  Với mỗi test case:
  - Chuẩn bị dữ liệu đầu vào
  - Gọi phương thức cần kiểm thử
  - So sánh kết quả thực tế với kết quả mong đợi
  - Kiểm tra sự thay đổi dữ liệu (nếu có liên quan đến database)

- **Bước 3:** Đánh giá kết quả  
  - Thống kê số lượng test pass/fail  
  - Phân tích nguyên nhân các trường hợp fail

---

## 5.3.4 Lưu ý

- Cần chuẩn bị môi trường test riêng (database, dữ liệu mẫu)
- Không làm ảnh hưởng đến dữ liệu thật
- Sử dụng cơ chế rollback sau mỗi test để đảm bảo tính độc lập
- Test phải có khả năng chạy lại nhiều lần với kết quả ổn định

---

## 5.3.5 Kết luận

Kiểm thử đơn vị là bước quan trọng nhằm đảm bảo chất lượng phần mềm ngay từ mức thấp nhất. Việc xây dựng đầy đủ test case và thực hiện kiểm thử tự động giúp hệ thống hoạt động ổn định và dễ dàng mở rộng trong tương lai.