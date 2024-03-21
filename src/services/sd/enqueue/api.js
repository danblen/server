import axios from 'axios';
import { ENV } from '../../../config/index.js';
export const api = {};
api.txt2img = async (sdParams) => {
  let response = await axios.post(
    `${ENV.GPU_HOST}/agent-scheduler/v1/queue/txt2img`,
    sdParams
  );
  return response;
};
api.img2img = async (sdParams) => {
  let response = await axios.post(
    `${ENV.GPU_HOST}/agent-scheduler/v1/queue/img2img`,
    sdParams
  );
  return response;
};
api.queue = async (sdParams) => {
  let response = await axios.post(
    `${ENV.GPU_HOST}/agent-scheduler/v1/queue`,
    sdParams
  );
  return response.data;
};
api.getTask = async (id) => {
  let response = await axios.get(
    `${ENV.GPU_HOST}/agent-scheduler/v1/task/${id}`
  );
  return response;
};
api.getTaskResults = async (id) => {
  let response = await axios.get(
    `${ENV.GPU_HOST}/agent-scheduler/v1/results/${id}`
  );
  return response;
};
api.getTaskPosition = async (sdParams, id) => {
  let response = await axios.post(
    `${ENV.GPU_HOST}/agent-scheduler/v1/task/${id}/position`,
    sdParams
  );
  return response.data;
};
