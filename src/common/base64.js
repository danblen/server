export function isBase64(s) {
	if (typeof s !== 'string') {
		return false;
	}
	const pattern =
		/^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
	return pattern.test(s);
}

// Python 中使用的 is_base64_data_uri 函数
export function isBase64DataUri(s) {
	if (typeof s !== 'string' || !s.startsWith('data:image/')) {
		return [false, s];
	}

	if (s.includes('base64,')) {
		s = s.split('base64,')[1];
		const pattern =
			/^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
		const isValidBase64 = pattern.test(s);
		return [isValidBase64, s];
	} else {
		return [false, s];
	}
}
