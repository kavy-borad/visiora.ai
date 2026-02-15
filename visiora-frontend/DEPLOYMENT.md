# Deploying Ephotocart to a Production VPS (Ubuntu)

This guide will help you deploy your Next.js application to a VPS (Virtual Private Server) like DigitalOcean, AWS EC2, or Hostinger.

## Prerequisites
- A VPS running **Ubuntu 20.04** or **22.04/24.04**.
- **Root access** (or sudo user) to the server.
- A **Domain Name** (e.g., ephotocart.com) pointing to your server's IP address.

---

## Step 1: Login to your Server
Open your terminal (PowerShell or Git Bash) and SSH into your server:
```bash
ssh root@YOUR_SERVER_IP
```

---

## Step 2: Install Required Software (Node.js, Nginx, PM2)
Run these commands one by one to set up the environment:

```bash
# 1. Update system
sudo apt update && sudo apt upgrade -y

# 2. Install Node.js (Version 20.x)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 3. Check version (Should be v20+)
node -v

# 4. Install Nginx (Web Server)
sudo apt install -y nginx

# 5. Install Git & PM2 (Process Manager)
sudo apt install -y git
sudo npm install -g pm2
```

---

## Step 3: Clone Your Code
```bash
# Navigate to web directory
cd /var/www

# Clone your repository (Replace with your actual GitHub URL)
git clone https://github.com/YOUR_GITHUB_USERNAME/ephotocart-frontend.git html

# Enter the directory
cd html
```
> **Note:** If `html` folder already exists, remove it first: `sudo rm -rf /var/www/html`

---

## Step 4: Install Dependencies & Build
```bash
# 1. Install project dependencies
npm install

# 2. Build the production app
npm run build
```

---

## Step 5: Start the App with PM2
We use PM2 to keep your app running in the background 24/7.

```bash
# Start Next.js on port 3000
pm2 start npm --name "ephotocart" -- start

# Save the list so it restarts on reboot
pm2 save
pm2 startup
```

---

## Step 6: Configure Nginx (Reverse Proxy)
We need Nginx to forward public traffic (Port 80) to your Next.js app (Port 3000).

1. Open the config file:
```bash
sudo nano /etc/nginx/sites-available/default
```

2. **Delete everything** in the file and paste this:
   (Use arrow keys to move, Backspace to delete)

```nginx
server {
    listen 80;
    server_name YOUR_DOMAIN.COM www.YOUR_DOMAIN.COM;  # Replace with your actual domain

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
> **Tip:** If you don't have a domain yet, use `server_name _;` (underscore) to allow access via IP address.

3. Save and Exit:
   - Press `Ctrl + X`
   - Press `Y`
   - Press `Enter`

4. Restart Nginx:
```bash
sudo systemctl restart nginx
```

Now satisfy visit `http://YOUR_SERVER_IP` or `http://YOUR_DOMAIN.COM`. Your site should be live!

---

## Step 7: Add HTTPS (SSL Certificate) - Optional but Recommended
Secure your site with a free Let's Encrypt SSL certificate.

```bash
# 1. Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# 2. Obtain Certificate (Follow the prompts)
sudo certbot --nginx -d YOUR_DOMAIN.COM -d www.YOUR_DOMAIN.COM
```
Done! Your site will now work on HTTPS.

---

## Updates (How to deploy changes later)
When you make changes to your code on your PC:
1. Push changes to GitHub: `git push`
2. SSH into your server: `ssh root@...`
3. Run these update commands:
```bash
cd /var/www/html
git pull
npm install
npm run build
pm2 restart ephotocart
```
