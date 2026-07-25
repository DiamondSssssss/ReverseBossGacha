# Deploy ReverseBossGacha (giống GameBanCa — chỉ frontend tĩnh)

Domain: **https://bossgacha.storyoftri.xyz**  
Server: `vutri@115.73.218.193`  
Nhánh deploy: `deploy/develop`  
Docker Hub image: `bossgacha-frontend`  
Port trên VPS: frontend `25568` (không đụng BongMa `25566` / GameBanCa `25567`)

Game này **không có backend Docker** (Guest = localStorage; account cloud = Supabase bên ngoài).

---

## 1) GitHub Secrets (repo ReverseBossGacha)

Settings → Secrets and variables → Actions → New repository secret:

| Secret | Giá trị |
|--------|---------|
| `DOCKERHUB_USERNAME` | User Docker Hub (cùng GameBanCa) |
| `DOCKERHUB_PASSWORD` | Access token / password Docker Hub |
| `SSH_PRIVATE_KEY` | Private key SSH vào VPS (`vutri`) |
| `SSH_PASS` | Mật khẩu sudo của `vutri` trên VPS |

Secrets theo **từng repo** — phải thêm lại vào repo này dù đã có ở GameBanCa.

---

## 2) DNS

Bản ghi **A**:

- Host: `bossgacha`
- Trỏ về: `115.73.218.193`

Đợi DNS lên rồi mới Certbot.

---

## 3) Chuẩn bị trên VPS (SSH một lần)

```bash
ssh vutri@115.73.218.193
mkdir -p ~/projects/ReverseBossGacha
```

Copy nginx bootstrap từ máy local:

```powershell
cd "d:\Hoc hanh\ReverseBossGacha"
scp nginx/bossgacha.storyoftri.xyz.http-bootstrap.conf vutri@115.73.218.193:~/
```

Trên VPS:

```bash
sudo cp ~/bossgacha.storyoftri.xyz.http-bootstrap.conf /etc/nginx/sites-available/bossgacha.storyoftri.xyz
sudo ln -sf /etc/nginx/sites-available/bossgacha.storyoftri.xyz /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d bossgacha.storyoftri.xyz
```

Sau Certbot, có thể thay bằng file HTTPS đầy đủ:

```bash
# scp nginx/bossgacha.storyoftri.xyz.conf rồi:
sudo cp ~/bossgacha.storyoftri.xyz.conf /etc/nginx/sites-available/bossgacha.storyoftri.xyz
sudo nginx -t && sudo systemctl reload nginx
```

---

## 4) Tạo repo GitHub + đẩy nhánh deploy

```powershell
cd "d:\Hoc hanh\ReverseBossGacha"
git init
git add .
git commit -m "Initial Reverse Boss Gacha + Docker deploy"
# Tạo repo trống trên GitHub rồi:
git remote add origin https://github.com/<USER>/ReverseBossGacha.git
git branch -M main
git push -u origin main
git checkout -b deploy/develop
git push -u origin deploy/develop
```

Hoặc bấm **Actions → Deploy ReverseBossGacha → Run workflow**.

---

## 5) Kiểm tra sau deploy

```bash
ssh vutri@115.73.218.193
cd ~/projects/ReverseBossGacha
export DOCKERHUB_USER=<user-dockerhub>
sudo -E docker compose ps
curl -sI http://127.0.0.1:25568/
```

Trình duyệt: https://bossgacha.storyoftri.xyz

---

## Luồng CI/CD

1. Push `deploy/develop`
2. GitHub build → push `bossgacha-frontend:latest` lên Docker Hub
3. SSH VPS → `docker compose pull && up -d`
4. Nginx host proxy `bossgacha.storyoftri.xyz` → `127.0.0.1:25568`

---

## So với GameBanCa

| | GameBanCa | ReverseBossGacha |
|--|-----------|------------------|
| Domain | gamebanca.storyoftri.xyz | bossgacha.storyoftri.xyz |
| Frontend port | 25567 | **25568** |
| Backend | có (3006) | **không** (static + Supabase) |
| Images | banca-backend + banca-frontend | chỉ **bossgacha-frontend** |

---

## Supabase (đăng nhập cloud) — tùy chọn

Sau khi site lên HTTPS, điền `js/config.js` (URL + anon key), chạy `supabase/schema.sql`, rồi commit + push lại `deploy/develop`.  
Trong Supabase Auth: thêm URL site vào Redirect / Site URL nếu cần.
