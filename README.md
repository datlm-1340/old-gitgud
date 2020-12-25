# gitgud

## Giới thiệu

Extension `gitgud` được tạo ra với mục đích giảm bớt công việc review PR cho dev, gíup phát hiện ra những vấn đề trong PR dựa theo một checklist chung, `gitgud` có thể:

* Dựa vào checklist có sẵn và có thể cập nhật liên tục để tìm ra những lỗi có trong PR, ngoài ra có thể warning về những vấn đề có thể xảy ra.
* Checklist có thể quy định được cho từng loại file, và có thể sử dụng `regex` để có thể bắt được những đoạn code cụ thể để có thể cảnh báo và nhắc nhở dev.
* Hiển thị cây thư mục của PR và di chuyển giữa các file trong PR.
* Có thể sử dụng extension với nhiều repository khác nhau với các checklist riêng biệt.

## Hướng dẫn sử dụng

### Cài đặt

**1, `npm`**

- Clone repo về máy sau đó chạy:

```
$ cd gitgud
$ npm install
$ npm run build
```

- Đi đến `chrome://extensions/`, bật `Developer mode` và chọn `Load unpacked`.
- Chọn thư mục `../gitgud/build` và chọn select.
- Extension sẽ được load thành công.

**2, Sử dụng bản build sẵn.**

- Liên hệ ĐạtLM để lấy bản build sẵn , sau đó cài đặt qua `chrome://extensions/` như trên.

### Thêm repository mới

**1, Tạo checklist mới (Đối với một repo chưa từng sử dụng)**

- `gitgud` phiên bản hiện tại đang sử dụng API Google Sheets thông qua một third-party app là [Sheety](https://sheety.co/), app này sẽ biến Google Sheets thành một server API đơn giản để truy xuất dữ liệu.
- Do đó, để tạo một checklist mới cần tạo một sheets mới bằng cách Make A Copy từ file [template](https://docs.google.com/spreadsheets/d/1rEpsc0gRFy0ikqhbLmG95EwWcFOezxnYsBcIDk-dcPw/edit?usp=sharing). Chú ý với tên của repository phải trùng với tên sheet.
- Truy cập [Sheety](https://dashboard.sheety.co/) và login với tài khoản Google có quyền đọc file checklist vừa tạo (nên sử dụng account của công ty). 
- Chọn `New Project` -> `From Google Sheet...`
- Gắn link sheet checklist vừa tạo, ở đây có thể thay đổi tên của Project, tên của sheets (tên repo) sẽ được tự động fill và sẽ được hiểu là một endpoint của API.
- Ở đây có một số setting nhưng mình chỉ cần quan tâm tới URL của GET. Đi tới URL để xem API của chúng ta đã hoạt động chưa.
- Để đảm bảo bảo mật thì bắt buộc phải setting Basic Authentication. Để làm vậy, ta ấn vào tab Authentication, chọn `Basic`, điền Username và Password sau đó ấn `Save Changes`.

**2, Kết nối `gitgud` với API**

- Truy cập repository cần setting trên github.
- Ấn vào extension gitgud trên thanh Extensions của Chrome.
- Ấn vào `settings`, sau đó ở ô `Choose Repository` chọn `Add new repository`. Sau đó điền các thông tin vừa tạo vào các field bên dưới:
    + Repository: Link github của repo dự án.
    + Endpoint: Endpoint GET chúng ta vừa tạo ở Sheety.
    + Username/Password: Thông tin basic authentication mà ta vừa tạo.
- Ấn `Save settings`

### Cách sử dụng

- Khi đã kết nối với API thì mỗi khi có thay đổi gì trong Checklist, ấn `Sync` để update theo checklist mới nhất.
- Khi cập nhật checklist ở Google Sheet thì cần chú ý vài điểm sau:
    + Cột `type`: Danger là 1, Warning là 0.
    + Cột `pattern`: pattern của phần code cần thông báo (có thể viết regex dạng `([A-Z])\w+` )
    + Cột `note`: Message thông báo.
    + Cột `file`: loại file cần review (`js`, `rb`, `html`).
    + Cột `regex`: 1 là có sử dụng, 0 là không sử dụng (sẽ tìm chính xác từ ở cột `pattern`)
- Một khi đã setting đầy đủ, để sử dụng ta chỉ việc vào các PR và `gitgud` sẽ tự động đặt các warning ở những thay đổi match với các pattern được định nghiã trong checklist. 
- Có thể ấn `M` để mở cây thư mục và điều hướng giữa các file.

Có tham khảo chức năng cây thư mục của [https://github.com/irek02/chrome-github-code-review](https://github.com/irek02/chrome-github-code-review)
