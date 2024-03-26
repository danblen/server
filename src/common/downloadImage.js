import https from 'https';

export async function downloadImageToBase64(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (response) => {
        const chunks = [];
        response.on('data', (chunk) => {
          chunks.push(chunk);
        });
        response.on('end', () => {
          const buffer = Buffer.concat(chunks);
          const base64 = buffer.toString('base64');
          resolve(base64);
        });
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}
