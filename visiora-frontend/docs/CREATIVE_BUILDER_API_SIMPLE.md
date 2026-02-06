# Creative Builder - Simple API List

## 📥 GET APIs (Data Fetch)

### 1. Get Platform Options
```
GET /api/creative-builder/platforms
```
**Response:**
```json
{
  "platforms": [
    {
      "id": "ig",
      "name": "Instagram Ads",
      "aspect_ratio": "4:5",
      "dimensions": "1080x1350"
    },
    {
      "id": "fb",
      "name": "Facebook Ads",
      "aspect_ratio": "1:1",
      "dimensions": "1200x1200"
    },
    {
      "id": "gg",
      "name": "Google Ads",
      "aspect_ratio": "1:1",
      "dimensions": "1200x1200"
    },
    {
      "id": "sm",
      "name": "Social Media",
      "aspect_ratio": "1:1",
      "dimensions": "1080x1080"
    }
  ]
}
```

### 2. Get User's Projects List
```
GET /api/creative-builder/projects
```
**Response:**
```json
{
  "projects": [
    {
      "id": "uuid-123",
      "product_name": "Premium T-Shirt",
      "platform": "ig",
      "status": "completed",
      "thumbnail_url": "https://...",
      "created_at": "2026-02-03T10:00:00Z"
    }
  ]
}
```

### 3. Get Specific Project Details
```
GET /api/creative-builder/projects/{project_id}
```
**Response:**
```json
{
  "id": "uuid-123",
  "product_name": "Premium T-Shirt",
  "product_image_url": "https://...",
  "product_price": 99.99,
  "special_offer": "50% OFF",
  "offer_price": 49.99,
  "platform": "ig",
  "headline": "Elevate Your Style",
  "cta": "Shop Now",
  "caption": "Transform your wardrobe...",
  "hashtags": ["#Fashion", "#Style"],
  "status": "completed",
  "brand_assets": {
    "logo_url": "https://...",
    "colors": ["#FF5733", "#333333"],
    "fonts": ["Poppins", "Roboto"]
  }
}
```

### 4. Get Caption Suggestions (Optional - for pre-filled options)
```
GET /api/creative-builder/caption-templates?tone=Professional
```
**Response:**
```json
{
  "templates": [
    "✨ Premium quality meets style. Shop now! #Fashion",
    "🔥 Transform your look today. Limited time offer! #Style"
  ]
}
```

---

## 📤 POST APIs (Create/Generate)

### 1. Upload Product Image (Step 1)
```
POST /api/creative-builder/upload
Content-Type: multipart/form-data
```
**Request:**
```
product_image: File
product_url: "https://shopify.com/product/123" (optional)
product_name: "Premium Cotton T-Shirt"
brand_logo: File (optional)
brand_colors: ["#FF5733", "#333333"] (optional)
brand_fonts: ["Poppins"] (optional)
```
**Response:**
```json
{
  "upload_id": "uuid-456",
  "image_url": "https://storage.../image.jpg",
  "message": "Upload successful"
}
```

### 2. Save Configuration (Step 2)
```
POST /api/creative-builder/configure
```
**Request:**
```json
{
  "upload_id": "uuid-456",
  "product_price": 99.99,
  "special_offer": "50% OFF",
  "offer_price": 49.99,
  "selected_platform": "ig"
}
```
**Response:**
```json
{
  "configuration_id": "uuid-789",
  "project_id": "uuid-123",
  "message": "Configuration saved"
}
```

### 3. Generate AI Caption (Step 3)
```
POST /api/creative-builder/generate-caption
```
**Request:**
```json
{
  "project_id": "uuid-123",
  "tone": "Professional",
  "product_name": "Premium Cotton T-Shirt",
  "platform": "ig"
}
```
**Response:**
```json
{
  "caption": "✨ Elevate your everyday look with premium style.",
  "hashtags": ["#Fashion", "#Style", "#Premium"],
  "generation_id": "uuid-caption-001"
}
```

---

## 🔄 PUT APIs (Update)

### 1. Update Creative Content (Step 3)
```
PUT /api/creative-builder/projects/{project_id}
```
**Request:**
```json
{
  "headline": "New Headline Text",
  "cta_label": "Buy Now",
  "caption": "Updated caption text...",
  "visual_styles": {
    "colors": ["#FF5733"],  
    "fonts": ["Poppins"],
    "overlay": "modern",
    "filter": "warm"
  }
}
```
**Response:**
```json
{
  "updated": true,
  "preview_url": "https://storage.../preview.jpg",
  "message": "Creative updated successfully"
}
```

---

## ❌ DELETE APIs (Optional)

### 1. Delete Project
```
DELETE /api/creative-builder/projects/{project_id}
```
**Response:**
```json
{
  "deleted": true,
  "message": "Project deleted successfully"
}
```

---

## 🔐 Authentication
**All APIs require:**
```
Headers:
  Authorization: Bearer <jwt_token>
```

---

## 📊 Summary

| API | Method | Purpose | When Used |
|-----|--------|---------|-----------|
| `/platforms` | GET | Get platform options | Step 2 - Page Load |
| `/projects` | GET | List user's projects | Dashboard/History |
| `/projects/{id}` | GET | Get project details | Edit existing project |
| `/upload` | POST | Upload product image | Step 1 - Upload |
| `/configure` | POST | Save pricing & platform | Step 2 - Goals |
| `/generate-caption` | POST | Generate AI caption | Step 3 - Edit |
| `/projects/{id}` | PUT | Update creative | Step 3 - Edit |
| `/projects/{id}` | DELETE | Delete project | User action |

---

## 🎯 Typical Flow

1. **User opens Step 1 (Upload)**
   - Frontend shows upload form
   - User uploads image → `POST /upload`

2. **User moves to Step 2 (Goals)**
   - Frontend loads platforms → `GET /platforms`
   - User fills form → `POST /configure`

3. **User moves to Step 3 (Edit)**
   - User generates caption → `POST /generate-caption`
   - User edits headline/CTA → `PUT /projects/{id}`

4. **User exports/downloads** (Future)
   - Generate final image → `POST /export` (not implemented yet)

---

## 📝 Notes
cccc----->>>>>>>>>><<<<<<<<>>>>>>>>
- **GET APIs** are used to fetch data (platforms, projects, details)
- **POST APIs** re used to create new data (upload, configure, generate)
- **PUT APIs** are used to update existing data (edit creative)
- **DELETE APIs** are used to remove data (delete project)

All APIs return JSON format and require authentication!
