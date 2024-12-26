const WEATHER_API_KEY = 'da2103b2c4ce4f95af051626232503';
const BASE_URL = 'https://api.weatherapi.com/v1';

export async function fetchWeather(location: string) {
  try {
    const response = await fetch(
      `${BASE_URL}/forecast.json?key=${WEATHER_API_KEY}&q=${location}&days=7&aqi=yes`
    );

    // Check if response is OK (status code 200-299)
    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Optional: Log the structure of the data returned by the API
    console.log("Fetched weather data:", data);

    return data;
  } catch (error) {
    // Handle fetch errors
    console.error("Error fetching weather data:", error);
    throw error; // Rethrowing to handle it in the calling function
  }
}