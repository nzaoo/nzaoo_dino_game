<!-- Commit 21: Thêm comment nhỏ tiếp tục tăng số lượng commit -->

# Dino Runner Game

Một game chạy nhảy đơn giản với nhân vật khủng long, được viết bằng HTML, CSS và JavaScript.

## Cách chạy game

### Phương pháp 1: Sử dụng Python (Khuyến nghị)

```bash
# Mở terminal/command prompt trong thư mục game
python -m http.server 8000
# Sau đó mở trình duyệt và truy cập: http://localhost:8000
```

### Phương pháp 2: Sử dụng Node.js

```bash
# Cài đặt http-server nếu chưa có
npm install -g http-server
# Chạy server
http-server
```

### Phương pháp 3: Sử dụng Live Server (VS Code)

1. Cài đặt extension "Live Server" trong VS Code
2. Click chuột phải vào file `index.html`
3. Chọn "Open with Live Server"

## Cách chơi

- **Nhảy**: Nhấn phím SPACE hoặc click chuột
- **Tạm dừng**: Nhấn phím ESC
- **Mục tiêu**: Tránh các chướng ngại vật (cây xương rồng, đá)
- **Thu thập**: Các power-up để tăng điểm và khả năng đặc biệt

## Khắc phục sự cố

### Game không chạy được?

1. **Kiểm tra console**: Mở Developer Tools (F12) và xem có lỗi gì không
2. **Chạy test**: Mở file `test.html` để kiểm tra các file có sẵn không
3. **Kiểm tra server**: Đảm bảo bạn đang chạy game qua HTTP server, không mở trực tiếp file HTML

### Lỗi âm thanh?

- Game sẽ hoạt động bình thường ngay cả khi không có file âm thanh
- Các lỗi âm thanh sẽ được ghi log trong console

### Lỗi hình ảnh?

- Game sử dụng các hình ảnh có sẵn trong thư mục `imgs/`
- Nếu thiếu hình ảnh, game sẽ sử dụng hình ảnh mặc định

## Cấu trúc file

```
nzaoo_dino_game/
├── index.html          # Trang chính của game
├── script.js           # Logic chính của game
├── dino.js             # Xử lý nhân vật khủng long
├── cactus.js           # Xử lý chướng ngại vật
├── ground.js           # Xử lý mặt đất
├── powerup.js           # Xử lý power-up
├── boss.js             # Xử lý boss
├── updateCustomProperty.js # Utility functions
├── styles.css          # CSS styles
├── test.html           # File test
├── README.md           # Hướng dẫn này
└── imgs/               # Thư mục hình ảnh
    ├── dino-run-0.png
    ├── dino-run-1.png
    ├── dino-stationary.png
    ├── dino-lose.png
    ├── cactus.png
    ├── ground.png
    └── rock.png
```

## Tính năng

- ✅ Menu chính với nhiều tùy chọn
- ✅ 3 chế độ chơi: Hard, Endless, Time Attack
- ✅ Hệ thống combo và điểm số
- ✅ Power-up system
- ✅ Boss battles
- ✅ Leaderboard
- ✅ Settings và themes
- ✅ Responsive design
- ✅ Sound effects (tùy chọn)

## Hỗ trợ

Nếu gặp vấn đề, hãy:

1. Kiểm tra console trong Developer Tools
2. Đảm bảo chạy game qua HTTP server
3. Thử mở file `test.html` để kiểm tra

<!-- Commit 14: Thêm comment nhỏ ở cuối file -->

```

```
