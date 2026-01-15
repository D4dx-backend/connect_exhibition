export const normalizeMediaUrl = (input) => {
  if (!input || typeof input !== 'string') return '';
  let value = input.trim();
  if (!value) return '';

  if (value.startsWith('data:')) {
    return value;
  }

  if (value.startsWith('//')) {
    value = `https:${value}`;
  }

  if (!/^https?:\/\//i.test(value)) {
    return value;
  }

  try {
    const url = new URL(value);
    const hostParts = url.hostname.split('.');
    if (hostParts.length > 1 && hostParts[0] === hostParts[1]) {
      hostParts.splice(1, 1);
      url.hostname = hostParts.join('.');
    }
    if (url.pathname.startsWith('/%2F') || url.pathname.startsWith('/%2f')) {
      url.pathname = `/${url.pathname.slice(3)}`;
    }
    return url.toString();
  } catch (error) {
    return value;
  }
};

