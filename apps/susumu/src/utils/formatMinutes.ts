export const formatMinutes = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  let text = '';

  if (hours > 0) {
    text += `${hours}h `;
  }

  if (remainingMinutes > 0) {
    text += `${remainingMinutes}min`;
  }

  return text;
};
