import fetchInstatusEndpoint from "./baseFetcher";
export function getInstatusComponents() {
    return fetchInstatusEndpoint("GET", "/components");
}
export function createInstatusComponent(component) {
    return fetchInstatusEndpoint("POST", "/components", component);
}
export function deleteInstatusComponent(componentId) {
    return fetchInstatusEndpoint("DELETE", `/components/${componentId}`).then(() => void 0);
}
