# 🦖 Dino Runner Game

Một game chạy nhảy kinh điển với giao diện hiện đại và nhiều tính năng thú vị!

## 🎮 Tính năng chính

### 🎯 Gameplay

- **Chạy và nhảy**: Điều khiển khủng long chạy và nhảy qua các chướng ngại vật
- **Powerups**: Thu thập powerups vàng để có khả năng bất tử tạm thời
- **Combo System**: Tạo combo để nhận điểm thưởng
- **Boss Battles**: Đối đầu với boss khó khăn
- **Tăng tốc**: Tốc độ tăng dần theo thời gian và điểm số

### 🎨 Giao diện mới

- **Menu chính**: Giao diện menu đẹp mắt với các tùy chọn
- **Hướng dẫn**: Modal hướng dẫn chơi game chi tiết
- **Bảng xếp hạng**: Lưu trữ và hiển thị top 10 điểm cao nhất
- **Cài đặt**: Tùy chỉnh âm thanh, độ khó và theme
- **Pause Menu**: Tạm dừng game và quay lại menu chính
- **Game Over Screen**: Hiển thị thống kê và tùy chọn chơi lại
- **Loading Screen**: Màn hình loading với animation

### 🎛️ Cài đặt

- **Âm thanh**: Bật/tắt hiệu ứng âm thanh
- **Nhạc nền**: Bật/tắt nhạc nền (placeholder)
- **Độ khó**: Easy, Normal, Hard
- **Theme**: Default, Night Mode, Retro

### 📱 Responsive Design

- Tương thích với mọi kích thước màn hình
- Tối ưu cho mobile và desktop
- Giao diện thích ứng tự động

## 🚀 Cách chơi

### Điều khiển

- **SPACE** hoặc **CLICK**: Nhảy
- **ESC**: Tạm dừng game

### Mục tiêu

- Nhảy qua cây xương rồng và đá
- Thu thập powerups vàng để có khả năng bất tử
- Tạo combo để nhận điểm thưởng
- Sống sót qua các trận boss

### Hệ thống điểm

- Điểm cơ bản tăng theo thời gian
- Combo bonus: +100 điểm mỗi 3 chướng ngại vật
- Tốc độ tăng mỗi 30 giây

## 🛠️ Công nghệ sử dụng

- **HTML5**: Cấu trúc trang web
- **CSS3**: Styling và animations
- **JavaScript ES6+**: Logic game và tương tác
- **LocalStorage**: Lưu trữ điểm cao và cài đặt
- **Google Fonts**: Font Orbitron cho giao diện

## 📁 Cấu trúc dự án

```
nzaoo_dino_game/
├── index.html          # Trang chính
├── styles.css          # CSS styles
├── script.js           # Logic game chính
├── dino.js            # Logic khủng long
├── cactus.js          # Logic chướng ngại vật
├── ground.js          # Logic mặt đất
├── powerup.js         # Logic powerups
├── boss.js            # Logic boss
├── updateCustomProperty.js
├── imgs/              # Thư mục hình ảnh
│   ├── dino-run-0.png
│   ├── dino-run-1.png
│   ├── dino-stationary.png
│   ├── dino-lose.png
│   ├── cactus.png
│   ├── ground.png
│   └── rock.png
└── README.md          # Hướng dẫn này
```

## 🎯 Tính năng nâng cao

### Hệ thống Combo

- Tạo combo khi nhảy qua nhiều chướng ngại vật liên tiếp
- Hiệu ứng visual khi đạt combo
- Điểm thưởng cho combo

### Boss System

- Boss xuất hiện theo điểm số
- Boss bắn đạn
- Tạm dừng spawn chướng ngại vật khi boss xuất hiện

### Powerup System

- Powerups vàng cho khả năng bất tử
- Hiệu ứng visual khi active
- Thời gian bất tử có giới hạn

### Theme System

- **Default**: Giao diện sáng với màu xanh
- **Night Mode**: Giao diện tối với màu xanh đậm
- **Retro**: Giao diện retro với màu nâu

## 🔧 Cài đặt và chạy

1. Clone hoặc download dự án
2. Mở file `index.html` trong trình duyệt
3. Hoặc sử dụng local server:

   ```bash
   # Sử dụng Python
   python -m http.server 8000

   # Sử dụng Node.js
   npx serve .
   ```

## 🎨 Tùy chỉnh

### Thêm theme mới

1. Thêm CSS variables trong `:root`
2. Tạo class `.theme-yourtheme`
3. Thêm option trong HTML select
4. Cập nhật logic trong JavaScript

### Thêm powerup mới

1. Tạo logic trong `powerup.js`
2. Thêm hình ảnh vào thư mục `imgs/`
3. Cập nhật CSS cho hiệu ứng

### Thêm boss mới

1. Tạo logic trong `boss.js`
2. Thêm hình ảnh boss
3. Cập nhật pattern tấn công

## 📊 Hiệu suất

- Sử dụng `requestAnimationFrame` cho smooth animation
- Tối ưu collision detection
- Lazy loading cho assets
- Responsive design cho mọi thiết bị

## 🐛 Báo lỗi và đóng góp

Nếu bạn tìm thấy lỗi hoặc muốn đóng góp tính năng mới:

1. Fork dự án
2. Tạo branch mới
3. Commit changes
4. Tạo Pull Request

## 📄 License

Dự án này được phát hành dưới MIT License.

## 🙏 Cảm ơn

Cảm ơn bạn đã chơi game! Hy vọng bạn thích những tính năng mới này.

---

**Chúc bạn chơi game vui vẻ! 🎮✨**
