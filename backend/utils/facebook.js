const axios = require('axios');
const FormData = require('form-data');
const sharp = require('sharp');
const config = require('../utils/config');
const logger = require('../utils/logger');

const pageAccessToken = config.FACEBOOK_PAGE_ACCESS_TOKEN;
const pageId = config.FACEBOOK_PAGE_ID;

function isValidUrl(url) {
  try {
    return Boolean(new URL(url));
  } catch (error) {
    return false;
  }
}

async function refreshToken() {
  try {
    const response = await axios.get(
      `https://graph.facebook.com/oauth/access_token?grant_type=fb_exchange_token&client_id=${config.FACEBOOK_APP_ID}&client_secret=${config.FACEBOOK_APP_SECRET}&fb_exchange_token=${config.FACEBOOK_PAGE_ACCESS_TOKEN}`
    );

    if (response.data && response.data.access_token) {
      const newAccessToken = response.data.access_token;
       logger.info("✅ Successfully refreshed access token.");
      return newAccessToken;
    } else {
      logger.error("❌ Failed to refresh access token:", response.data);
      throw new Error("Failed to refresh access token");
    }
  } catch (error) {
    logger.error("❌ Error refreshing access token:", error);
    throw error;
  }
}

async function addWatermark(imageUrl, watermarkCaption) {
  try {
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 15000,
    });

    const imageBuffer = Buffer.from(response.data);
    const imageMetadata = await sharp(imageBuffer).metadata();
    const imageWidth = imageMetadata.width || 800;
    const imageHeight = imageMetadata.height || 600;


const svgText = `
  <svg width="${imageWidth}" height="60" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="shadow">
        <feDropShadow dx="2" dy="2" stdDeviation="2" flood-color="black" flood-opacity="0.5"/>
      </filter>
    </defs>

    <rect 
      x="0" 
      y="30" 
      width="${imageWidth}" 
      height="30" 
      rx="10" 
      ry="10" 
      fill="rgba(30, 40, 10, 0.3)"
    />

    <text 
      x="50%" 
      y="50" 
      text-anchor="middle"
      font-size="16"
      font-weight="bold"
      font-family="Arial, sans-serif"
      fill="white"
      filter="url(#shadow)">
      ${watermarkCaption}
    </text>
  </svg>
`;
    const buffer = await sharp(imageBuffer)
      .composite([{ input: Buffer.from(svgText), top: imageHeight - 50, left: 10 }])
      .png()
      .toBuffer();

    return buffer;
  } catch (error) {
    logger.error("❌ Error adding watermark:", error.message || error);
    throw error;
  }
}

async function postToFacebook(motor) {
  if (!pageAccessToken) {
    logger.error("❌ Facebook page access token is not configured.");
    return;
  }

  if (!pageId) {
    logger.error("❌ Facebook page ID is not configured.");
    return;
  }

  const imageUrl = motor.images?.[0];
  console.info("📸 Image posted to Facebook:", imageUrl);

  const message = `New car added: ${motor.model} ${motor.year}\nPrice: ${motor.price}\n📌 ${motor.otherDescription || ''}`;

  if (imageUrl && isValidUrl(imageUrl)) {
    try {

      if (!pageAccessToken) {
        pageAccessToken = await refreshToken();
        logger.info("🔄 Refreshed Facebook page access token.");
      }

       const watermarkCaption = `${motor.model}. ${motor.year} - \n$${motor.price}`;
       logger.info("💧 Adding watermark with caption:", watermarkCaption);

      const watermarkedImageBuffer = await addWatermark(imageUrl, watermarkCaption);
     
      const form = new FormData();
      form.append('file', watermarkedImageBuffer, {
        filename: 'watermarked_image.png',
        contentType: 'image/png',
      });
      form.append('caption', message);
      form.append('access_token', pageAccessToken);

      const response = await axios.post(
        `https://graph.facebook.com/${pageId}/photos`,
        form,
        { headers: form.getHeaders(), timeout: 20000 }
      );

      logger.info("✅ Successfully posted photo to Facebook:", response.data);
    } catch (error) {
      logger.error("❌ Failed to post photo:", error.response?.data || error.message);
    }
  } else {
    try {
      const postData = {
        message,
        access_token: pageAccessToken,
      };

      const response = await axios.post(
        `https://graph.facebook.com/${pageId}/feed`,
        postData
      );

      logger.info("✅ Successfully posted text to Facebook:", response.data);
    } catch (error) {
      logger.error("❌ Text post error:", error.response?.data || error.message);
    }
  }
}

module.exports = { postToFacebook };
