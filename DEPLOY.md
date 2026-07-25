# Deploy ReverseBossGacha (giống GameBanCa)

Domain: **https://bossgacha.storyoftri.xyz**  
Server: `vutri@115.73.218.193`  
Nhánh: `deploy/develop`  
Images: `bossgacha-backend`, `bossgacha-frontend`  
Ports VPS: backend **3007**, frontend **25568**

Auth: **username / password / tên hiển thị** (SQLite + JWT) — giống GameBanCa, không dùng email Supabase.

---

## 1) GitHub Secrets

| Secret | Giá trị |
|--------|---------|
| `DOCKERHUB_USERNAME` | Docker Hub user |
| `DOCKERHUB_PASSWORD` | Docker Hub token |
| `SSH_PRIVATE_KEY` | SSH key vào VPS |
| `SSH_PASS` | sudo password `vutri` |

---

## 2) DNS

A record: `bossgacha` → `115.73.218.193`

---

## 3) VPS một lần

```bash
ssh vutri@115.73.218.193
mkdir -p ~/projects/ReverseBossGacha/data
```

`.env` (CI cũng tự tạo nếu thiếu):

```env
JWT_SECRET=chuoi-bi-mat-dai
PORT=3001
NODE_ENV=production
```

Nginx: copy `nginx/bossgacha.storyoftri.xyz.http-bootstrap.conf` → sites-available, Certbot `-d bossgacha.storyoftri.xyz`, rồi có thể dùng file HTTPS đầy đủ (đã proxy `/api/` → `:3007`).

**Nếu site đã có SSL từ trước:** cập nhật lại file nginx để thêm `location /api/` trỏ `127.0.0.1:3007`, rồi `sudo nginx -t && sudo systemctl reload nginx`.

---

## 4) Push deploy

```powershell
cd "d:\Hoc hanh\ReverseBossGacha"
git add .
git commit -m "Add username auth backend + deploy like GameBanCa"
git push origin deploy/develop
```

---

## 5) Kiểm tra

```bash
curl -s http://127.0.0.1:3007/api/health
curl -sI http://127.0.0.1:25568/
```

Trên web: Đăng ký username + mật khẩu + tên hiển thị → chơi → Đăng nhập máy khác thấy cùng tiến trình.

---

## So sánh GameBanCa

| | GameBanCa | ReverseBossGacha |
|--|-----------|------------------|
| Domain | gamebanca… | bossgacha… |
| Backend port | 3006 | **3007** |
| Frontend port | 25567 | **25568** |
| Auth | user/pass/displayName | **giống** |
| DB | SQLite volume | SQLite `~/projects/ReverseBossGacha/data` |
