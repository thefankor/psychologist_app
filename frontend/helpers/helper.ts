export const hidePart = (text: string, n: number, format?: string) => {
	const replaced = text.substring(n);
	return format ? format : '***' + replaced;
};

export const formatTime = (timeInSeconds: number): string => {
	const minutes = Math.floor(timeInSeconds / 60);
	const seconds = timeInSeconds % 60;

	const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
	const formattedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;

	return `${formattedMinutes}:${formattedSeconds}`;
};
