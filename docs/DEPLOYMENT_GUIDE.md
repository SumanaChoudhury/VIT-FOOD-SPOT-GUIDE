# VIT Food Spot Guide — Production Deployment Manual

This guide provides end-to-end instructions for deploying the **VIT Food Spot Guide** application to production environments.

---

## 1. Architecture & Deployment Checklist

The application consists of:
- **Runtime:** Node.js 18+ (Node 20 LTS recommended).
- **Web Framework:** Express 5.
- **Frontend:** Vanilla HTML5, CSS3, jQuery 4.0 served as static assets from `client/`.
- **Database Engine:**
  - **Embedded SQLite:** Default self-contained relational storage at `./data/vit_food_spots.db`. Requires zero external services or configuration.
  - **Optional External MySQL:** Configurable via environment variables (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME`).
- **Academic Demo Engine:** Java 21 LTS + SQLite JDBC Driver (in `academic-demos/jdbc/`).

---

## 2. Option A: Free & Instant Cloud Deployment (Render.com) — *Recommended for Quick Hosting*

[Render](https://render.com/) offers free-tier hosting with automatic git-push deployments and free SSL certificates.

### Step-by-Step:
1. **Push Code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit for VIT Food Spot Guide"
   git remote add origin https://github.com/<your-username>/vit-food-spot-guide.git
   git push -u origin main
   ```
2. **Create a New Web Service on Render:**
   - Log into [Render Dashboard](https://dashboard.render.com/).
   - Click **New +** $\rightarrow$ **Web Service**.
   - Connect your GitHub repository.
3. **Configure Build & Start Settings:**
   - **Name:** `vit-food-spot-guide`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. **Environment Variables:**
   Under **Advanced** $\rightarrow$ **Add Environment Variable**:
   | Variable | Value |
   | :--- | :--- |
   | `NODE_ENV` | `production` |
   | `PORT` | `10000` (or leave default, Render sets `PORT` automatically) |
   | `SESSION_SECRET` | `a_strong_random_secret_string` |
5. Click **Create Web Service**. Your application will be live at `https://vit-food-spot-guide.onrender.com` in 2–3 minutes with HTTPS enabled.

---

## 3. Option B: Virtual Private Server (Ubuntu / Debian / AWS EC2 / DigitalOcean)

For maximum performance, uptime, and custom domain configuration.

### Prerequisites:
- Ubuntu 22.04 / 24.04 LTS server with root or sudo access.
- Point your domain's DNS `A` record (e.g. `food.vit.ac.in` or `yourdomain.com`) to the server's public IP.

### Step 1: Install Node.js, Git & Build Tools
```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git build-essential nginx
```

### Step 2: Clone and Setup Application
```bash
sudo mkdir -p /var/www/vit-food-guide
sudo chown -R $USER:$USER /var/www/vit-food-guide
cd /var/www/vit-food-guide

# Clone or transfer your project files here
git clone https://github.com/<your-username>/vit-food-spot-guide.git .

# Install dependencies
npm ci --only=production
```

### Step 3: Run Process with PM2
Install PM2 process manager for continuous background execution and automatic recovery on server reboots:
```bash
sudo npm install -g pm2
pm2 start server/server.js --name "vit-food-guide"
pm2 save
pm2 startup
```

### Step 4: Configure Nginx as Reverse Proxy
Create a new Nginx configuration file:
```bash
sudo nano /etc/nginx/sites-available/vit-food-guide
```
Paste the following configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```
Enable the site and reload Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/vit-food-guide /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 5: Secure with Free SSL Certificate (Certbot / Let's Encrypt)
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## 4. Option C: Docker Container Deployment

The project includes a production-ready `Dockerfile` and `docker-compose.yml`.

### Build & Run with Docker Compose:
```bash
docker compose up -d --build
```
The application will launch on `http://localhost:5000` with persistent volume mounting for the SQLite database at `./data`.

### Single Container Run:
```bash
docker build -t vit-food-guide .
docker run -d -p 5000:5000 --name vit-food-app -v $(pwd)/data:/app/data vit-food-guide
```

---

## 5. Verification Commands

After deployment, verify all services are active:
```bash
# 1. Check HTTP Health
curl -I http://localhost:5000/api/health

# 2. Check Food Spots Directory API
curl http://localhost:5000/api/food-spots

# 3. Check XML Dynamic Export
curl http://localhost:5000/api/export/xml
```
