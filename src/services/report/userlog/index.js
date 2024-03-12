import { wxConfig } from '../../../config/wxConfig.js';

import axios from 'axios';
import prisma from '../../../db/prisma.js';
/**
 * 登录，现在只有微信登录
 * @param event
 * @param context
 */
export default async (req, res) => {
  try {
    const { userId } = req.body;
    // await prisma.userLog
    return { data: res.data };
  } catch (error) {
    console.error('获取 access_token 失败：', error);
  }
};
