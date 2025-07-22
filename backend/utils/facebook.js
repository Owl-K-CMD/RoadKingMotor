const { facebook } = require('facebook-node-sdk');
const User = require('../module/user');
const Facebook = require('facebook-node-sdk');
const config = require('../utils/config');

async function postToFacebook(motor, userId) {
  try {
    const user = await User.findById(userId);
    if (!user || !user.facebookAccessToken) {
      console.warn(`No Facebook access token found for user ${userId}. Skipping facebook post.`);
      return;
    }
      const pageAccessToken = config.FACEBOOK_PAGE_ACCESS_TOKEN;
      const pageId = config.FACEBOOK_PAGE_ID;

      if (!pageAccessToken || !pageId) {
        console.error("Facebook page access token or ID is not configured.");
        return;
      
    }

    const fb = new Facebook({ accessToken: pageAccessToken });

    const postData = {
      message: `Check out this new car: ${motor.model} ${motor.year} - ${motor.price} ! ${motor.otherDescription || ''}`,
      picture: motor.images[0],
    };

    const response = await fb.api(`${pageId}/feed`, 'post', postData);
    console.log('Successfully posted to Facebook:', response);
    return response;
  } catch (apiError) {
    console.error('Error posting to Facebook:', apiError);
    throw new error(`Facebook API Error: ${apiError.message}`);
  }
}

module.exports = { postToFacebook };
