export default function getCountrData(premium = false) {
    return fetch(premium ? COUNTR_PREMIUM_API_ENDPOINT : COUNTR_API_ENDPOINT)
        .then(res => res.json())
        .catch(() => null);
}
