# YelpOut Deployment Guide

## Prerequisites

- Node.js 18+ installed
- PM2 installed globally (`npm install -g pm2`)
- Nginx installed (for reverse proxy)
- Yelp API key (get from https://www.yelp.com/developers)
- Domain name (optional, for production)

## Environment Setup

1. Copy the production environment template:
```bash
cp .env.production .env.local
```

2. Edit `.env.local` with your actual credentials:
```bash
YELP_API_KEY=your_actual_yelp_api_key
SMTP_HOST=smtp.gmail.com  # If using email feature
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

## Build for Production

1. Clean up development logs:
```bash
chmod +x scripts/cleanup-logs.sh
./scripts/cleanup-logs.sh
```

2. Build the application:
```bash
npm run build
```

3. Test the production build locally:
```bash
npm run start
```

## PM2 Deployment

1. Start the application with PM2:
```bash
pm2 start ecosystem.config.js
```

2. Save PM2 configuration:
```bash
pm2 save
```

3. Setup PM2 to start on system boot:
```bash
pm2 startup
# Follow the instructions provided by the command
```

## Nginx Configuration

1. Create Nginx configuration file:
```bash
sudo nano /etc/nginx/sites-available/yelpout
```

2. Add the following configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

3. Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/yelpout /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## SSL/HTTPS Setup (Recommended)

1. Install Certbot:
```bash
sudo apt install certbot python3-certbot-nginx
```

2. Obtain SSL certificate:
```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

3. Certbot will automatically configure Nginx for HTTPS

## Monitoring

### Check PM2 status:
```bash
pm2 status
pm2 logs yelpout
pm2 monit
```

### Check Nginx status:
```bash
sudo systemctl status nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## Maintenance

### Update the application:
```bash
git pull origin main
npm install
npm run build
pm2 restart yelpout
```

### View logs:
```bash
pm2 logs yelpout --lines 100
```

### Restart services:
```bash
pm2 restart yelpout
sudo systemctl restart nginx
```

## Troubleshooting

### Port already in use:
```bash
pm2 delete yelpout
lsof -i :3000
kill -9 <PID>
pm2 start ecosystem.config.js
```

### Permission errors:
```bash
sudo chown -R $USER:$USER /forge/yelpout
chmod -R 755 /forge/yelpout
```

### Nginx 502 Bad Gateway:
```bash
# Check if PM2 is running
pm2 status

# Check Nginx error log
sudo tail -f /var/log/nginx/error.log

# Restart both services
pm2 restart yelpout
sudo systemctl restart nginx
```

## Performance Optimization

1. Enable Nginx gzip compression
2. Configure PM2 cluster mode for multi-core utilization
3. Set up CDN for static assets
4. Implement Redis caching for Yelp API responses
5. Monitor with PM2 Plus for production insights

## Security Checklist

- [ ] Environment variables properly set in `.env.local`
- [ ] `.env.local` added to `.gitignore`
- [ ] HTTPS enabled with valid SSL certificate
- [ ] Nginx security headers configured
- [ ] PM2 running as non-root user
- [ ] Regular backups configured
- [ ] Rate limiting enabled
- [ ] API keys rotated periodically
- [ ] Error logging monitored
- [ ] CORS properly configured

## Backup Strategy

1. Session data (stored in browser localStorage)
2. Application logs (`/forge/yelpout/logs/`)
3. PM2 configuration (`pm2 save`)
4. Nginx configuration (`/etc/nginx/`)
5. Environment variables (`.env.local` - encrypted backup)

## Support

For issues or questions:
- Check logs: `pm2 logs yelpout`
- Review Nginx logs: `/var/log/nginx/`
- Check Yelp API status
- Verify environment variables
- Test with `npm run dev` locally
