export const request = async (url, body, method = 'POST', authenticateToken = null) => {
  let headers = {
    'Content-Type': 'application/json',
  };

  if (authenticateToken) {
    headers['Authorization'] = `Bearer ${authenticateToken}`;
  }

  const response = await fetch(url, {
    method,
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    console.log(response.errorMessage);
    return null;
  }

  return await response.json();
};
