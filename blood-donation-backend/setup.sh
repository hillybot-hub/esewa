#!/bin/bash

echo "🧹 Cleaning up previous installations..."
rm -rf node_modules package-lock.json

echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully!"
    echo "🚀 Starting the server..."
    npm run dev
else
    echo "❌ Installation failed. Trying alternative approach..."
    
    # Install core packages individually
    npm install express@4.18.2 mongoose@8.0.0 bcryptjs@2.4.3 jsonwebtoken@9.0.2 cors@2.8.5 dotenv@16.3.1
    
    # Install remaining packages
    npm install express-validator@7.0.1 multer@1.4.5-lts.1 nodemailer@6.9.7 axios@1.6.0
    
    # Install dev dependencies
    npm install --save-dev nodemon@3.0.2
    
    echo "✅ Alternative installation completed!"
    echo "🚀 Starting the server..."
    npm run dev
fi