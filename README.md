# Hệ thống đặt lịch khám chữa bệnh trực tuyến

Backend API RESTful cho hệ thống đặt lịch khám chữa bệnh, sử dụng Node.js và Express.js.

## Tính năng

- ✅ Đăng ký và đăng nhập người dùng
- ✅ JWT Authentication với Access Token và Refresh Token
- ✅ Quản lý chuyên khoa và bác sĩ
- ✅ Xem lịch khám có sẵn
- ✅ Đặt lịch khám cho bản thân hoặc người thân
- ✅ Quản lý thành viên gia đình
- ✅ Xem số thứ tự và thông tin đặt lịch
- ✅ Hủy đặt lịch
- ✅ Swagger UI để test API

## Cài đặt

```bash
npm install
```

## Cấu hình

Tạo file `.env` với nội dung:

```
PORT=3000
NODE_ENV=development
JWT_SECRET=your-secret-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d
```

## Chạy ứng dụng

### Development mode (với nodemon)

```bash
npm run dev
```

### Production mode

```bash
npm start
```

Server sẽ chạy tại `http://localhost:3000`

## Swagger UI - Giao diện test API

Truy cập Swagger UI tại: **http://localhost:3000/api-docs**

Tại đây bạn có thể:
- Xem tất cả các API endpoints
- Test API trực tiếp trên trình duyệt
- Xem request/response schemas
- Thử các phương thức GET, POST, PUT, DELETE

## Cấu trúc dự án

```
Backend/
├── config/              # Cấu hình (Swagger, database)
├── controllers/         # Controllers xử lý request/response
├── middleware/          # Middleware (authentication, error handling)
├── models/              # Data models
├── routes/              # Route definitions
├── services/            # Business logic
├── utils/               # Utilities (JWT, seed data)
├── server.js            # File chính
└── package.json
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/refresh` - Làm mới access token
- `POST /api/auth/logout` - Đăng xuất
- `GET /api/auth/profile` - Lấy thông tin profile (cần authentication)

### Specialties (Chuyên khoa)

- `GET /api/specialties` - Lấy danh sách chuyên khoa
- `GET /api/specialties/:id` - Lấy thông tin chuyên khoa
- `GET /api/specialties?search=keyword` - Tìm kiếm chuyên khoa

### Doctors (Bác sĩ)

- `GET /api/doctors` - Lấy danh sách bác sĩ
- `GET /api/doctors/:id` - Lấy thông tin bác sĩ
- `GET /api/doctors?specialtyId=1` - Lọc theo chuyên khoa
- `GET /api/doctors?search=keyword` - Tìm kiếm bác sĩ

### Appointments (Lịch khám)

- `GET /api/appointments/available?specialtyId=1&date=2025-08-03&title=TS. BS` - Lấy danh sách lịch khám có sẵn (cần authentication)

### Bookings (Đặt lịch)

- `GET /api/bookings` - Lấy danh sách đặt lịch của người dùng (cần authentication)
- `GET /api/bookings/:id` - Lấy thông tin đặt lịch (cần authentication)
- `POST /api/bookings` - Đặt lịch khám (cần authentication)
- `POST /api/bookings/:id/cancel` - Hủy đặt lịch (cần authentication)
- `GET /api/bookings/:id/queue` - Lấy thông tin số thứ tự (cần authentication)

### Family Members (Thành viên gia đình)

- `GET /api/family-members` - Lấy danh sách thành viên (cần authentication)
- `GET /api/family-members/:id` - Lấy thông tin thành viên (cần authentication)
- `POST /api/family-members` - Thêm thành viên (cần authentication)
- `PUT /api/family-members/:id` - Cập nhật thành viên (cần authentication)
- `DELETE /api/family-members/:id` - Xóa thành viên (cần authentication)

## Ví dụ sử dụng API

### 1. Đăng ký tài khoản

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "0912345678",
    "email": "user@example.com",
    "password": "password123",
    "fullName": "Nguyễn Văn A",
    "dateOfBirth": "1990-01-01",
    "gender": "Nam",
    "address": "Hà Nội"
  }'
```

### 2. Đăng nhập

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phoneOrEmail": "0912345678",
    "password": "password123"
  }'
```

Response sẽ trả về `accessToken` và `refreshToken`.

### 3. Lấy danh sách chuyên khoa

```bash
curl http://localhost:3000/api/specialties
```

### 4. Lấy lịch khám có sẵn

```bash
curl "http://localhost:3000/api/appointments/available?specialtyId=1&date=2025-08-03&title=TS. BS" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 5. Đặt lịch khám

```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "doctorId": 1,
    "specialtyId": 1,
    "date": "2025-08-03",
    "timeSlot": "10:00",
    "symptoms": "Đau xương, đau khớp",
    "fee": 400000
  }'
```

### 6. Lấy thông tin số thứ tự

```bash
curl http://localhost:3000/api/bookings/1/queue \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 7. Làm mới Access Token

```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

## Authentication

Hầu hết các API endpoints yêu cầu authentication. Sử dụng Bearer Token trong header:

```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

Access Token có thời hạn ngắn (mặc định 15 phút). Khi hết hạn, sử dụng Refresh Token để lấy Access Token mới.

## Dữ liệu mẫu

Khi khởi động server, hệ thống sẽ tự động seed dữ liệu mẫu:
- 5 chuyên khoa
- 5 bác sĩ

Bạn có thể sử dụng dữ liệu này để test API.
