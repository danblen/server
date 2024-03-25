import axios from 'axios';
import { saveBase64Image } from '../../common/file.js';
import { ENV, STATIC_DIR } from '../../config/index.js';

export async function saveImageToServer({ imageBase64, dir, filename }) {
  try {
    let url = `${ENV.SERVER_HOST}/v1/saveImageToServerApi`;
    let response = await axios.post(url, { imageBase64, dir, filename });
    if (response?.data?.success) {
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
  let res = await saveBase64Image(imageBase64, STATIC_DIR + dir, filename);
  if (res) {
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
