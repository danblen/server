export const inpaitParam = {
  init_images: [], // Original image address
  denoising_strength: 0.4, // Range 0-1, smaller value closer to original image. Larger value more likely to let imagination fly
  prompt:
    '(8k, RAW photo, best quality, masterpiece:1.2),(realistic, photo-realistic:1.37),ultra-detailed,(high detailed skin:1.2),',
  negative_prompt:
    '(nfsw:1.5),public nudity,EasyNegative,ng_deepnegative_v1_75t,bad-image-v2-39000,bad-artist,bad-hands-5,bad_prompt_version2,bad-artist-anime,(worst quality, low quality:1.4),(painting by bad-artist-anime:0.9),(painting by bad-artist:0.9),(bad_prompt_version2:0.8),(disfigured),(bad art),(deformed),(poorly drawn),(extra limbs),(close up),strange colours,blurry,boring,lackluster,letters,grayscale,huge breasts,large breasts jpeg artifacts,(signature),watermark,username,artist name,bad anatomy,',
  //   prompt: '<lora:pytorch_lora_weights:1>',
  negative_prompt: 'EasyNegative',
  mask: '', //base64蒙版图片，宽高必须和init_images一致
  mask_blur: 4,
  mask_blur_x: 4,
  mask_blur_y: 4,
  inpainting_mask_invert: 0,
  inpaint_full_res: 1, //["Whole picture", "Only masked"]
  inpainting_fill: 1, //['fill', 'original', 'latent noise', 'latent nothing']
  inpaint_full_res_padding: 32,
  seed: -1, // Initial seed
  batch_size: 1, // How many images generated each time
  n_iter: 1, // number of iterations
  steps: 3, // Number of runs, this value can be fine tuned, converging when too high, max 150 in webui, maybe can go higher here?
  cfg_scale: 1, // Influence of prompt text on image, usually 5-15, max 30 in webui, can fine tune
  restore_faces: false, // Whether to correct faces, for 3D, test later if open or not. Suggest false for now
  sampler_name: 'DPM++ 2M Karras',
  sampler_index: 'DPM++ 2M Karras', // or "DPM++ 2M Karras"
  override_settings: {
    sd_model_checkpoint: 'AWPainting_v1.3.safetensors [5a44dad2e0]',
    // sd_model_checkpoint:
    // 'Chilloutmix-Ni-pruned-fp16-fix.safetensors [59ffe2243a]',
    sd_vae: 'Automatic',
  },
  alwayson_scripts: {
    controlnet: {
      args: [
        {
          enabled: true,
          module: 'canny', //invert (from white bg & black line)
          model: 'control_v11p_sd15_canny [d14c016b]',
          // module: 'openpose_full',//animal_openpose/densepose (pruple bg & purple torso)/densepose_parula (black bg & blue torso)/dw_openpose_full/openpose/openpose_face/openpose_faceonly/openpose_hand
          // model: 'control_v11p_sd15_openpose_fp16 [73c2b67d]',
          // module: 'depth_midas',//depth_anything/depth_hand_refiner/depth_leres/depth_leres++/depth_midas/depth_zoe
          // model: 'control_v11f1p_sd15_depth_fp16 [4b72d323]',
          // module: 'lineart_standard (from white bg & black line)',//lineart_anime/lineart_anime_denoise/lineart_coarse/lineart_realistic/invert (from white bg & black line)
          // model: 'control_v11p_sd15s2_lineart_anime_fp16 [c58f338b]',
          // module: 'tile_resample',//tile_colorfix+sharp/tile_colorfix/blur_gaussian
          // model: 'control_v11f1e_sd15_tile [a371b31b]',
          // module: 'ip-adapter_clip_sd15', //proce:ip-adapter_clip_sd15/ip-adapter_face_id/ip-adapter_face_id_plus
          // model: 'ip-adapter_sd15_plus [32cd8f7f]',//ip-adapter-full-face_sd15 [3459c5eb]
          // module: 'Instant_ID',
          weight: 1.0,
          image: '',
          resize_mode: 1,
          low_vram: true,
          processor_res: 512,
          threshold_a: 64,
          threshold_b: 64,
          guidance_start: 0.0,
          guidance_end: 1.0,
          pixel_perfect: true,
          control_mode: 0,
        },
      ],
    },
  },
};
