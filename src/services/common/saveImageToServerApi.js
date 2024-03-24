import { saveBase64Image } from '../../common/file.js';
import { ENV } from '../../config/index.js';

export async function saveImageToServer() {
  try {
    let response = await axios.post(
      `${ENV.SERVER_HOST}:${ENV.SERVER_PORT}/${ENV.API_TYPE}/saveImageToServerApi`,
      data
    );
    if (response.success) {
      return { success: true, message: 'Image saved successfully' };
    } else {
      return { success: false, message: 'Error in saving image' };
    }
  } catch (error) {
    return { success: false, message: 'Error in saving image' };
  }
}

export default async (req) => {
  const { imageBase64, dir, filename } = req.body;
  let res = await saveBase64Image(imageBase64, dir, filename);
  if (!res) {
    return {
      success: true,
      message: 'Image saved successfully',
    };
  } else {
    return {
      success: false,
      message: 'Error saving image',
    };
  }
};
